import { printf } from "fast-printf";
import useSWRImmutable from "swr/immutable";

const createBaseTable = (
  tableRows: any[][],
  tableHeading: any[],
  prefixList: any[],
) => {
  const baseTable = tableRows.map((v) => {
    return v.map((w, i) => {
      const formatIdObj = {};

      // prefixがある場合
      prefixList[i].forEach((x) => {
        formatIdObj[x.value] = w ? printf(x.value, w) : null;
      });

      // idとurlは必ず作成する
      formatIdObj["id"] = w ?? null;
      formatIdObj["url"] = w ? tableHeading[i].prefix + w : null;

      return formatIdObj;
    });
  });

  return baseTable;
};

const createCompactBaseTable = (
  tableRows: any[][],
  tableHeading: any[],
  prefixList: any[],
) => {
  const baseTable = tableRows.map((v) => {
    return v.map((w, i) => {
      const formatIdObj = {};

      const idSplitList = w ? w.split(" ") : [];
      // prefixがある場合
      prefixList[i].forEach((x) => {
        formatIdObj[x.value] = w
          ? idSplitList.map((y) => printf(x.value, y))
          : [];
      });

      // idとurlは必ず作成する
      formatIdObj["id"] = idSplitList;
      formatIdObj["url"] = w
        ? idSplitList.map((x) => tableHeading[i].prefix + x)
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
  tableHeading: any[],
  prefixList: any[],
) => {
  const data = await executeQuery(key);

  return key.compact
    ? createCompactBaseTable(data.results, tableHeading, prefixList)
    : createBaseTable(data.results, tableHeading, prefixList);
};

const useResultModalPreview = (
  previewMode: string,
  isCompact: boolean,
  route: any[],
  ids: any[],
  tableHeading: any[],
  prefixList: any[],
) => {
  const [filterTable, setFilterTable] = useState({});

  const { data: baseTable } = useSWRImmutable(
    {
      route: route,
      ids: ids,
      report: "full",
      limit: 100,
      compact: isCompact,
    },
    (key) => fetcher(key, tableHeading, prefixList),
  );

  useEffect(() => {
    if (baseTable) {
      setFilterTable(isCompact ? editCompactTable() : editTable());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseTable, previewMode]);

  const editTable = (): { heading: any[]; rows: any[] } => {
    if (previewMode === "all") {
      // all
      const rows = baseTable.filter((v) => v[v.length - 1].url);
      return { heading: tableHeading, rows };
    } else if (previewMode === "pair") {
      // origin and targets
      // 重複は消す
      return {
        heading: [tableHeading[0], tableHeading[tableHeading.length - 1]],
        rows: baseTable
          .filter((v) => v[v.length - 1].url)
          .map((v) => [v[0], v[v.length - 1]])
          .filter(
            (v, i, self) =>
              self.findIndex(
                (w) =>
                  w[0].url === v[0].url &&
                  w[w.length - 1].url === v[v.length - 1].url,
              ) === i,
          ),
      };
    } else if (previewMode === "target") {
      // target
      // 重複は消す
      return {
        heading: [tableHeading[tableHeading.length - 1]],
        rows: baseTable
          .filter((v) => v[v.length - 1].url)
          .map((v) => [v[v.length - 1]])
          .filter(
            (v, i, self) => self.findIndex((w) => w[0].url === v[0].url) === i,
          ),
      };
    } else if (previewMode === "full") {
      // full
      return { heading: tableHeading, rows: baseTable };
    }

    // ここには来ない
    return { heading: [], rows: [] };
  };

  const editCompactTable = (): { heading: any[]; rows: any[] } => {
    if (previewMode === "all") {
      // all
      return {
        heading: tableHeading,
        rows: baseTable.filter((v) => v[v.length - 1].url.length),
      };
    } else if (previewMode === "pair") {
      // origin and targets
      // 重複は消す
      return {
        heading: [tableHeading[0], tableHeading[tableHeading.length - 1]],
        rows: baseTable
          .filter((v) => v[v.length - 1].url.length)
          .map((v) => [v[0], v[v.length - 1]]),
      };
    } else if (previewMode === "target") {
      // target
      // 重複は消す
      return {
        heading: [tableHeading[tableHeading.length - 1]],
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
      return { heading: tableHeading, rows: baseTable };
    }

    // ここには来ない
    return { heading: [], rows: [] };
  };

  return filterTable;
};

export default useResultModalPreview;
