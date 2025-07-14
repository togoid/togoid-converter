import copy from "copy-to-clipboard";

type Props = {
  route: Route[];
  ids: string[];
  lastTargetCount: any;
};

const ResultModalSingleAction = (props: Props) => {
  const [previewMode] = useState("target");
  const [isCompact] = useState(false);

  const {
    tableHeadBaseList,
    setTableHeadBaseList,
    tableHeadList,
    createExportTable,
    createExportTableHead,
  } = useResultModalAction(props.route, previewMode, isCompact);

  const filterTable = useMemo(() => {
    return tableHeadList[0].format?.length
      ? props.route[0].results.map((v) => [
          tableHeadList[0].format!.reduce((prev, curr) => {
            return sscanf(prev, curr) ?? prev;
          }, v),
        ])
      : props.route[0].results.map((v) => [v]);
  }, []);

  const copyClipboard = async () => {
    const rows = await createExportTable(filterTable);
    const text = invokeUnparse(rows, "tsv");

    copy(text, {
      format: "text/plain",
    });
  };

  const handleExportCsvTsv = async (extension: "csv" | "tsv") => {
    const head = createExportTableHead();
    const rows = await createExportTable(filterTable);

    exportCsvTsv([head, ...rows], extension, `result.${extension}`);
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

      <ResultModalActionTable
        isCompact={false}
        tableHeadBaseList={tableHeadBaseList}
        setTableHeadBaseList={setTableHeadBaseList}
        tableHeadList={tableHeadList}
        filterTable={filterTable}
        isLoading={false}
      />
    </>
  );
};

export default ResultModalSingleAction;
