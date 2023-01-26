import { useState, useEffect } from "react";
import { printf } from "fast-printf";
import useSWRImmutable from "swr/immutable";
import { executeQuery } from "../lib/util";

const createBaseTable = (tableHeading, tableRows, prefixList) => {
  const baseTable = { heading: [], rows: [] };

  baseTable.rows = tableRows.map((v) => {
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
  baseTable.heading = tableHeading;
  return baseTable;
};

const createCompactBaseTable = (tableHeading, tableRows, prefixList) => {
  const baseTable = { heading: [], rows: [] };
  baseTable.rows = tableRows.map((v) => {
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
  baseTable.heading = tableHeading;

  return baseTable;
};

const fetcher = async (key, tableHeading, prefixList) => {
  const data = await executeQuery(key);

  const baseTable = key.compact
    ? createCompactBaseTable(tableHeading, data.results, prefixList)
    : createBaseTable(tableHeading, data.results, prefixList);

  return baseTable;
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
    if (baseTable?.rows) {
      if (isCompact) {
        setFilterTable(editCompactTable(baseTable));
      } else {
        setFilterTable(editTable(baseTable));
        if (!expandedTable) {
          setExpandedTable(baseTable);
        }
      }
    }
  }, [baseTable]);

  useEffect(() => {
    if (baseTable?.rows) {
      if (isCompact) {
        setFilterTable(editCompactTable(baseTable));
      } else {
        setFilterTable(editTable(baseTable));
      }
    }
  }, [previewMode]);

  const editTable = (table) => {
    if (previewMode === "all") {
      // all
      const rows = table.rows.filter((v) => v[v.length - 1].url);
      return { heading: table.heading, rows };
    } else if (previewMode === "pair") {
      // origin and targets
      // 重複は消す
      return {
        heading: [table.heading[0], table.heading[table.heading.length - 1]],
        rows: table.rows
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
        heading: [table.heading[table.heading.length - 1]],
        rows: table.rows
          .filter((v) => v[v.length - 1].url)
          .map((v) => [v[v.length - 1]])
          .filter(
            (v, i, self) => self.findIndex((w) => w[0].url === v[0].url) === i
          ),
      };
    } else if (previewMode === "full") {
      // full
      return table;
    }
  };

  const editCompactTable = (table) => {
    if (previewMode === "all") {
      // all
      const rows = table.rows.filter((v) => v[v.length - 1].url);
      return { heading: table.heading, rows };
    } else if (previewMode === "pair") {
      // origin and targets
      // 重複は消す
      return {
        heading: [table.heading[0], table.heading[table.heading.length - 1]],
        rows: table.rows
          .filter((v) => v[v.length - 1].url)
          .map((v) => [v[0], v[v.length - 1]]),
      };
    } else if (previewMode === "target") {
      // target
      // 重複は消す
      return {
        heading: [expandedTable.heading[expandedTable.heading.length - 1]],
        rows: expandedTable.rows
          .filter((v) => v[v.length - 1].url)
          .map((v) => [v[v.length - 1]])
          .filter(
            (v, i, self) => self.findIndex((w) => w[0].url === v[0].url) === i
          ),
      };
    } else if (previewMode === "full") {
      // full
      return table;
    }
  };

  return filterTable;
};

export default useResultModalPreview;
