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
  const { datasetConfig } = useConfig();
  const { annotateConfig } = useAnnotateConfig();

  const [previewMode, setPreviewMode] = useState("all");
  const [isCompact, setIsCompact] = useState(false);
  const [lineMode, setLineMode] = useState<string[]>(
    Array(props.route.length).fill("id"),
  );
  const [isShowLabelList, setIsShowLabelList] = useState<boolean[]>(
    Array(props.route.length).fill(false),
  );

  const tableHead = useMemo(
    () =>
      props.route.map((v, i) => ({
        ...datasetConfig[v.name],
        index: i,
        name: v.name,
      })),
    [],
  );

  const createExportTable = async (tableRows: string[][]) => {
    if (!isCompact && isShowLabelList.some((v) => v)) {
      const labelList = await Promise.all(
        tableRows[0]
          .map((_, i) => tableRows.map((row) => row[i]).filter((v) => v))
          .map(async (v, i) => {
            if (
              !annotateConfig?.includes(tableHead[i].name) ||
              !isShowLabelList[i]
            ) {
              return null;
            }
            const data = await executeAnnotateQuery({
              name: tableHead[i].name,
              ids: isCompact ? v.flatMap((w) => w.split(" ")) : v,
            });
            return Object.values(data.data)[0];
          }),
      );

      if (previewMode === "all") {
        // all
        const head = tableHead.flatMap((v, i) =>
          isShowLabelList[i] ? [v.label, ""] : [v.label],
        );

        const rows = tableRows.map((v) =>
          v.flatMap((w, j) =>
            isShowLabelList[j]
              ? [
                  joinPrefix(w, lineMode[j], tableHead[j].prefix, isCompact),
                  labelList[j]?.find((y) => y.id === w)?.label,
                ]
              : [joinPrefix(w, lineMode[j], tableHead[j].prefix, isCompact)],
          ),
        );

        return { heading: head, rows };
      } else if (previewMode === "pair") {
        // origin and targets
        return {
          heading: [tableHead[0], tableHead[tableHead.length - 1]],
          rows: tableRows.map((v) => [
            [joinPrefix(v[0], lineMode[0], tableHead[0].prefix, isCompact)],
            [
              joinPrefix(
                v[v.length - 1],
                lineMode[lineMode.length - 1],
                tableHead[tableHead.length - 1].prefix,
                isCompact,
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
                    // @ts-expect-error
                    tableRows,
                    lineMode[lineMode.length - 1],
                    tableHead[tableHead.length - 1].prefix,
                    isCompact,
                  ),
                ],
              ]
            : tableRows.map((v) => [
                joinPrefix(
                  // @ts-expect-error
                  v,
                  lineMode[lineMode.length - 1],
                  tableHead[tableHead.length - 1].prefix,
                  isCompact,
                ),
              ]),
        };
      } else if (previewMode === "full") {
        // full
        const rows = tableRows.map((v) =>
          v.map((w, i) => [
            w
              ? joinPrefix(w, lineMode[i], tableHead[i].prefix, isCompact)
              : null,
          ]),
        );

        return { heading: tableHead, rows };
      }
    } else {
      if (previewMode === "all") {
        // all
        const rows = tableRows.map((v) =>
          v.map((w, i) => [
            joinPrefix(w, lineMode[i], tableHead[i].prefix, isCompact),
          ]),
        );

        return { heading: tableHead, rows };
      } else if (previewMode === "pair") {
        // origin and targets
        return {
          heading: [tableHead[0], tableHead[tableHead.length - 1]],
          rows: tableRows.map((v) => [
            [joinPrefix(v[0], lineMode[0], tableHead[0].prefix, isCompact)],
            [
              joinPrefix(
                v[v.length - 1],
                lineMode[lineMode.length - 1],
                tableHead[tableHead.length - 1].prefix,
                isCompact,
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
                    // @ts-expect-error
                    tableRows,
                    lineMode[lineMode.length - 1],
                    tableHead[tableHead.length - 1].prefix,
                    isCompact,
                  ),
                ],
              ]
            : tableRows.map((v) => [
                joinPrefix(
                  // @ts-expect-error
                  v,
                  lineMode[lineMode.length - 1],
                  tableHead[tableHead.length - 1].prefix,
                  isCompact,
                ),
              ]),
        };
      } else if (previewMode === "full") {
        // full
        const rows = tableRows.map((v) =>
          v.map((w, i) => [
            w
              ? joinPrefix(w, lineMode[i], tableHead[i].prefix, isCompact)
              : null,
          ]),
        );

        return { heading: tableHead, rows };
      }
    }

    // この部分を通過することはないが型のため
    return { heading: [], rows: [] };
  };

  const copyClipboard = async () => {
    const d = await executeQuery({
      route: props.route,
      ids: props.ids,
      report: previewMode,
      compact: isCompact,
    });

    const { rows } = await createExportTable(d.results)!;
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

    const { heading, rows } = await createExportTable(d.results)!;
    // @ts-expect-error
    const h = heading.map((v) => v?.label ?? v);
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
      `curl -X POST -d "${text}" "${process.env.NEXT_PUBLIC_API_ENDOPOINT}/convert"`,
      {
        format: "text/plain",
      },
    );
  };

  const { filterTable, labelList } = useResultModalPreview(
    previewMode,
    isCompact,
    props.route,
    props.ids,
    tableHead,
    isShowLabelList,
  );

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
        lineMode={lineMode}
        setLineMode={setLineMode}
        isShowLabelList={isShowLabelList}
        setIsShowLabelList={setIsShowLabelList}
        filterTable={filterTable}
        labelList={labelList}
      />
    </>
  );
};

export default ResultModalAction;
