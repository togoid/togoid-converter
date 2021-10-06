import React, { useState, useEffect } from "react";
import copy from "copy-to-clipboard";
import { saveAs } from "file-saver";
import { executeQuery, exportCSV } from "../lib/util";
import { categories } from "../lib/setting";

const ResultModal = (props) => {
  const [copied, setCopied] = useState(false);
  const [showAllFailed, setShowAllFailed] = useState(false);
  const [showLinks, setShowLinks] = useState(false);
  const [previewMode, setPreviewMode] = useState(0);
  const [modTable, setModTable] = useState(null);

  useEffect(() => {
    const [heading, rows, url] = formatTable(
      props.tableData.heading,
      props.tableData.rows
    );
    setModTable({
      heading: heading,
      rows: rows,
      url: url,
    });
  }, [previewMode]);

  const handleMenu = async () => {
    if (showLinks) {
      setShowLinks(false);
    } else {
      setShowLinks(true);
    }
  };

  const formatTable = (tableHeading, tableRows) => {
    if (previewMode === 0) {
      // all IDs
      const rows = tableRows.map((v) =>
        v.map((w, j) => [tableHeading[j].prefix.split("/").slice(-1) + w])
      );
      const url = tableRows.map((v) =>
        v.map((w, j) => [tableHeading[j].prefix + w])
      );
      return [tableHeading, rows, url];
    } else if (previewMode === 1) {
      // all URLs
      const rows = tableRows.map((v) =>
        v.map((w, j) => [tableHeading[j].prefix + w])
      );
      return [tableHeading, rows, rows];
    } else if (previewMode === 2) {
      // origin and targets IDs
      const heading = [tableHeading[0], tableHeading[tableHeading.length - 1]];
      const rows = tableRows.map((v) => [
        tableHeading[0].prefix.split("/").slice(-1) + v[0],
        tableHeading[tableHeading.length - 1].prefix.split("/").slice(-1) +
          v[v.length - 1],
      ]);
      const url = tableRows.map((v) => [
        tableHeading[0].prefix + v[0],
        tableHeading[tableHeading.length - 1].prefix + v[v.length - 1],
      ]);
      return [heading, rows, url];
    } else if (previewMode === 3) {
      // origin and taregets URLs
      const heading = [tableHeading[0], tableHeading[tableHeading.length - 1]];
      const rows = tableRows.map((v) => [
        tableHeading[0].prefix + v[0],
        tableHeading[tableHeading.length - 1].prefix + v[v.length - 1],
      ]);
      return [heading, rows, rows];
    } else if (previewMode === 4) {
      // target IDs
      const heading = [tableHeading[tableHeading.length - 1]];
      const rows = tableRows.map((v) => [
        tableHeading[tableHeading.length - 1].prefix.split("/").slice(-1) +
          v[v.length - 1],
      ]);
      const url = tableRows.map((v) => [
        tableHeading[tableHeading.length - 1].prefix + v[v.length - 1],
      ]);
      return [heading, rows, url];
    } else if (previewMode === 5) {
      // target URLs
      const heading = [tableHeading[tableHeading.length - 1]];
      const rows = tableRows.map((v) => [
        props.dbCatalogue[props.route[props.route.length - 1].name].prefix +
          v[v.length - 1],
      ]);
      return [heading, rows, rows];
    }
  };

  const handleClipboardCopy = async (e) => {
    const include =
      previewMode < 2 ? "all" : previewMode < 4 ? "pair" : "target";

    e.preventDefault();
    const d = await executeQuery(props.route, props.ids, include, 10000, false);

    const results = previewMode < 4 ? d.results : d.results.map((v) => [v]);
    const rows = formatTable(props.tableData.heading, results)[1];
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
    const include =
      previewMode < 2 ? "all" : previewMode < 4 ? "pair" : "target";
    const d = await executeQuery(props.route, props.ids, include, 10000, false);

    const results = previewMode < 4 ? d.results : d.results.map((v) => [v]);
    const [heading, rows] = formatTable(props.tableData.heading, results);
    const h = heading.map((v) => v.label);
    exportCSV([h, ...rows]);
  };

  // const handleIdDownload = async () => {
  //   const d = await executeQuery(
  //     props.route,
  //     props.ids,
  //     "target",
  //     10000,
  //     false
  //   );
  //   const prefix = props.tableData.heading[
  //     props.tableData.heading.length - 1
  //   ].prefix
  //     .split("/")
  //     .slice(-1);

  //   const text = d.results.map((result) => prefix + result).join("\r\n");
  //   const blob = new Blob([text], {
  //     type: "text/plain;charset=utf-8",
  //   });
  //   saveAs(blob, "ids.txt");
  // };

  // const handleURLDownload = async () => {
  //   const dbName = props.route[props.route.length - 1].name;
  //   const dbPrefix = props.dbCatalogue[dbName].prefix;
  //   const d = await executeQuery(
  //     props.route,
  //     props.ids,
  //     "target",
  //     10000,
  //     false
  //   );
  //   const texts = d.results.map((v) => dbPrefix + v).join("\r\n");
  //   const blob = new Blob([texts], {
  //     type: "text/plain;charset=utf-8",
  //   });
  //   saveAs(blob, "urls.txt");
  // };

  const previewModeList = [
    "all IDs",
    "all URLs",
    "origin and targets IDs",
    "origin and taregets URLs",
    "target IDs",
    "target URLs",
  ];

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
                if (props.notConvertedIds.length) {
                  const limit = showAllFailed ? 10000 : 3;
                  return (
                    <span className="non_forwarded">
                      {`IDs that were not converted: ${props.notConvertedIds
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

              <div className="tab_wrapper">
                {previewModeList.map((v, i) => (
                  <button
                    key={v}
                    onClick={() => setPreviewMode(i)}
                    className={
                      previewMode === i ? "button_tab active" : "button_tab"
                    }
                  >
                    {v}
                  </button>
                ))}
              </div>

              {props.tableData && props.tableData.rows.length > 0 && (
                <div className="export_button">
                  <button onClick={handleMenu} className="button_icon">
                    <svg className="button_icon__icon" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z"
                      />
                    </svg>
                    Export
                  </button>
                  {showLinks ? (
                    <div className="child_menu">
                      <button
                        onClick={handleClipboardCopy}
                        className="child_menu__item"
                      >
                        {copied ? (
                          <span>Copied.</span>
                        ) : (
                          <span>Copy to Clipboard</span>
                        )}
                      </button>
                      <button
                        onClick={handleExportCSV}
                        className="child_menu__item"
                      >
                        DOWNLOAD as CSV
                      </button>
                      <button
                        // onClick={handleURLDownload}
                        className="child_menu__item"
                      >
                        DOWNLOAD as TEXT
                      </button>
                      {/* <button
                        onClick={handleExportCSV}
                        className="child_menu__item"
                      >
                        Download table as CSV
                      </button> */}
                    </div>
                  ) : (
                    ""
                  )}
                </div>
              )}
            </div>
            {props.tableData && props.tableData.rows.length > 0 && (
              <p className="showing">
                Showing {props.tableData.rows.length} of {props.total} results
              </p>
            )}
          </div>
          <table className="table">
            <thead>
              <tr>
                {modTable &&
                  modTable.heading.length > 0 &&
                  modTable.heading.map((v, i) => <th key={i}>{v.label}</th>)}
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
