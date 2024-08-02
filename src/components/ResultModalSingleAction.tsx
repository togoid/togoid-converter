import copy from "copy-to-clipboard";
import { printf } from "fast-printf";
import axios from "axios";

type Props = {
  route: Route[];
  ids: any;
  lastTargetCount: any;
};

const ResultModalSingleAction = (props: Props) => {
  const { datasetConfig } = useConfig();

  const [lineMode, setLineMode] = useState<string[]>(
    Array(props.route.length).fill("id"),
  );
  const [isShowLabelList, setIsShowLabelList] = useState<boolean[]>(
    Array(props.route.length).fill(false),
  );

  const tableHead = useMemo<any[]>(
    () =>
      props.route.map((v, i) => ({
        ...datasetConfig[v.name],
        index: i,
        name: v.name,
      })),
    [],
  );

  const createExportTable = async (idList: string[]) => {
    if (isShowLabelList[0]) {
      const head = tableHead.flatMap((v) => [v.label, ""]);

      const data = await executeAnnotateQuery({
        name: tableHead[0].name,
        ids: idList,
      });

      const row = idList.map((v, i) => {
        return [
          joinPrefix(v, lineMode[0], tableHead[0].prefix),
          (Object.values(data.data)[0] as any)[i].label,
        ];
      });

      return { head: head, row: row };
    } else {
      const head = tableHead.map((v) => v.label);
      const row = idList.map((v) => {
        return [joinPrefix(v, lineMode[0], tableHead[0].prefix)];
      });

      return { head: head, row: row };
    }
  };

  const copyClipboard = async () => {
    const { row } = await createExportTable(props.route[0].results);
    const text = invokeUnparse(row, "tsv");

    copy(text, {
      format: "text/plain",
    });
  };

  const handleExportCsvTsv = async (extension: "csv" | "tsv") => {
    const { head, row } = await createExportTable(props.route[0].results);

    exportCsvTsv([head, ...row], extension, `result.${extension}`);
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

export default ResultModalSingleAction;
