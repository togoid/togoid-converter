import React, { useState, useEffect } from "react";
import copy from "copy-to-clipboard";
import { executeQuery, exportCsvTsv, invokeUnparse } from "../lib/util";
import { printf } from "fast-printf";
import ResultModalClipboardButton from "./ResultModalClipboardButton";

// 定数
const previewModeList = new Map([
  ["all", "All converted IDs"],
  ["pair", "Source and target IDs"],
  ["target", "Target IDs"],
  ["full", "All including unconverted IDs"],
]);

const ResultModalAction = (props) => {
  const [previewMode, setPreviewMode] = useState("all");
  const [formatMode, setFormatMode] = useState("Expanded");
  const [lineMode, setLineMode] = useState(
    Array(props.tableData.heading.length).fill("id")
  );
  const [baseTable, setBaseTable] = useState();
  const [filterTable, setFilterTable] = useState();
  const [prefixList, setPrefixList] = useState([]);

  useEffect(() => {
    const table = createBaseTable(
      props.tableData.heading,
      props.tableData.rows
    );
    setBaseTable(table);

    setFilterTable(editTable(table));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (baseTable?.rows) {
      setFilterTable(editTable(baseTable));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewMode]);

  const handleSelectPrefix = (e) => {
    const newLineMode = lineMode.slice();
    newLineMode[e.target.id] = e.target.value;

    setLineMode(newLineMode);
  };

  const createBaseTable = (tableHeading, tableRows) => {
    const table = { heading: [], rows: [] };

    const subPrefixList = tableHeading.map((v, i) => {
      v["index"] = i;
      // formatがあれば使う なければ空配列で返す
      return v.format
        ? v.format.map((v) => {
            return { label: v.replace("%s", ""), value: v };
          })
        : [];
    });
    setPrefixList(subPrefixList);

    table.rows = tableRows.map((v) => {
      return v.map((w, i) => {
        const formatIdObj = {};

        // prefixがある場合
        subPrefixList[i].forEach((x) => {
          formatIdObj[x.value] = w ? printf(x.value, w) : null;
        });

        // idとurlは必ず作成する
        formatIdObj["id"] = w ?? null;
        formatIdObj["url"] = w ? tableHeading[i].prefix + w : null;

        return formatIdObj;
      });
    });

    table.heading = tableHeading;

    return table;
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

  const createExportTable = (tableHeading, tableRows) => {
    if (previewMode === "all") {
      // all
      const rows = tableRows.map((v) =>
        v.map((w, i) => [joinPrefix(w, lineMode[i], tableHeading[i].prefix)])
      );

      return { heading: tableHeading, rows };
    } else if (previewMode === "pair") {
      // origin and targets
      return {
        heading: [tableHeading[0], tableHeading[tableHeading.length - 1]],
        rows: tableRows.map((v) => [
          [joinPrefix(v[0], lineMode[0], tableHeading[0].prefix)],
          [
            joinPrefix(
              v[v.length - 1],
              lineMode[lineMode.length - 1],
              tableHeading[tableHeading.length - 1].prefix
            ),
          ],
        ]),
      };
    } else if (previewMode === "target") {
      // target
      return {
        heading: [tableHeading[tableHeading.length - 1]],
        rows: tableRows.map((v) => [
          joinPrefix(
            v[v.length - 1],
            lineMode[lineMode.length - 1],
            tableHeading[tableHeading.length - 1].prefix
          ),
        ]),
      };
    } else if (previewMode === "full") {
      // full
      const rows = tableRows.map((v) =>
        v.map((w, i) => [
          w ? joinPrefix(w, lineMode[i], tableHeading[i].prefix) : null,
        ])
      );

      return { heading: tableHeading, rows };
    }
  };

  const joinPrefix = (id, mode, prefix) => {
    // nullチェックが必要な場合は関数に渡す前にチェックすること
    // reducedの際の処理を共通化させるためにsplitする
    if (mode === "id") {
      return id;
    } else if (mode === "url") {
      return id
        .split(" ")
        .map((v) => prefix + v)
        .join(" ");
    } else {
      return id
        .split(" ")
        .map((v) => printf(mode, v))
        .join(" ");
    }
  };

  const copyClipboard = async (isReduced) => {
    const d = await executeQuery({
      route: props.route,
      ids: props.ids,
      report: previewMode,
      reduced: isReduced,
    });

    const results =
      previewMode !== "target" ? d.results : d.results.map((v) => [v]);

    const { rows } = createExportTable(props.tableData.heading, results);
    const text = invokeUnparse(rows, "tsv");

    copy(text, {
      format: "text/plain",
    });
  };

  const handleExportCsvTsv = async (extension, isReduced) => {
    const d = await executeQuery({
      route: props.route,
      ids: props.ids,
      report: previewMode,
      reduced: isReduced,
    });

    const results =
      previewMode !== "target" ? d.results : d.results.map((v) => [v]);
    const { heading, rows } = createExportTable(
      props.tableData.heading,
      results
    );
    const h = heading.map((v) => v.label);
    exportCsvTsv([h, ...rows], extension, `result.${extension}`);
  };

  const copyClipboardURL = (isReduced) => {
    const routeName = props.route.map((v) => v.name).join();
    const text = `${process.env.NEXT_PUBLIC_API_ENDOPOINT}/convert?ids=${
      props.ids
    }&route=${routeName}&report=${previewMode}${
      isReduced ? "&reduced=1" : ""
    }&format=csv`;
    copy(text, {
      format: "text/plain",
    });
  };

  return (
    <>
      <div className="modal__top">
        <div className="item_wrapper">
          {props.tableData && props.tableData.rows.length > 0 && (
            <>
              <div className="report">
                <p className="modal__heading">Report</p>
                <div className="report__inner">
                  {[...previewModeList]
                    .filter(([key]) => key !== "full")
                    .map(([key, value], i) => (
                      <div className="radio" key={i}>
                        <input
                          id={i}
                          key={i}
                          value={key}
                          name="report"
                          type="radio"
                          className="radio__input"
                          checked={previewMode === key}
                          onChange={() => setPreviewMode(key)}
                        />
                        <label htmlFor={i} className="radio__label">
                          {value}
                        </label>
                      </div>
                    ))}
                </div>
                <div className="report__inner">
                  <div className="radio" key={previewModeList.size - 1}>
                    <input
                      id={previewModeList.size - 1}
                      key={previewModeList.size - 1}
                      value="full"
                      name="report"
                      type="radio"
                      className="radio__input"
                      checked={previewMode === "full"}
                      onChange={() => setPreviewMode("full")}
                    />
                    <label
                      htmlFor={previewModeList.size - 1}
                      className="radio__label"
                    >
                      {previewModeList.get("full")}
                    </label>
                  </div>
                </div>
              </div>

              <div className="report">
                <p className="modal__heading">Format</p>
                <div className="report__inner">
                  <div className="radio">
                    <input
                      id="expanded"
                      name="format"
                      type="radio"
                      className="radio__input"
                      checked={formatMode === "Expanded"}
                      onChange={() => setFormatMode("Expanded")}
                    />
                    <label htmlFor="expanded" className="radio__label">
                      Expanded
                    </label>
                  </div>
                  <div className="radio">
                    <input
                      id="compact"
                      name="format"
                      type="radio"
                      className="radio__input"
                      checked={formatMode === "Compact"}
                      onChange={() => setFormatMode("Compact")}
                    />
                    <label htmlFor="compact" className="radio__label">
                      Compact
                    </label>
                  </div>
                </div>
              </div>

              <div className="action">
                <p className="modal__heading">Action</p>
                <div className="action__inner">
                  <button
                    onClick={() => handleExportCsvTsv("csv")}
                    className="button_icon"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="11.497"
                      height="13.961"
                      viewBox="0 0 11.497 13.961"
                      className="button_icon__icon"
                    >
                      <path
                        id="download"
                        d="M5,16.961H16.5V15.319H5M16.5,7.927H13.212V3H8.285V7.927H5l5.749,5.749Z"
                        transform="translate(-5 -3)"
                        fill="#fff"
                      />
                    </svg>
                    Download as CSV
                  </button>
                  <button
                    onClick={() => handleExportCsvTsv("tsv")}
                    className="button_icon"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="11.497"
                      height="13.961"
                      viewBox="0 0 11.497 13.961"
                      className="button_icon__icon"
                    >
                      <path
                        id="download"
                        d="M5,16.961H16.5V15.319H5M16.5,7.927H13.212V3H8.285V7.927H5l5.749,5.749Z"
                        transform="translate(-5 -3)"
                        fill="#fff"
                      />
                    </svg>
                    Download as TSV
                  </button>
                  <ResultModalClipboardButton copyFunction={copyClipboard}>
                    Copy to clipboard
                  </ResultModalClipboardButton>
                  <ResultModalClipboardButton copyFunction={copyClipboardURL}>
                    Copy API URL
                  </ResultModalClipboardButton>
                </div>
                <div className="action__inner">
                  <button
                    onClick={() => handleExportCsvTsv("csv", true)}
                    className="button_icon"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="11.497"
                      height="13.961"
                      viewBox="0 0 11.497 13.961"
                      className="button_icon__icon"
                    >
                      <path
                        id="download"
                        d="M5,16.961H16.5V15.319H5M16.5,7.927H13.212V3H8.285V7.927H5l5.749,5.749Z"
                        transform="translate(-5 -3)"
                        fill="#fff"
                      />
                    </svg>
                    Download as reduced CSV
                  </button>
                  <button
                    onClick={() => handleExportCsvTsv("tsv", true)}
                    className="button_icon"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="11.497"
                      height="13.961"
                      viewBox="0 0 11.497 13.961"
                      className="button_icon__icon"
                    >
                      <path
                        id="download"
                        d="M5,16.961H16.5V15.319H5M16.5,7.927H13.212V3H8.285V7.927H5l5.749,5.749Z"
                        transform="translate(-5 -3)"
                        fill="#fff"
                      />
                    </svg>
                    Download as reduced TSV
                  </button>
                  <ResultModalClipboardButton
                    copyFunction={copyClipboard}
                    isReduced={true}
                  >
                    Copy reduced to clipboard
                  </ResultModalClipboardButton>
                  <ResultModalClipboardButton
                    copyFunction={copyClipboardURL}
                    isReduced={true}
                  >
                    Copy reduced API URL
                  </ResultModalClipboardButton>
                </div>
                {props.lastTargetCount === "10000+" && (
                  <div>
                    <div>
                      Warning : There is a lot of data and errors may occur
                    </div>
                    <div>
                      Please consider using the API limit and offset functions
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        {filterTable?.rows?.length > 0 && (
          <div>
            <p className="showing">
              <span className="showing__text">Preview</span>
            </p>
          </div>
        )}
      </div>

      <table className="table">
        <thead>
          <tr>
            {filterTable?.rows?.length > 0 &&
              filterTable.heading.map((v, i) => {
                return (
                  <th key={i}>
                    <fieldset>
                      <label htmlFor={i} className="select__label">
                        {v.label}
                      </label>
                      <select
                        id={v.index}
                        className="select white"
                        onChange={(e) => handleSelectPrefix(e)}
                        value={lineMode[v.index]}
                      >
                        <option value="id">ID</option>
                        {prefixList[v.index].map((w) => (
                          <option key={w.label} value={w.value}>
                            ID ({w.label})
                          </option>
                        ))}
                        <option value="url">URL</option>
                      </select>
                    </fieldset>
                  </th>
                );
              })}
          </tr>
        </thead>
        <tbody>
          {filterTable?.rows?.length > 0 ? (
            filterTable.rows.map((data, i) => (
              <tr key={i}>
                {data.map((d, j) => (
                  <td key={j}>
                    <a href={d.url} target="_blank" rel="noreferrer">
                      {d[lineMode[filterTable.heading[j].index]]}
                    </a>
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={props.tableData.heading.length}
                className="no_results"
              >
                No Results
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
};

export default ResultModalAction;
