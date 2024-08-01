import { printf } from "fast-printf";
import useSWRImmutable from "swr/immutable";

const createBaseTable = (tableRows: any[][]) => {
  return tableRows;
};

const createCompactBaseTable = (tableRows: any[][], tableHead: any[]) => {
  const baseTable = tableRows.map((v) => {
    return v.map((w, i) => {
      const formatIdObj: { [key: string]: any } = {};

      const idSplitList = w ? w.split(" ") : [];
      // prefixがある場合
      tableHead[i].format?.forEach((x) => {
        formatIdObj[x] = w ? idSplitList.map((y: any) => printf(x, y)) : [];
      });

      // idとurlは必ず作成する
      formatIdObj["id"] = idSplitList;
      formatIdObj["url"] = w
        ? idSplitList.map((x: any) => tableHead[i].prefix + x)
        : [];

      return formatIdObj;
    });
  });

  return baseTable;
};

const fetcher = async (
  key: {
    route: Route[];
    ids: string[];
    report: string;
    limit: number;
    compact: boolean;
  },
  tableHead: any[],
) => {
  const data = await executeQuery(key);

  return key.compact
    ? createCompactBaseTable(data.results, tableHead)
    : createBaseTable(data.results, tableHead);
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
    (key) => fetcher(key, tableHead),
  );

  useEffect(() => {
    if (baseTable) {
      setFilterTable(isCompact ? editCompactTable() : editTable(baseTable));
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
            table
              .filter((v) => v[v.length - 1])
              .map((v) => JSON.stringify([v[v.length - 1]])),
          ),
          (v) => JSON.parse(v),
        ),
      };
    } else if (previewMode === "full") {
      // full
      return { heading: tableHead, rows: table };
    }

    // ここには来ない
    return { heading: [], rows: [] };
  };

  const editCompactTable = (): { heading: any[]; rows: any[][] } => {
    if (previewMode === "all") {
      // all
      return {
        heading: tableHead,
        rows: baseTable.filter((v) => v[v.length - 1].url.length),
      };
    } else if (previewMode === "pair") {
      // origin and targets
      // 重複は消す
      return {
        heading: [tableHead[0], tableHead[tableHead.length - 1]],
        rows: baseTable
          .filter((v) => v[v.length - 1].url.length)
          .map((v) => [v[0], v[v.length - 1]]),
      };
    } else if (previewMode === "target") {
      // target
      // 重複は消す
      return {
        heading: [tableHead[tableHead.length - 1]],
        rows: [
          [
            structuredClone(baseTable)
              .filter((v) => v[v.length - 1].url.length)
              .map((v) => v[v.length - 1])
              .reduce((prev, curr) => {
                Object.entries(curr).forEach(([key, value]) => {
                  prev[key] = [...new Set(prev[key].concat(value))];
                });
                return prev;
              }),
          ],
        ],
      };
    } else if (previewMode === "full") {
      // full
      return { heading: tableHead, rows: baseTable };
    }

    // ここには来ない
    return { heading: [], rows: [] };
  };

  return filterTable;
};

export default useResultModalPreview;
