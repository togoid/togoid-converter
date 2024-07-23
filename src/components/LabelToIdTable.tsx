import useSWRImmutable from "swr/immutable";
import axios from "axios";
import copy from "copy-to-clipboard";
import NProgress from "nprogress";

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
  useSignals();

  const setText = useSetAtom(textAtom);

  const report = useSignal<"matched" | "unmatched">("matched");

  const { data: tableData, isLoading } = useSWRImmutable(
    pubdictionariesParam,
    async (key) => {
      NProgress.start();
      const res = await axios.get<any>(
        "https://pubdictionaries.org/find_ids.json",
        {
          params: key,
        },
      );

      const labelList = pubdictionariesParam.labels.split("|");

      const result = await Promise.all(
        labelList.map(async (label) => {
          const tableBaseData = res.data[label] as any[];

          const preferredDictionary = dataset.label_resolver.dictionaries.find(
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
                v.dictionary === preferredDictionary
                  ? v.label
                  : res2?.data[v.identifier][0].label,
              name:
                v.dictionary === preferredDictionary
                  ? v.label
                  : res2?.data[v.identifier][0].label,
              score: v.score,
              identifier: v.identifier,
            };
          });
        }),
      );

      NProgress.done();
      return result;
    },
  );

  const tableDataMod = useSignal<NonNullable<typeof tableData>[number]>([]);
  useEffect(() => {
    if (!tableData) {
      return;
    }

    if (report.value === "matched") {
      tableDataMod.value = tableData.flat();
    } else {
      const labelList = pubdictionariesParam.labels.split("|");
      tableDataMod.value = tableData.flatMap((v, i) => {
        return v.length
          ? v
          : {
              label: labelList[i],
              type: "Unmatched",
              symbol: "",
              name: "",
              score: "",
              identifier: "",
            };
      });
    }
  }, [report.value, tableData]);

  const inputResultId = () => {
    setText(
      tableDataMod.value
        .filter((v) => v.identifier)
        .map((v) => v.identifier)
        .join("\n"),
    );
  };

  const copyClipboard = async () => {
    const table = tableDataMod.value.map((v) => {
      if (dataset?.label_resolver?.taxonomy) {
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
    const table = tableDataMod.value.map((v) => {
      if (dataset?.label_resolver?.taxonomy) {
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
      {(!isLoading || Boolean(tableDataMod.value.length)) && (
        <>
          <div className="buttons">
            <p className="heading">Report</p>
            <div className="radio">
              <input
                id="matched"
                name="matched"
                type="radio"
                className="radio__input"
                style={{ width: "20px", height: "20px" }}
                onChange={() => (report.value = "matched")}
                checked={report.value === "matched"}
              />
              <label htmlFor="matched" className="radio__label">
                Matched labels
              </label>
            </div>
            <div className="radio">
              <input
                id="unmatched"
                name="unmatched"
                type="radio"
                className="radio__input"
                style={{ width: "20px", height: "20px" }}
                onChange={() => (report.value = "unmatched")}
                checked={report.value === "unmatched"}
              />
              <label htmlFor="unmatched" className="radio__label">
                Include unmatched labels
              </label>
            </div>
          </div>
          {Boolean(tableDataMod.value.length) && (
            <>
              <div className="buttons">
                <p className="heading">Action</p>
                <button
                  onClick={() => inputResultId()}
                  className="button search"
                >
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
                    {dataset?.label_resolver?.taxonomy && <th>Symbol</th>}
                    {dataset?.label_resolver?.threshold && (
                      <>
                        <th>Name</th>
                        <th>Score</th>
                      </>
                    )}
                    <th>
                      <div className="id-select">
                        <label htmlFor="idSelect" className="select__label">
                          ID
                        </label>
                        <select id="idSelect" className="select white">
                          <option value="">dummy01</option>
                          <option value="">dummy02</option>
                          <option value="">dummy03</option>
                        </select>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                {tableDataMod.value.map((v, i) => (
                  <tr key={i}>
                    <td>{v.label}</td>
                    <td>{v.type}</td>
                    {dataset?.label_resolver?.taxonomy && <td>{v.symbol}</td>}
                    {dataset?.label_resolver?.threshold && (
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
        </>
      )}
    </div>
  );
};

export default LabelToIdTable;
