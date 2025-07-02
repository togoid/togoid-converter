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

      const annotateList: TableHead["annotateList"] = [];
      if (annotateConfig.includes(v.name)) {
        annotateList.push({
          index: 0,
          checked: false,
          label: "Label",
          variable: "label",
          isList: false,
          isCompact: true,
        });
      }
      if (dataset.annotations?.length) {
        dataset.annotations.forEach((annotation, j) => {
          annotateList.push({
            index: j + 1,
            checked: false,
            label: annotation.label,
            variable: annotation.variable,
            items: annotation.items?.map((v) => ({
              checked: false,
              label: v,
            })),
            isList: annotation.is_list ?? false,
            isCompact: true,
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
              fields: tablehead.annotateList
                .filter((annotate) => annotate.checked)
                .map((annotate) => annotate.variable),
              variables: tablehead.annotateList
                .filter((annotate) => annotate.checked)
                .reduce((prev, curr) => {
                  const tmp = curr.items
                    ?.filter((v) => v.checked)
                    .map((v) => v.label);
                  return tmp?.length
                    ? {
                        ...prev,
                        [curr.variable]: { value: tmp, type: "[String!]" },
                      }
                    : prev;
                }, {}),
            });
          }
        }),
      );

      const idsList = labelList.map((v) => (v ? Object.keys(v) : v));

      return tableRows
        .filter((row) =>
          tableHeadList.every((tableHead, i) => {
            return (
              tableHead.annotateList.every(
                (annotate) =>
                  !annotate.checked ||
                  (annotate.items?.every((v) => !v.checked) && row[i] === null),
              ) || idsList[i]?.includes(row[i])
            );
          }),
        )
        .flatMap((row) => {
          const list = tableHeadList.reduce<(string | string[] | undefined)[]>(
            (prev, curr, j) => {
              const idWithPrefix = joinPrefix(row[j], curr.lineMode);
              prev.push(idWithPrefix);
              curr.annotateList.forEach((annotate) => {
                if (annotate.checked) {
                  const label = labelList?.[j]?.[row[j]]?.[annotate.variable];
                  if (Array.isArray(label)) {
                    if (annotate.isCompact) {
                      prev.push(label.join(" "));
                      return;
                    } else if (annotate.items?.some((x) => x.checked)) {
                      const checkedItems = annotate.items
                        .filter((x) => x.checked)
                        .map((x) => x.label);
                      prev.push(label.filter((v) => checkedItems.includes(v)));
                      return;
                    }
                  }
                  prev.push(label);
                }
              });

              return prev;
            },
            [],
          );

          return cartesianProduct(list);
        });
    } else {
      // All converted IDs
      // origin and targets
      // Target IDs
      // All including unconverted IDs
      return tableRows.map((v) =>
        tableHeadList.map((tableHead, i) =>
          joinPrefix(v[i], tableHead.lineMode, isCompact),
        ),
      );
    }
  };

  function cartesianProduct<T extends string>(
    args: (T | T[] | undefined)[],
  ): (T | undefined)[][] {
    return args.reduce<(T | undefined)[][]>(
      (acc, curr) => {
        let items: (T | undefined)[];
        if (Array.isArray(curr)) {
          // 空配列なら undefined 一要素に、そうでなければ中身をそのまま
          items = curr.length === 0 ? [undefined] : curr;
        } else {
          // string または undefined
          items = [curr];
        }
        return acc.flatMap((prev) => items.map((item) => [...prev, item]));
      },
      // 初期値：空の組み合わせを１つ
      [[]],
    );
  }

  const createExportTableHead = () => {
    if (!isCompact) {
      return tableHeadList.reduce<string[]>((prev, curr) => {
        prev.push(curr.label);
        curr.annotateList.forEach((annotate) => {
          if (annotate.checked) {
            prev.push(annotate.label);
          }
        });

        return prev;
      }, []);
    } else {
      return tableHeadList.map((v) => v.label);
    }
  };

  return {
    tableHeadBaseList,
    setTableHeadBaseList,
    tableHeadList,
    createExportTable,
    createExportTableHead,
  };
};

export default useResultModalAction;
