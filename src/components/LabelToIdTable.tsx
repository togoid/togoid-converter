import useSWRImmutable from "swr/immutable";
import axios from "axios";
import copy from "copy-to-clipboard";

type Props = {
  pubdictionariesParam: {
    labels: string;
    dictionaries: string;
    tags?: string;
    threshold?: number;
    verbose: boolean;
  };
  dataset: any;
};

const LabelToIdTable = ({ pubdictionariesParam, dataset }: Props) => {
  const setText = useSetAtom(textAtom);

  const { data: tableData } = useSWRImmutable(
    pubdictionariesParam,
    async (key) => {
      const res = await axios.get<any>(
        "https://pubdictionaries.org/find_ids.json",
        {
          params: key,
        },
      );

      const labelList = pubdictionariesParam.labels.split("|");

      return (
        await Promise.all(
          labelList.map(async (label) => {
            const tableBaseData = res.data[label] as any[];

            const preferredDictionary =
              dataset.label_resolver.dictionaries.find(
                (v: any) => v.preferred,
              )?.dictionary;

            const synonymIdList = tableBaseData
              .filter((v: any) => v.dictionary !== preferredDictionary)
              .map((v) => v.identifier);

            const res2 = synonymIdList.length
              ? await axios.get<any>(
                  "https://pubdictionaries.org/find_terms.json",
                  {
                    params: {
                      ids: synonymIdList.join("|"),
                      dictionaries: preferredDictionary,
                    },
                  },
                )
              : null;

            return tableBaseData.map((v) => {
              return {
                label: v.label,
                type: dataset.label_resolver.dictionaries.find(
                  (w: any) => w.dictionary === v.dictionary,
                )?.label,
                symbol:
                  res2?.data[v.identifier] &&
                  v.dictionary !== preferredDictionary
                    ? res2.data[v.identifier][0].label
                    : v.name,
                name:
                  res2?.data[v.identifier] &&
                  v.dictionary !== preferredDictionary
                    ? res2.data[v.identifier][0].label
                    : v.name,
                score: v.score,
                identifier: v.identifier,
              };
            });
          }),
        )
      ).flat();
    },
  );

  const inputResultId = () => {
    if (!tableData) {
      return;
    }

    setText(tableData.map((v) => v.identifier).join("\n"));
  };

  const copyClipboard = async () => {
    if (!tableData) {
      return;
    }

    const table = tableData.map((v) => {
      if (pubdictionariesParam.tags !== undefined) {
        return {
          Input: v.label,
          "Match type": v.type,
          Symbol: v.symbol,
          ID: v.identifier,
        };
      } else {
        return {
          Input: v.label,
          "Match type": v.type,
          Name: v.name,
          Score: v.score,
          ID: v.identifier,
        };
      }
    });
    const text = invokeUnparse(table, "tsv");
    copy(text, {
      format: "text/plain",
    });
  };

  const handleExportCsvTsv = async (extension: "csv" | "tsv") => {
    if (!tableData) {
      return;
    }

    const table = tableData.map((v) => {
      if (pubdictionariesParam.tags !== undefined) {
        return {
          Input: v.label,
          "Match type": v.type,
          Symbol: v.symbol,
          ID: v.identifier,
        };
      } else {
        return {
          Input: v.label,
          "Match type": v.type,
          Name: v.name,
          Score: v.score,
          ID: v.identifier,
        };
      }
    });
    exportCsvTsv(table, extension, `result.${extension}`);
  };

  return (
    <div className="label-to-id-table">
      {tableData && (
        <>
          <div className="buttons">
            <p className="heading">Action</p>
            <button onClick={() => inputResultId()} className="button search">
              Copy to Search
            </button>
            <button
              onClick={() => copyClipboard()}
              className="button clipboard"
            >
              Copy to Clipboard
            </button>
            <button
              className="button"
              onClick={() => handleExportCsvTsv("csv")}
            >
              Download as CSV
            </button>
            <button
              className="button"
              onClick={() => handleExportCsvTsv("tsv")}
            >
              Download as TSV
            </button>
          </div>
          <table className="table">
            <caption className="heading">Showing</caption>
            <thead>
              <tr>
                <th>Input</th>
                <th>Match type</th>
                {pubdictionariesParam.tags !== undefined && <th>Symbol</th>}
                {pubdictionariesParam.threshold !== undefined && (
                  <>
                    <th>Name</th>
                    <th>Score</th>
                  </>
                )}
                <th>ID</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((v, i) => (
                <tr key={i}>
                  <td>{v.label}</td>
                  <td>{v.type}</td>
                  {pubdictionariesParam.tags !== undefined && (
                    <td>{v.symbol}</td>
                  )}
                  {pubdictionariesParam.threshold !== undefined && (
                    <>
                      <td>{v.name}</td>
                      <td>{v.score}</td>
                    </>
                  )}
                  <td>
                    <a
                      href={dataset.prefix + v.identifier}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {v.identifier}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default LabelToIdTable;
