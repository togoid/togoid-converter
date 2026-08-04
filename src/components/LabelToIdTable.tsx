import useSWRImmutable from "swr/immutable";
import axios from "axios";
import copy from "copy-to-clipboard";
import NProgress from "nprogress";

const report = signal<"matched" | "unmatched">("matched");

type Props = {
  labelToIdParam: Signal<{
    dataset: string;
    labels: string[];
    labelTypes: string[];
    taxon?: string;
    threshold?: number;
  }>;
  dataset: Signal<DatasetConfig[number] & { key: string }>;
  executeExamples: (idList: string[], exampleTarget: string) => void;
};

const LabelToIdTable = ({
  labelToIdParam,
  dataset,
  executeExamples,
}: Props) => {
  useSignals();

  const lineMode = useSignal<{
    key: "id" | "url";
    value: string;
  }>({
    key: "id",
    value: dataset.value.format?.[0] ?? "",
  });

  const {
    data: tableData,
    error,
    isLoading,
  } = useSWRImmutable(labelToIdParam.value, async (param) => {
    NProgress.start();
    try {
      const res = await axios.get<Label2idRow[]>(
        `${process.env.NEXT_PUBLIC_API_ENDPOINT}/label2id`,
        {
          params: {
            dataset: param.dataset,
            labels: param.labels.join(","),
            label_types: param.labelTypes.join(","),
            taxon: param.taxon,
            threshold: param.threshold,
            // 未マッチ行も含めて取得し、Report の切り替えは再取得せず手元で絞る
            report: "full",
          },
        },
      );
      return res.data;
    } finally {
      NProgress.done();
    }
  });

  const tableDataMod = useMemo(() => {
    return computed(() => {
      if (!tableData) {
        return [];
      }

      // report=full で取得しているので、Matched は id を持つ行だけに絞る
      return report.value === "matched"
        ? tableData.filter((v) => v.id)
        : tableData;
    });
  }, [tableData]);

  const errorMessage = useMemo(() => {
    if (!error) {
      return null;
    }
    // /label2id は 400 / 502 を {"message": "..."} で返す
    if (axios.isAxiosError(error)) {
      return (
        (error.response?.data as { message?: string } | undefined)?.message ??
        error.message
      );
    }
    return "Failed to resolve labels.";
  }, [error]);

  const inputResultId = () => {
    const idList = tableDataMod.value
      .filter((v) => v.id)
      .map((v) =>
        joinPrefix(
          v.id ?? undefined,
          lineMode.value.key === "id"
            ? lineMode.value
            : {
                key: "id",
                value: dataset.value.format?.[0] ?? "",
              },
        ),
      );

    executeExamples(idList, dataset.value.key);
  };

  const copyClipboard = async () => {
    const table = createExportTable();
    const text = invokeUnparse(table, "tsv");
    copy(text, {
      format: "text/plain",
    });
  };

  const handleExportCsvTsv = async (extension: "csv" | "tsv") => {
    const table = createExportTable();
    exportCsvTsv(table, extension, `result.${extension}`);
  };

  const createExportTable = () => {
    return tableDataMod.value.map((v) => {
      const id = v.id ? joinPrefix(v.id, lineMode.value) : "";
      const matchType = v.match_type ?? "Unmatched";

      if (dataset.value?.label_resolver?.taxonomy) {
        return {
          Input: v.input,
          "Match type": matchType,
          Symbol: v.name ?? "",
          ID: id,
        };
      } else {
        return {
          Input: v.input,
          "Match type": matchType,
          Name: v.name ?? "",
          Score: v.score ?? "",
          ID: id,
        };
      }
    });
  };

  return (
    <div className="label-to-id-table">
      {errorMessage && <p className="error">{errorMessage}</p>}
      {!errorMessage && (!isLoading || Boolean(tableDataMod.value.length)) && (
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
                  Convert IDs
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
                    {dataset.value?.label_resolver?.taxonomy && <th>Symbol</th>}
                    {dataset.value?.label_resolver?.threshold && (
                      <>
                        <th>Name</th>
                        <th>Score</th>
                      </>
                    )}
                    <th>
                      <div className="id-select">
                        <ResultModalActionTableSelect
                          id="idSelect"
                          value={lineMode.value}
                          tableHead={dataset.value}
                          onChange={(value: TableHead["lineMode"]) =>
                            (lineMode.value = value)
                          }
                        >
                          ID
                        </ResultModalActionTableSelect>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tableDataMod.value.map((v, i) => (
                    <tr key={i}>
                      <td>{v.input}</td>
                      <td>{v.match_type ?? "Unmatched"}</td>
                      {dataset.value?.label_resolver?.taxonomy && (
                        <td>{v.name}</td>
                      )}
                      {dataset.value?.label_resolver?.threshold && (
                        <>
                          <td>{v.name}</td>
                          <td>{v.score}</td>
                        </>
                      )}
                      <td>
                        {v.id && (
                          <a
                            href={joinPrefix(
                              v.id,
                              lineMode.value.key === "url"
                                ? lineMode.value
                                : {
                                    key: "url",
                                    value: dataset.value.prefix[0].uri,
                                  },
                            )}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {joinPrefix(v.id, lineMode.value)}
                          </a>
                        )}
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
