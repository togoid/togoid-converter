import copy from "copy-to-clipboard";
import { printf } from "fast-printf";

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

  return (
    <>
      <div className="modal__top">
        <div className="item_wrapper">
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

      <ResultModalSingleActionTable
        route={props.route}
        tableHead={tableHead}
        lineMode={lineMode}
        setLineMode={setLineMode}
        isShowLabelList={isShowLabelList}
        setIsShowLabelList={setIsShowLabelList}
      />
    </>
  );
};

export default ResultModalAction;
