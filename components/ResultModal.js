import React, { useState, useEffect } from "react";
import copy from "copy-to-clipboard";
import { executeQuery, exportCsvTsv, invokeUnparse } from "../lib/util";
import { categories } from "../lib/setting";
import { ArrowArea } from "react-arrow-master";

const ResultModal = (props) => {
  const [copied, setCopied] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);
  const [previewMode, setPreviewMode] = useState("All converted IDs");
  const [modTable, setModTable] = useState(null);
  const [lineMode, setLineMode] = useState(
    Array(props.tableData.heading.length).fill("ID")
  );
  const [routePath, setRoutePath] = useState();

  useEffect(() => {
    const routePathList = props.tableData.heading.flatMap((v, i) => {
      if (i === 0) {
        return getResultPathStyle(`label-${i}`, `link-${i + 1}`, "none");
      } else if (i === props.tableData.heading.length - 1) {
        return getResultPathStyle(`link-${i}`, `label-${i}`, "default");
      } else {
        return [
          getResultPathStyle(`link-${i}`, `label-${i}`, "default"),
          getResultPathStyle(`label-${i}`, `link-${i + 1}`, "none"),
        ];
      }
    });
    setRoutePath(routePathList);
  }, []);

  useEffect(() => {
    const result = formatPreviewTable(
      props.tableData.heading,
      props.tableData.rows
    );
    setModTable(result);
  }, [previewMode, lineMode]);

  const previewModeList = [
    "All converted IDs",
    "Source and target IDs",
    "Target IDs",
    "All including unconverted IDs",
  ];
  const getReport = () => {
    const reportObj = {
      "All converted IDs": "all",
      "Source and target IDs": "pair",
      "Target IDs": "target",
      "All including unconverted IDs": "full",
    };
    return reportObj[previewMode];
  };

  const handleMenu = (e) => {
    const newLineMode = lineMode.slice();
    newLineMode[e.target.id] = e.target.value;
    setLineMode(newLineMode);
  };

  const formatPreviewTable = (tableHeading, tableRows) => {
    const table = { heading: [], rows: [], url: [] };
    if (previewMode === "All converted IDs") {
      // all
      const subPrefixList = tableHeading.map((v, i) => {
        // 表示モード増やすとき用
        if (lineMode[i] === "ID") {
          return v.prefix.slice(v.prefix.lastIndexOf("/") + 1);
        } else if (lineMode[i] === "URL") {
          return tableHeading[i].prefix;
        }
      });

      const rows = [];
      const url = [];
      for (const v of tableRows.filter((v) => v[v.length - 1] !== null)) {
        rows.push(v.map((w, j) => [subPrefixList[j] + w]));
        url.push(v.map((w, j) => [tableHeading[j].prefix + w]));
      }
      table.heading = tableHeading;
      table.rows = rows;
      table.url = url;
    } else if (previewMode === "Source and target IDs") {
      // origin and targets
      const subPrefixList = [
        lineMode[0] === "ID"
          ? tableHeading[0].prefix.slice(
              tableHeading[0].prefix.lastIndexOf("/") + 1
            )
          : tableHeading[0].prefix,
        lineMode[tableHeading.length - 1] === "ID"
          ? tableHeading[tableHeading.length - 1].prefix.slice(
              tableHeading[tableHeading.length - 1].prefix.lastIndexOf("/") + 1
            )
          : tableHeading[tableHeading.length - 1].prefix,
      ];
      table.heading = [tableHeading[0], tableHeading[tableHeading.length - 1]];
      const rows = [];
      const url = [];
      for (const v of tableRows.filter((v) => v[v.length - 1] !== null)) {
        const start = subPrefixList[0] + v[0];
        const goal = subPrefixList[subPrefixList.length - 1] + v[v.length - 1];
        if (!rows.find((w) => w[0] === start && w[1] === goal)) {
          rows.push([start, goal]);
          url.push([
            tableHeading[0].prefix + v[0],
            tableHeading[tableHeading.length - 1].prefix + v[v.length - 1],
          ]);
        }
      }
      table.rows = rows;
      table.url = url;
    } else if (previewMode === "Target IDs") {
      // target
      const subPrefixList = [
        lineMode[tableHeading.length - 1] === "ID"
          ? tableHeading[tableHeading.length - 1].prefix.slice(
              tableHeading[tableHeading.length - 1].prefix.lastIndexOf("/") + 1
            )
          : tableHeading[tableHeading.length - 1].prefix,
      ];
      table.heading = [tableHeading[tableHeading.length - 1]];
      const rows = [];
      const url = [];
      for (const v of tableRows.filter((v) => v[v.length - 1] !== null)) {
        const goal = subPrefixList[subPrefixList.length - 1] + v[v.length - 1];
        if (!rows.find((w) => w[0] === goal)) {
          rows.push([goal]);
          url.push([
            tableHeading[tableHeading.length - 1].prefix + v[v.length - 1],
          ]);
        }
      }
      table.rows = rows;
      table.url = url;
    } else if (previewMode === "All including unconverted IDs") {
      // full
      const subPrefixList = tableHeading.map((v, i) => {
        // 表示モード増やすとき用
        if (lineMode[i] === "ID") {
          return v.prefix.slice(v.prefix.lastIndexOf("/") + 1);
        } else if (lineMode[i] === "URL") {
          return tableHeading[i].prefix;
        }
      });
      const rows = [];
      const url = [];
      for (const v of tableRows) {
        rows.push(
          v.map((w, j) => (w === null ? [""] : [subPrefixList[j] + w]))
        );
        url.push(v.map((w, j) => [tableHeading[j].prefix + w]));
      }
      table.heading = tableHeading;
      table.rows = rows;
      table.url = url;
    }
    return table;
  };

  const formatExportTable = (tableHeading, tableRows) => {
    const exportTable = { heading: [], rows: [] };
    if (previewMode === "All converted IDs") {
      // all
      const subPrefixList = tableHeading.map((v, i) => {
        // 表示モード増やすとき用
        if (lineMode[i] === "ID") {
          return v.prefix.slice(v.prefix.lastIndexOf("/") + 1);
        } else if (lineMode[i] === "URL") {
          return tableHeading[i].prefix;
        }
      });
      exportTable.heading = tableHeading;
      exportTable.rows = tableRows
        .filter((v) => v[v.length - 1] !== null)
        .map((v) => v.map((w, j) => [subPrefixList[j] + w]));
    } else if (previewMode === "Source and target IDs") {
      // origin and targets
      const subPrefixList = [
        lineMode[0] === "ID"
          ? tableHeading[0].prefix.slice(
              tableHeading[0].prefix.lastIndexOf("/") + 1
            )
          : tableHeading[0].prefix,
        lineMode[tableHeading.length - 1] === "ID"
          ? tableHeading[tableHeading.length - 1].prefix.slice(
              tableHeading[tableHeading.length - 1].prefix.lastIndexOf("/") + 1
            )
          : tableHeading[tableHeading.length - 1].prefix,
      ];
      exportTable.heading = [
        tableHeading[0],
        tableHeading[tableHeading.length - 1],
      ];
      exportTable.rows = [
        ...new Set(
          tableRows
            .filter((v) => v[v.length - 1] !== null)
            .map((v) =>
              JSON.stringify([
                subPrefixList[0] + v[0],
                subPrefixList[subPrefixList.length - 1] + v[v.length - 1],
              ])
            )
        ),
      ].map(JSON.parse);
    } else if (previewMode === "Target IDs") {
      // target
      const subPrefixList = [
        lineMode[tableHeading.length - 1] === "ID"
          ? tableHeading[tableHeading.length - 1].prefix.slice(
              tableHeading[tableHeading.length - 1].prefix.lastIndexOf("/") + 1
            )
          : tableHeading[tableHeading.length - 1].prefix,
      ];
      exportTable.heading = [tableHeading[tableHeading.length - 1]];
      exportTable.rows = [
        ...new Set(
          tableRows
            .filter((v) => v[v.length - 1] !== null)
            .map(
              (v) => subPrefixList[subPrefixList.length - 1] + v[v.length - 1]
            )
        ),
      ].map((w) => [w]);
    } else if (previewMode === "All including unconverted IDs") {
      // full
      const subPrefixList = tableHeading.map((v, i) => {
        // 表示モード増やすとき用
        if (lineMode[i] === "ID") {
          return v.prefix.slice(v.prefix.lastIndexOf("/") + 1);
        } else if (lineMode[i] === "URL") {
          return tableHeading[i].prefix;
        }
      });
      exportTable.heading = tableHeading;
      exportTable.rows = tableRows.map((v) =>
        v.map((w, j) => (w === null ? [""] : [subPrefixList[j] + w]))
      );
    }
    return exportTable;
  };

  const handleClipboardCopy = async (e) => {
    e.preventDefault();
    const d = await executeQuery(props.route, props.ids, getReport(), 10000);

    const results =
      previewMode !== "Target IDs" ? d.results : d.results.map((v) => [v]);
    const { rows } = formatExportTable(props.tableData.heading, results);
    const text = invokeUnparse(rows, "tsv");
    copy(text, {
      format: "text/plain",
    });
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1000);
  };

  const handleExportCsvTsv = async (extension) => {
    const d = await executeQuery(props.route, props.ids, getReport(), 10000);

    const results =
      previewMode !== "Target IDs" ? d.results : d.results.map((v) => [v]);
    const { heading, rows } = formatExportTable(
      props.tableData.heading,
      results
    );
    const h = heading.map((v) => v.label);
    exportCsvTsv([h, ...rows], extension, `result.${extension}`);
  };

  const handleClipboardURL = () => {
    const report = getReport();
    const routeName = props.route.map((v) => v.name).join();
    const text = `https://api.togoid.dbcls.jp/convert?ids=${props.ids}&route=${routeName}&report=${report}&format=csv`;
    copy(text, {
      format: "text/plain",
    });
    setUrlCopied(true);
    setTimeout(() => {
      setUrlCopied(false);
    }, 1000);
  };

  const getResultPathStyle = (from, to, head) => {
    return {
      from: {
        id: from,
        posX: "right",
        posY: "middle",
      },
      to: {
        id: to,
        posX: "left",
        posY: "middle",
      },
      style: {
        color: "#1A8091",
        head: head,
        arrow: "smooth",
        width: 1.5,
      },
    };
  };

  return (
    <div className="modal" onClick={() => props.setModalVisibility(false)}>
      <div
        className="modal__inner"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="modal__scroll_area">
          <button
            onClick={() => props.setModalVisibility(false)}
            className="modal__close"
          >
            <svg viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
              />
            </svg>
          </button>
          <h2 className="modal--through__title">Results</h2>

          <div className="modal__path">
            <p className="modal__heading">Route</p>
            <div className="modal__path__frame">
              <div className="modal__path__frame__inner">
                <ArrowArea arrows={routePath}>
                  <div className="modal__path__frame__inner">
                    {props.tableData.heading.map((v, i) => (
                      <div className="modal__path__frame__item" key={i}>
                        {i !== 0 && (
                          <div className="path_label white" id={`link-${i}`}>
                            {props.route[i].link}
                          </div>
                        )}
                        <div
                          key={i}
                          className="path_label green"
                          id={`label-${i}`}
                          style={{
                            backgroundColor: categories[v.category]
                              ? categories[v.category].color
                              : null,
                          }}
                        >
                          {i !== 0 && props.convertedCount[i].source && (
                            <span id={`converted${i}`} className="total">
                              {props.convertedCount[i].source}
                            </span>
                          )}
                          <span className="path_label__inner">{v.label}</span>
                          {props.convertedCount[i].target && (
                            <span id={`total${i}`} className="total">
                              {props.convertedCount[i].target}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ArrowArea>
              </div>
            </div>
          </div>

          <div className="modal__top">
            <div className="item_wrapper">
              {props.tableData && props.tableData.rows.length > 0 && (
                <div className="report">
                  <p className="modal__heading">Report</p>
                  <div className="report__inner">
                    {previewModeList.map((v, i) => {
                      if (i !== previewModeList.length - 1) {
                        return (
                          <div className="radio" key={i}>
                            <input
                              id={i}
                              key={v}
                              value={v}
                              name="report"
                              type="radio"
                              className="radio__input"
                              checked={v === previewMode}
                              onChange={() => setPreviewMode(v)}
                            />
                            <label htmlFor={i} className="radio__label">
                              {v}
                            </label>
                          </div>
                        );
                      }
                    })}
                  </div>
                  <div className="report__inner">
                    <div className="radio" key={previewModeList.length - 1}>
                      <input
                        id={previewModeList.length - 1}
                        key={previewModeList[previewModeList.length - 1]}
                        value={previewModeList[previewModeList.length - 1]}
                        name="report"
                        type="radio"
                        className="radio__input"
                        checked={
                          previewModeList[previewModeList.length - 1] ===
                          previewMode
                        }
                        onChange={() =>
                          setPreviewMode(
                            previewModeList[previewModeList.length - 1]
                          )
                        }
                      />
                      <label
                        htmlFor={previewModeList.length - 1}
                        className="radio__label"
                      >
                        {previewModeList[previewModeList.length - 1]}
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {props.tableData && props.tableData.rows.length > 0 && (
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
                    <button
                      onClick={handleClipboardCopy}
                      className="button_icon"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="13.895"
                        viewBox="0 0 12 13.895"
                        className="button_icon__icon"
                      >
                        <path
                          d="M12.737,13.632H5.789V4.789h6.947m0-1.263H5.789A1.263,1.263,0,0,0,4.526,4.789v8.842a1.263,1.263,0,0,0,1.263,1.263h6.947A1.263,1.263,0,0,0,14,13.632V4.789a1.263,1.263,0,0,0-1.263-1.263M10.842,1H3.263A1.263,1.263,0,0,0,2,2.263v8.842H3.263V2.263h7.579Z"
                          transform="translate(-2 -1)"
                          fill="#fff"
                        />
                      </svg>

                      {copied ? (
                        <span>
                          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Copied.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        </span>
                      ) : (
                        <span>Copy to clipboard</span>
                      )}
                    </button>
                    <button
                      onClick={handleClipboardURL}
                      className="button_icon"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="13.895"
                        viewBox="0 0 12 13.895"
                        className="button_icon__icon"
                      >
                        <path
                          d="M12.737,13.632H5.789V4.789h6.947m0-1.263H5.789A1.263,1.263,0,0,0,4.526,4.789v8.842a1.263,1.263,0,0,0,1.263,1.263h6.947A1.263,1.263,0,0,0,14,13.632V4.789a1.263,1.263,0,0,0-1.263-1.263M10.842,1H3.263A1.263,1.263,0,0,0,2,2.263v8.842H3.263V2.263h7.579Z"
                          transform="translate(-2 -1)"
                          fill="#fff"
                        />
                      </svg>
                      {urlCopied ? (
                        <span>
                          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Copied.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        </span>
                      ) : (
                        <span>Copy API URL</span>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
            {modTable && modTable.rows.length > 0 && (
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
                {modTable &&
                  modTable.heading.length > 0 &&
                  modTable.heading.map((v, i) => {
                    const lineNum =
                      (i === 0 && previewMode === "Target IDs") ||
                      (i === 1 && previewMode === "Source and target IDs")
                        ? lineMode.length - 1
                        : i;
                    return (
                      <th key={i}>
                        <fieldset>
                          <label htmlFor={lineNum} className="select__label">
                            {v.label}{" "}
                          </label>
                          <select
                            id={lineNum}
                            className="select white"
                            onChange={(e) => handleMenu(e)}
                            value={lineMode[lineNum]}
                          >
                            <option value="ID">IDs</option>
                            <option value="URL">URLs</option>
                          </select>
                        </fieldset>
                      </th>
                    );
                  })}
              </tr>
            </thead>
            <tbody>
              {modTable && modTable.rows.length > 0 ? (
                modTable.rows.map((data, i) => (
                  <tr key={i}>
                    {data.map((d, j) => (
                      <td key={j}>
                        <a
                          href={modTable.url[i][j]}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {d}
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
        </div>
      </div>
    </div>
  );
};

export default ResultModal;
