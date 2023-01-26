import { useState, useEffect } from "react";
import { printf } from "fast-printf";
import useSWRImmutable from "swr/immutable";
import { executeQuery } from "../lib/util";

const createBaseTable = (tableRows, tableHeading, prefixList) => {
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

const createCompactBaseTable = (tableRows, tableHeading, prefixList) => {
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

const fetcher = async (key, tableHeading, prefixList) => {
  const data = await executeQuery(key);

  return key.compact
    ? createCompactBaseTable(data.results, tableHeading, prefixList)
    : createBaseTable(data.results, tableHeading, prefixList);
};

/**
 *
 */
const useResultModalPreview = (
  tableHeading,
  previewMode,
  isCompact,
  route,
  ids,
  prefixList
) => {
  const [filterTable, setFilterTable] = useState({});
  const [expandedTable, setExpandedTable] = useState(null);

  const { data: baseTable } = useSWRImmutable(
    {
      route: route,
      ids: ids,
      report: "full",
      limit: 100,
      compact: isCompact,
    },
    (key) => fetcher(key, tableHeading, prefixList),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  useEffect(() => {
    if (baseTable) {
      if (isCompact) {
        setFilterTable(editCompactTable());
      } else {
        setFilterTable(editTable());
        if (!expandedTable) {
          setExpandedTable(baseTable);
        }
      }
    }
  }, [baseTable]);

  useEffect(() => {
    if (baseTable) {
      if (isCompact) {
        setFilterTable(editCompactTable());
      } else {
        setFilterTable(editTable());
      }
    }
  }, [previewMode]);

  const editTable = () => {
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
                  w[w.length - 1].url === v[v.length - 1].url
              ) === i
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
            (v, i, self) => self.findIndex((w) => w[0].url === v[0].url) === i
          ),
      };
    } else if (previewMode === "full") {
      // full
      return { heading: tableHeading, rows: baseTable };
    }
  };

  const editCompactTable = () => {
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
          .map((v) => [v[0], v[v.length - 1]]),
      };
    } else if (previewMode === "target") {
      // target
      // 重複は消す
      return {
        heading: [tableHeading[tableHeading.length - 1]],
        rows: expandedTable
          .filter((v) => v[v.length - 1].url)
          .map((v) => [v[v.length - 1]])
          .filter(
            (v, i, self) => self.findIndex((w) => w[0].url === v[0].url) === i
          ),
      };
    } else if (previewMode === "full") {
      // full
      return { heading: tableHeading, rows: baseTable };
    }
  };

  return filterTable;
};

export default useResultModalPreview;
