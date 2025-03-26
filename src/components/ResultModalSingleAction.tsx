import copy from "copy-to-clipboard";

type Props = {
  route: Route[];
  ids: string[];
  lastTargetCount: any;
};

const ResultModalSingleAction = (props: Props) => {
  const { datasetConfig } = useConfig();
  const { annotateConfig } = useAnnotateConfig();
  const [previewMode] = useState("target");

  const [tableHeadBaseList, setTableHeadBaseList] = useState<
    ({
      index: number;
      name: string;
      lineMode: {
        key: "id" | "url";
        value: string;
      };
      annotateList: {
        checked: boolean;
        label: string;
        variable: string;
      }[];
    } & DatasetConfig[number])[]
  >(
    props.route.map((v, i) => {
      const dataset = datasetConfig[v.name];

      const annotateList: {
        checked: boolean;
        label: string;
        variable: string;
      }[] = [];
      if (annotateConfig.includes(v.name)) {
        annotateList.push({
          checked: false,
          label: "Label",
          variable: "label",
        });
      }
      if (dataset.annotations?.length) {
        dataset.annotations.forEach((annotation) => {
          annotateList.push({
            checked: false,
            label: annotation.label,
            variable: annotation.variable,
          });
        });
      }

      return {
        ...dataset,
        index: i,
        name: v.name,
        lineMode: {
          key: "id",
          value: dataset.format?.[0] ?? "",
        },
        annotateList: annotateList,
      };
    }),
  );

  const tableHeadList = useMemo(() => {
    if (previewMode === "pair") {
      return [
        tableHeadBaseList[0],
        tableHeadBaseList[tableHeadBaseList.length - 1],
      ];
    } else if (previewMode === "target") {
      return [tableHeadBaseList[tableHeadBaseList.length - 1]];
    }

    return tableHeadBaseList;
  }, [previewMode, tableHeadBaseList]);

  const createExportTable = async (tableRows: string[][]) => {
    if (
      tableHeadList.some((tablehead) =>
        tablehead.annotateList.some((annotate) => annotate.checked),
      )
    ) {
      // All converted IDs
      // origin and targets
      // Target IDs
      // All including unconverted IDs
      const transposeList = tableRows[0].map((_, i) =>
        tableRows.map((row) => row[i]).filter((v) => v),
      );

      const labelList = await Promise.all(
        tableHeadList.map(async (tablehead, i) => {
          if (tablehead.annotateList.some((annotate) => annotate.checked)) {
            return await executeAnnotateQuery({
              name: tablehead.name,
              ids: transposeList[i],
              annotations: tablehead.annotateList
                .filter((annotate) => annotate.checked)
                .map((annotate) => annotate.variable),
            });
          }
        }),
      );

      return {
        heading: tableHeadList.reduce<string[]>((prev, curr) => {
          prev.push(curr.label);
          curr.annotateList.forEach((annotate) => {
            if (annotate.checked) {
              prev.push(annotate.label);
            }
          });

          return prev;
        }, []),
        rows: tableRows.map((v) =>
          tableHeadList.reduce<(string | undefined)[]>((prev, curr, j) => {
            const idWithPrefix = joinPrefix(v[j], curr.lineMode);
            prev.push(idWithPrefix);
            curr.annotateList.forEach((annotate) => {
              if (annotate.checked) {
                const label = labelList[j]?.[v[j]][annotate.variable];
                prev.push(Array.isArray(label) ? label.join(" ") : label);
              }
            });

            return prev;
          }, []),
        ),
      };
    } else {
      // All converted IDs
      // origin and targets
      // Target IDs
      // All including unconverted IDs
      return {
        heading: tableHeadList.map((v) => v.label),
        rows: tableRows.map((v) =>
          tableHeadList.map((tableHead, i) =>
            joinPrefix(v[i], tableHead.lineMode),
          ),
        ),
      };
    }
  };

  const copyClipboard = async () => {
    const { rows } = await createExportTable(
      props.route[0].results.map((v) => [v]),
    );
    const text = invokeUnparse(rows, "tsv");

    copy(text, {
      format: "text/plain",
    });
  };

  const handleExportCsvTsv = async (extension: "csv" | "tsv") => {
    const { heading, rows } = await createExportTable(
      props.route[0].results.map((v) => [v]),
    );

    exportCsvTsv([heading, ...rows], extension, `result.${extension}`);
  };

  const { filterTable } = useResultModalSinglePreview(props.route);

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
