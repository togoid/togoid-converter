import React, { useState, useEffect } from "react";
import copy from "copy-to-clipboard";
import { saveAs } from "file-saver";
import { executeQuery, exportCSV } from "../lib/util";
import { categories } from "../lib/setting";

const ResultModal = (props) => {
  const [copied, setCopied] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);
  const [showAllFailed, setShowAllFailed] = useState(false);
  const [showLinks, setShowLinks] = useState(
    Array(props.tableData.heading.length).fill(false)
  );
  const [previewMode, setPreviewMode] = useState(0);
  const [modTable, setModTable] = useState(null);
  const [notConvertedIds, setNotConvertedIds] = useState([]);
  const [lineMode, setLineMode] = useState(
    Array(props.tableData.heading.length).fill("ID")
  );

  useEffect(() => {
    const ids = [
      ...new Set(
        props.tableData.rows
          .filter((v) => v[v.length - 1] === null)
          .map((w) => w[0])
      ),
    ];
    setNotConvertedIds(ids);
  }, []);

  useEffect(() => {
    const result = formatPreviewTable(
      props.tableData.heading,
      props.tableData.rows
    );
    setModTable(result);
  }, [previewMode, lineMode]);

  const handleMenu = (e) => {
    const num = Number(e.target.value);
    const newShowLinks = showLinks.slice();
    newShowLinks[num] = !newShowLinks[num];
    setShowLinks(newShowLinks);
  };

  const handleTableID = (e) => {
    const newLineMode = lineMode.slice();
    if (e.target.value === "0" && previewMode === 2) {
      newLineMode[newLineMode.length - 1] = "ID";
    } else if (e.target.value === "1" && previewMode === 1) {
      newLineMode[newLineMode.length - 1] = "ID";
    } else {
      newLineMode[e.target.value] = "ID";
    }
    setLineMode(newLineMode);
  };
  const handleTableURL = (e) => {
    const newLineMode = lineMode.slice();
    if (e.target.value === "0" && previewMode === 2) {
      newLineMode[newLineMode.length - 1] = "URL";
    } else if (e.target.value === "1" && previewMode === 1) {
      newLineMode[newLineMode.length - 1] = "URL";
    } else {
      newLineMode[e.target.value] = "URL";
    }
    setLineMode(newLineMode);
  };

  const formatPreviewTable = (tableHeading, tableRows) => {
    const table = { heading: [], rows: [], url: [] };
    if (previewMode === 0) {
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
    } else if (previewMode === 1) {
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
    } else if (previewMode === 2) {
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
    } else if (previewMode === 3) {
      // verbose
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
    if (previewMode === 0) {
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
    } else if (previewMode === 1) {
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
    } else if (previewMode === 2) {
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
    } else if (previewMode === 3) {
      // verbose
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
    const d = await executeQuery(
      props.route,
      props.ids,
      getInclude(),
      10000,
      false
    );

    const results = previewMode !== 2 ? d.results : d.results.map((v) => [v]);
    const { rows } = formatExportTable(props.tableData.heading, results);
    const text = rows.join("\r\n");
    copy(text, {
      format: "text/plain",
    });
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1000);
  };

  const handleExportCSV = async () => {
    const d = await executeQuery(
      props.route,
      props.ids,
      getInclude(),
      10000,
      false
    );

    const results = previewMode !== 2 ? d.results : d.results.map((v) => [v]);
    const { heading, rows } = formatExportTable(
      props.tableData.heading,
      results
    );
    const h = heading.map((v) => v.label);
    exportCSV([h, ...rows]);
  };

  const handleExportTEXT = async () => {
    const d = await executeQuery(
      props.route,
      props.ids,
      getInclude(),
      10000,
      false
    );

    const results = previewMode !== 2 ? d.results : d.results.map((v) => [v]);
    const { rows } = formatExportTable(props.tableData.heading, results);

    const text = rows.join("\r\n");
    const blob = new Blob([text], {
      type: "text/plain;charset=utf-8",
    });
    saveAs(blob, "ids.txt");
  };

  const getInclude = () => {
    const includeList = ["all", "pair", "target", "verbose"];
    return includeList[previewMode];
  };

  const previewModeList = ["All", "Origin and targets", "Target", "Verbose"];

  const handleClipboardURL = () => {
    const include = getInclude();
    const routeName = props.route.map((v) => v.name).join();
    const text = `https://api.togoid.dbcls.jp/convert?ids=${props.ids}&route=${routeName}&include=${include}&format=csv`;
    copy(text, {
      format: "text/plain",
    });
    setUrlCopied(true);
    setTimeout(() => {
      setUrlCopied(false);
    }, 1000);
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
          <h2 className="title">Results</h2>

          <div className="modal__path">
            <p className="modal__heading">Route</p>
            <div className="modal__path__frame">
              <div className="modal__path__frame__inner">
                {props.tableData.heading.map((v, i) => (
                  <div
                    key={i}
                    className="path_label green"
                    style={{
                      backgroundColor: categories[v.category]
                        ? categories[v.category].color
                        : null,
                    }}
                  >
                    <span className="path_label__inner">{v.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="modal__top">
            <div className="item_wrapper">
              {(() => {
                if (notConvertedIds.length) {
                  const limit = showAllFailed ? 10000 : 3;
                  return (
                    <span className="non_forwarded">
                      {`IDs that were not converted: ${notConvertedIds
                        .filter((_, i) => i < limit)
                        .join(", ")} `}
                      {!showAllFailed && (
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setShowAllFailed(true);
                          }}
                        >
                          ...more
                        </a>
                      )}
                    </span>
                  );
                }
              })()}

              {props.tableData && props.tableData.rows.length > 0 && (
                <div className="export_button">
                  <select
                    name="selectTab"
                    id=""
                    className="dropdown"
                    onChange={(e) => setPreviewMode(Number(e.target.value))}
                  >
                    {previewModeList.map((v, i) => (
                      <option key={v} value={i}>
                        {v}
                      </option>
                    ))}
                  </select>
                  <button onClick={handleClipboardURL} className="button_icon">
                    <svg className="button_icon__icon" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"
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
                  <button onClick={handleClipboardCopy} className="button_icon">
                    {copied ? (
                      <span>
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Copied.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                      </span>
                    ) : (
                      <span>Copy to clipboard</span>
                    )}
                  </button>
                  <button onClick={handleExportCSV} className="button_icon">
                    Download as CSV
                  </button>
                  <button onClick={handleExportTEXT} className="button_icon">
                    Download as text
                  </button>
                </div>
              )}
            </div>
            {modTable && modTable.rows.length > 0 && (
              <div>
                {(() => {
                  if (props.total > 100) {
                    if (previewMode === 0) {
                      return (
                        <p className="showing">
                          Showing {modTable.rows.length} of {props.total}{" "}
                          results
                        </p>
                      );
                    } else {
                      return (
                        <p className="showing">
                          Showing {modTable.rows.length} of N results
                        </p>
                      );
                    }
                  } else if (previewMode === 3) {
                    return (
                      <p className="showing">
                        Showing {modTable.rows.length} of {props.total} results
                      </p>
                    );
                  } else {
                    return (
                      <p className="showing">
                        Showing {modTable.rows.length} of {modTable.rows.length}{" "}
                        results
                      </p>
                    );
                  }
                })()}
              </div>
            )}
          </div>
          <table className="table">
            <thead>
              <tr>
                {modTable &&
                  modTable.heading.length > 0 &&
                  modTable.heading.map((v, i) => (
                    <th key={i}>
                      {v.label}{" "}
                      <button value={i} onClick={handleMenu}>
                        ▼
                      </button>
                      {showLinks[i] && (
                        <div className="child_menu">
                          <button
                            value={i}
                            onClick={handleTableID}
                            className="child_menu__item"
                          >
                            IDs
                          </button>
                          <button
                            value={i}
                            onClick={handleTableURL}
                            className="child_menu__item"
                          >
                            URLs
                          </button>
                        </div>
                      )}
                    </th>
                  ))}
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
