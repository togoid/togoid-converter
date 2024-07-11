import copy from "copy-to-clipboard";
import { printf } from "fast-printf";

// 定数
const previewModeList = new Map([
  ["all", "All converted IDs"],
  ["pair", "Source and target IDs"],
  ["target", "Target IDs"],
  ["full", "All including unconverted IDs"],
]);

type Props = {
  route: Route[];
  ids: any;
  lastTargetCount: any;
};

const ResultModalAction = (props: Props) => {
  const { datasetConfig } = useConfig();

  const [previewMode, setPreviewMode] = useState("all");
  const [isCompact, setIsCompact] = useState(false);
  const [lineMode, setLineMode] = useState<string[]>(
    Array(props.route.length).fill("id"),
  );

  const tableHead = useMemo(
    () => props.route.map((v, i) => ({ ...datasetConfig[v.name], index: i })),
    [],
  );

  const createExportTable = (tableRows: any[][]) => {
    if (previewMode === "all") {
      // all
      const rows = tableRows.map((v) =>
        v.map((w, i) => [joinPrefix(w, lineMode[i], tableHead[i].prefix)]),
      );

      return { heading: tableHead, rows };
    } else if (previewMode === "pair") {
      // origin and targets
      return {
        heading: [tableHead[0], tableHead[tableHead.length - 1]],
        rows: tableRows.map((v) => [
          [joinPrefix(v[0], lineMode[0], tableHead[0].prefix)],
          [
            joinPrefix(
              v[v.length - 1],
              lineMode[lineMode.length - 1],
              tableHead[tableHead.length - 1].prefix,
            ),
          ],
        ]),
      };
    } else if (previewMode === "target") {
      // target
      return {
        heading: [tableHead[tableHead.length - 1]],
        rows: isCompact
          ? [
              [
                joinPrefix(
                  tableRows,
                  lineMode[lineMode.length - 1],
                  tableHead[tableHead.length - 1].prefix,
                ),
              ],
            ]
          : tableRows.map((v) => [
              joinPrefix(
                v,
                lineMode[lineMode.length - 1],
                tableHead[tableHead.length - 1].prefix,
              ),
            ]),
      };
    } else if (previewMode === "full") {
      // full
      const rows = tableRows.map((v) =>
        v.map((w, i) => [
          w ? joinPrefix(w, lineMode[i], tableHead[i].prefix) : null,
        ]),
      );

      return { heading: tableHead, rows };
    }
  };

  const joinPrefix = (id, mode, prefix) => {
    // nullチェックが必要な場合は関数に渡す前にチェックすること
    // compactの際の処理を共通化させるためにsplitする
    if (mode === "id") {
      return id;
    } else if (mode === "url") {
      return id
        .split(" ")
        .map((v) => prefix + v)
        .join(" ");
    } else {
      return id
        .split(" ")
        .map((v) => printf(mode, v))
        .join(" ");
    }
  };

  const copyClipboard = async () => {
    const d = await executeQuery({
      route: props.route,
      ids: props.ids,
      report: previewMode,
      compact: isCompact,
    });

    const { rows } = createExportTable(d.results);
    const text = invokeUnparse(rows, "tsv");

    copy(text, {
      format: "text/plain",
    });
  };

  const handleExportCsvTsv = async (extension) => {
    const d = await executeQuery({
      route: props.route,
      ids: props.ids,
      report: previewMode,
      compact: isCompact,
    });

    const { heading, rows } = createExportTable(d.results);
    const h = heading.map((v) => v.label);
    exportCsvTsv([h, ...rows], extension, `result.${extension}`);
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
      `curl -X POST "${process.env.NEXT_PUBLIC_API_ENDOPOINT}/convert?${text}"`,
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
            <div className="report__inner">
              {[...previewModeList]
                .filter(([key]) => key !== "full")
                .map(([key, value], i) => (
                  <div className="radio" key={i}>
                    <input
                      id={i}
                      key={i}
                      value={key}
                      name="report"
                      type="radio"
                      className="radio__input"
                      checked={previewMode === key}
                      onChange={() => setPreviewMode(key)}
                    />
                    <label htmlFor={i} className="radio__label">
                      {value}
                    </label>
                  </div>
                ))}
            </div>
            <div className="report__inner">
              <div className="radio" key={previewModeList.size - 1}>
                <input
                  id={previewModeList.size - 1}
                  key={previewModeList.size - 1}
                  value="full"
                  name="report"
                  type="radio"
                  className="radio__input"
                  checked={previewMode === "full"}
                  onChange={() => setPreviewMode("full")}
                />
                <label
                  htmlFor={previewModeList.size - 1}
                  className="radio__label"
                >
                  {previewModeList.get("full")}
                </label>
              </div>
            </div>
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
        route={props.route}
        ids={props.ids}
        previewMode={previewMode}
        isCompact={isCompact}
        tableHead={tableHead}
        lineMode={lineMode}
        setLineMode={setLineMode}
      />
    </>
  );
};

export default ResultModalAction;
