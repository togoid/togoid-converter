import useSWRImmutable from "swr/immutable";
// import useSWR from "swr";

const useResultModalPreview = (
  previewMode: string,
  isCompact: boolean,
  route: any[],
  ids: any[],
  tableHead: {
    index: number;
    name: string;
    catalog: string;
    category: string;
    description?: string;
    examples: string[];
    format?: string[];
    label: string;
    label_resolver?: any;
    linkTo: any;
    prefix: string;
    regex: string;
  }[],
  isShowLabelList: boolean[],
) => {
  const [filterTable, setFilterTable] =
    useState<ReturnType<typeof editTable>>();

  const { data: baseTable } = useSWRImmutable(
    {
      route: route,
      ids: ids,
      report: "full",
      limit: 100,
      compact: isCompact,
    },
    async (key) => {
      const data = await executeQuery(key);

      return data.results;
    },
  );

  const { data: expandedFullTable } = useSWRImmutable<typeof baseTable>(
    {
      route: route,
      ids: ids,
      report: "full",
      limit: 100,
      compact: false,
    },
    null,
  );

  const { annotateConfig } = useAnnotateConfig();

  const { data: labelList } = useSWRImmutable(
    {
      expandedFullTable: expandedFullTable,
      isShowLabelSome: isShowLabelList.some((v) => v),
    },
    async () => {
      if (!(expandedFullTable && isShowLabelList.some((v) => v))) {
        return null;
      }

      return await Promise.all(
        expandedFullTable[0]
          .map((_, i) =>
            expandedFullTable.map((row) => row[i]).filter((v) => v),
          )
          .map(async (v, i) => {
            if (annotateConfig?.includes(tableHead[i].name)) {
              return await executeAnnotateQuery({
                name: tableHead[i].name,
                ids: v,
              });
            }
          }),
      );
    },
  );

  useEffect(() => {
    if (baseTable) {
      setFilterTable(
        isCompact ? editCompactTable(baseTable) : editTable(baseTable),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseTable, previewMode]);

  const editTable = (table: NonNullable<typeof baseTable>) => {
    const headList = getHeadList(tableHead, previewMode);

    if (previewMode === "all") {
      // all
      const rows = table.filter((v) => v[v.length - 1]);
      return { heading: headList, rows };
    } else if (previewMode === "pair") {
      // origin and targets
      // 重複は消す
      return {
        heading: headList,
        rows: Array.from(
          new Set(
            table
              .filter((v) => v[v.length - 1])
              .map((v) => JSON.stringify([v[0], v[v.length - 1]])),
          ),
          (v) => JSON.parse(v) as string[],
        ),
      };
    } else if (previewMode === "target") {
      // target
      // 重複は消す
      return {
        heading: headList,
        rows: Array.from(
          new Set(
            table.filter((v) => v[v.length - 1]).map((v) => v[v.length - 1]),
          ),
          (v) => [v],
        ),
      };
    } else if (previewMode === "full") {
      // full
      return { heading: headList, rows: table };
    }

    // ここには来ない
    return { heading: [], rows: [[]] };
  };

  const editCompactTable = (table: NonNullable<typeof baseTable>) => {
    const headList = getHeadList(tableHead, previewMode);

    if (previewMode === "all") {
      // all
      return {
        heading: headList,
        rows: table.filter((v) => v[tableHead.length - 1]),
      };
    } else if (previewMode === "pair") {
      // origin and targets
      return {
        heading: headList,
        rows: table
          .filter((v) => v[tableHead.length - 1])
          .map((v) => [v[0], v[tableHead.length - 1]]),
      };
    } else if (previewMode === "target") {
      // target
      // 重複は消す
      return {
        heading: headList,
        rows: [
          [
            [
              ...new Set(
                table
                  .filter((v) => v[tableHead.length - 1])
                  .map((v) => v[tableHead.length - 1].split(" "))
                  .flat(),
              ),
            ].join(" "),
          ],
        ],
      };
    } else if (previewMode === "full") {
      // full
      return {
        heading: headList,
        rows: table,
      };
    }

    // ここには来ない
    return { heading: [], rows: [[]] };
  };

  const getHeadList = (head: typeof tableHead, mode: typeof previewMode) => {
    if (mode === "all" || mode === "full") {
      return head;
    } else if (mode === "pair") {
      return [head[0], head[head.length - 1]];
    } else if (mode === "target") {
      return [head[head.length - 1]];
    }

    return head;
  };

  return { filterTable, labelList, getHeadList };
};

export default useResultModalPreview;
