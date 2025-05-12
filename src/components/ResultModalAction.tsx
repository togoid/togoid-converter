import useSWRImmutable from "swr/immutable";
// import useSWR from "swr";
import copy from "copy-to-clipboard";

// 定数
const previewModeList = [
  new Map([
    ["all", "All converted IDs"],
    ["pair", "Source and target IDs"],
    ["target", "Target IDs"],
  ]),
  new Map([["full", "All including unconverted IDs"]]),
];

type Props = {
  route: Route[];
  ids: string[];
  lastTargetCount: any;
};

const ResultModalAction = (props: Props) => {
  const [previewMode, setPreviewMode] = useState("all");
  const [isCompact, setIsCompact] = useState(false);

  const {
    tableHeadBaseList,
    setTableHeadBaseList,
    tableHeadList,
    createExportTable,
    createExportTableHead,
    updateAnnotateChecked,
    updateAnnotateItemChecked,
  } = useResultModalAction(props.route, previewMode, isCompact);

  const {data: filterTable, isLoading} = useSWRImmutable(
    {
      route: props.route,
      ids: props.ids,
      report: previewMode,
      limit: 100,
      compact: isCompact,
    },
    async (key) => {
      const data = await executeQuery(key);

      if (!isCompact && previewMode === "target") {
        return data.results.map((v) => [v]) as unknown as string[][];
      }

      return data.results;
    },
  );

  const copyClipboard = async () => {
    const d = await executeQuery({
      route: props.route,
      ids: props.ids,
      report: previewMode,
      compact: isCompact,
    });

    if (previewMode === "target") {
      d.results = d.results.map((v) => [v]) as unknown as string[][];
    }

    const rows = await createExportTable(d.results)!;
    const text = invokeUnparse(rows, "tsv");

    copy(text, {
      format: "text/plain",
    });
  };

  const handleExportCsvTsv = async (extension: "csv" | "tsv") => {
    const d = await executeQuery({
      route: props.route,
      ids: props.ids,
      report: previewMode,
      compact: isCompact,
    });

    if (previewMode === "target") {
      d.results = d.results.map((v) => [v]) as unknown as string[][];
    }

    const head = createExportTableHead();
    const rows = await createExportTable(d.results)!;
    exportCsvTsv([head, ...rows], extension, `result.${extension}`);
  };

  const copyClipboardURL = () => {
    const text = getConvertUrlSearchParams({
      route: props.route,
      ids: props.ids,
      report: previewMode,
      format: "csv",
      compact: isCompact,
    }).toString();

    copy(`${process.env.NEXT_PUBLIC_API_ENDOPOINT}/convert?${text}`, {
      format: "text/plain",
    });
  };

  const copyClipboardCurl = () => {
    const text = getConvertUrlSearchParams({
      route: props.route,
      ids: props.ids,
      report: previewMode,
      format: "csv",
      compact: isCompact,
    }).toString();

    copy(
      `curl -X POST -d "${text}" "${process.env.NEXT_PUBLIC_API_ENDOPOINT}/convert"`,
      {
        format: "text/plain",
      },
    );
  };

  return (
    <>
      <div className="modal__top">
        <div className="item_wrapper">
          <div className="report">
            <p className="modal__heading">Report</p>
            {previewModeList.map((modeRowMap, i) => (
              <div className="report__inner" key={i}>
                {Array.from(modeRowMap, ([key, value], j) => (
                  <div className="radio" key={j}>
                    <input
                      id={`${i}-${j}`}
                      value={key}
                      name="report"
                      type="radio"
                      className="radio__input"
                      checked={previewMode === key}
                      onChange={() => setPreviewMode(key)}
                    />
                    <label htmlFor={`${i}-${j}`} className="radio__label">
                      {value}
                    </label>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="report">
            <p className="modal__heading">Format</p>
            <div className="report__inner">
              <div className="radio">
                <input
                  id="expanded"
                  name="format"
                  type="radio"
                  className="radio__input"
                  checked={!isCompact}
                  onChange={() => setIsCompact(false)}
                />
                <label htmlFor="expanded" className="radio__label">
                  Expanded
                </label>
              </div>
              <div className="radio">
                <input
                  id="compact"
                  name="format"
                  type="radio"
                  className="radio__input"
                  checked={isCompact}
                  onChange={() => setIsCompact(true)}
                />
                <label htmlFor="compact" className="radio__label">
                  Compact
                </label>
              </div>
            </div>
          </div>

          <div className="report">
            <p className="modal__heading">Label</p>
            <div className="report__inner">
              {tableHeadBaseList
                .filter(
                  (tableHead) =>
                    tableHead.annotateList[0]?.variable === "label",
                )
                .map((tableHead, i) => (
                  <div key={i}>
                    <input
                      id={`label02-${i}`}
                      name="format"
                      type="checkbox"
                      checked={tableHead.annotateList[0].checked}
                      onChange={(e) =>
                        updateAnnotateChecked(
                          tableHead.index,
                          tableHead.annotateList[0].index,
                          e.target.checked,
                        )
                      }
                      className="checkbox"
                    />
                    <label htmlFor={`label02-${i}`} className="checkbox-label">
                      {tableHead.label}
                    </label>
                  </div>
                ))}
            </div>
          </div>

          <div className="action">
            <p className="modal__heading">Action</p>
            <div className="action__inner">
              <button
                onClick={() => handleExportCsvTsv("csv")}
                className="button_icon"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="11.497"
                  height="13.961"
                  viewBox="0 0 11.497 13.961"
                  className="button_icon__icon"
                >
                  <path
                    id="download"
                    d="M5,16.961H16.5V15.319H5M16.5,7.927H13.212V3H8.285V7.927H5l5.749,5.749Z"
                    transform="translate(-5 -3)"
                    fill="#fff"
                  />
                </svg>
                Download as CSV
              </button>
              <button
                onClick={() => handleExportCsvTsv("tsv")}
                className="button_icon"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="11.497"
                  height="13.961"
                  viewBox="0 0 11.497 13.961"
                  className="button_icon__icon"
                >
                  <path
                    id="download"
                    d="M5,16.961H16.5V15.319H5M16.5,7.927H13.212V3H8.285V7.927H5l5.749,5.749Z"
                    transform="translate(-5 -3)"
                    fill="#fff"
                  />
                </svg>
                Download as TSV
              </button>
              <ResultModalClipboardButton copyFunction={copyClipboard}>
                Copy to clipboard
              </ResultModalClipboardButton>
              <ResultModalClipboardButton copyFunction={copyClipboardURL}>
                Copy API URL
              </ResultModalClipboardButton>
              <ResultModalClipboardButton copyFunction={copyClipboardCurl}>
                Copy CURL
              </ResultModalClipboardButton>
            </div>
            {props.lastTargetCount === "10000+" && (
              <div>
                <div>Warning : There is a lot of data and errors may occur</div>
                <div>
                  Please consider using the API limit and offset functions
                </div>
              </div>
            )}
          </div>
        </div>
        <div>
          <p className="showing">
            <span className="showing__text">Preview</span>
          </p>
        </div>
      </div>

      <ResultModalActionTable
        isCompact={isCompact}
        tableHeadBaseList={tableHeadBaseList}
        setTableHeadBaseList={setTableHeadBaseList}
        tableHeadList={tableHeadList}
        filterTable={filterTable}
        isLoading={isLoading}
        updateAnnotateChecked={updateAnnotateChecked}
        updateAnnotateItemChecked={updateAnnotateItemChecked}
      />
    </>
  );
};

export default ResultModalAction;
