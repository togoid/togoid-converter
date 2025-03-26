const useResultModalAction = (
  route: Route[],
  previewMode: string,
  isCompact: boolean,
) => {
  const { datasetConfig } = useConfig();
  const { annotateConfig } = useAnnotateConfig();

  const [tableHeadBaseList, setTableHeadBaseList] = useState<TableHead[]>(
    route.map((v, i) => {
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
      !isCompact &&
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
            joinPrefix(v[i], tableHead.lineMode, isCompact),
          ),
        ),
      };
    }
  };

  return {
    tableHeadBaseList,
    setTableHeadBaseList,
    tableHeadList,
    createExportTable,
  };
};

export default useResultModalAction;
