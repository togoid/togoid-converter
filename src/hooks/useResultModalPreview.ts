import useSWRImmutable from "swr/immutable";

const useResultModalPreview = (
  previewMode: string,
  isCompact: boolean,
  route: any[],
  ids: any[],
  tableHead: any[],
) => {
  const [filterTable, setFilterTable] = useState<
    Partial<ReturnType<typeof editTable>>
  >({});

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

  useEffect(() => {
    if (baseTable) {
      setFilterTable(
        isCompact ? editCompactTable(baseTable) : editTable(baseTable),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseTable, previewMode]);

  const editTable = (
    table: NonNullable<typeof baseTable>,
  ): { heading: any[]; rows: any[][] } => {
    if (previewMode === "all") {
      // all
      const rows = table.filter((v) => v[v.length - 1]);
      return { heading: tableHead, rows };
    } else if (previewMode === "pair") {
      // origin and targets
      // 重複は消す
      return {
        heading: [tableHead[0], tableHead[tableHead.length - 1]],
        rows: Array.from(
          new Set(
            table
              .filter((v) => v[v.length - 1])
              .map((v) => JSON.stringify([v[0], v[v.length - 1]])),
          ),
          (v) => JSON.parse(v),
        ),
      };
    } else if (previewMode === "target") {
      // target
      // 重複は消す
      return {
        heading: [tableHead[tableHead.length - 1]],
        rows: Array.from(
          new Set(
            table.filter((v) => v[v.length - 1]).map((v) => v[v.length - 1]),
          ),
          (v) => [v],
        ),
      };
    } else if (previewMode === "full") {
      // full
      return { heading: tableHead, rows: table };
    }

    // ここには来ない
    return { heading: [], rows: [] };
  };

  const editCompactTable = (
    table: NonNullable<typeof baseTable>,
  ): { heading: any[]; rows: any[][] } => {
    if (previewMode === "all") {
      // all
      return {
        heading: tableHead,
        rows: table.filter((v) => v[tableHead.length - 1]),
      };
    } else if (previewMode === "pair") {
      // origin and targets
      return {
        heading: [tableHead[0], tableHead[tableHead.length - 1]],
        rows: table
          .filter((v) => v[tableHead.length - 1])
          .map((v) => [v[0], v[tableHead.length - 1]]),
      };
    } else if (previewMode === "target") {
      // target
      // 重複は消す
      return {
        heading: [tableHead[tableHead.length - 1]],
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
        heading: tableHead,
        rows: table,
      };
    }

    // ここには来ない
    return { heading: [], rows: [] };
  };

  return filterTable;
};

export default useResultModalPreview;
