import { useState, useEffect, useMemo } from "react";
import { printf } from "fast-printf";
import { executeQuery } from "../lib/util";

const createBaseTable = (tableHeading, tableRows) => {
  const baseTable = { heading: [], rows: [] };

  const prefixList = tableHeading.map((v, i) => {
    v["index"] = i;
    // formatがあれば使う なければ空配列で返す
    return v.format
      ? v.format.map((v) => {
          return { label: v.replace("%s", ""), value: v };
        })
      : [];
  });

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

  return { baseTable, prefixList };
};

/**
 *
 */
const useResultModalPreview = (
  tableData,
  previewMode,
  isCompact,
  route,
  ids
) => {
  const { baseTable, prefixList } = useMemo(
    () => createBaseTable(tableData.heading, tableData.rows),
    [tableData]
  );
  const [compactBaseTable, setCompactBaseTable] = useState();
  const [filterTable, setFilterTable] = useState(baseTable);

  useEffect(() => {
    if (!compactBaseTable) {
      (async () => {
        const d = await executeQuery({
          route: route,
          ids: ids,
          report: "full",
          limit: 100,
          compact: true,
        });
        const table = createCompactBaseTable(tableData.heading, d.results);
        setCompactBaseTable(table);
      })();
    } else if (isCompact) {
      if (compactBaseTable?.rows) {
        setFilterTable(editCompactTable(compactBaseTable));
      }
    } else {
      if (baseTable?.rows) {
        setFilterTable(editTable(baseTable));
      }
    }
  }, [isCompact, compactBaseTable]);

  useEffect(() => {
    if (isCompact) {
      if (compactBaseTable?.rows) {
        setFilterTable(editCompactTable(compactBaseTable));
      }
    } else {
      if (baseTable?.rows) {
        setFilterTable(editTable(baseTable));
      }
    }
  }, [previewMode]);

  const createCompactBaseTable = (tableHeading, tableRows) => {
    const baseTable = { heading: [], rows: [] };
    baseTable.rows = tableRows.map((v) => {
      return v.map((w, i) => {
        const formatIdObj = {};

        const idSplitList = w ? w.split(" ") : null;
        // prefixがある場合
        prefixList[i].forEach((x) => {
          formatIdObj[x.value] = w
            ? idSplitList.map((y) => printf(x.value, y)).join(" ")
            : null;
        });

        // idとurlは必ず作成する
        formatIdObj["id"] = w ?? null;
        formatIdObj["url"] = w
          ? idSplitList.map((x) => tableHeading[i].prefix + x).join(" ")
          : null;

        return formatIdObj;
      });
    });
    baseTable.heading = tableHeading;

    return baseTable;
  };

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
        heading: [baseTable.heading[baseTable.heading.length - 1]],
        rows: baseTable.rows
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

  return { baseTable, filterTable, prefixList };
};

export default useResultModalPreview;
