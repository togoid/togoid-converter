import useSWRImmutable from "swr/immutable";
import axios from "axios";
import copy from "copy-to-clipboard";

type Props = {
  pubdictionariesParam: {
    labels: string;
    dictionaries: string;
    tag?: string;
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

      const tableBaseData = res.data[pubdictionariesParam.labels] as any[];

      const preferredDictionary = dataset.label_resolver.dictionaries.find(
        (v: any) => v.preferred,
      )?.dictionary;

      const synonymIdList = tableBaseData
        .filter((v: any) => v.dictionary !== preferredDictionary)
        .map((v) => v.identifier);

      if (!synonymIdList.length) {
        return;
      }

      const res2 = await axios.get<any>(
        "https://pubdictionaries.org/find_terms.json",
        {
          params: {
            ids: synonymIdList.join("|"),
            dictionaries: preferredDictionary,
          },
        },
      );

      return tableBaseData.map((v) => {
        return {
          label: v.label,
          type: dataset.label_resolver.dictionaries.find(
            (w: any) => w.dictionary === v.dictionary,
          )?.label,
          symbol:
            res2.data[v.identifier] && v.dictionary !== preferredDictionary
              ? res2.data[v.identifier][0].label
              : v.symbol,
          score: v.score,
          identifier: v.identifier,
        };
      });
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
      return {
        Input: v.label,
        "Match type": v.type,
        Symbol: v.symbol,
        Score: v.score,
        ID: v.identifier,
      };
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
      return {
        Input: v.label,
        "Match type": v.type,
        Symbol: v.symbol,
        Score: v.score,
        ID: v.identifier,
      };
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
                <th>Symbol</th>
                <th>Score</th>
                <th>ID</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((v, i) => (
                <tr key={i}>
                  <td>{v.label}</td>
                  <td>{v.type}</td>
                  <td>{v.symbol}</td>
                  <td>{v.score}</td>
                  <td>{v.identifier}</td>
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
