import { printf } from "fast-printf";
import useSWRImmutable from "swr/immutable";

const createBaseTable = (tableRows: any[][]) => {
  return tableRows;
};

const createCompactBaseTable = (tableRows: any[][]) => {
  const baseTable = tableRows.map((v) => {
    return v.map((w, i) => (w ? w.split(" ") : []));
  });

  return baseTable;
};

const fetcher = async (key: {
  route: Route[];
  ids: string[];
  report: string;
  limit: number;
  compact: boolean;
}) => {
  const data = await executeQuery(key);

  return key.compact
    ? createCompactBaseTable(data.results)
    : createBaseTable(data.results);
};

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
    (key) => fetcher(key),
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
    table: {
      [key: string]: any;
    }[][],
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
    table: {
      [key: string]: any;
    }[][],
  ): { heading: any[]; rows: any[][] } => {
    if (previewMode === "all") {
      // all
      return {
        heading: tableHead,
        rows: table.filter((v) => v[v.length - 1].length),
      };
    } else if (previewMode === "pair") {
      // origin and targets
      return {
        heading: [tableHead[0], tableHead[tableHead.length - 1]],
        rows: table
          .filter((v) => v[v.length - 1].length)
          .map((v) => [v[0], v[v.length - 1]]),
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
                  .filter((v) => v[v.length - 1].length)
                  .map((v) => v[v.length - 1])
                  .flat(),
              ),
            ],
          ],
        ],
      };
    } else if (previewMode === "full") {
      // full
      return { heading: tableHead, rows: table };
    }

    // ここには来ない
    return { heading: [], rows: [] };
  };

  return filterTable;
};

export default useResultModalPreview;
