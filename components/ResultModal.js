import React, { useState } from "react";
import copy from "copy-to-clipboard";
import { saveAs } from "file-saver";
import { executeQuery, exportCSV } from "../lib/util";
import dbCatalogue from "../public/dataset.json";
import { categories } from "../lib/setting";

const ResultModal = (props) => {
  const [copied, setCopied] = useState(false);
  const [showAllFailed, setShowAllFailed] = useState(false);
  const [showLinks, setShowLinks] = useState(false);

  const handleMenu = async () => {
    if (showLinks) {
      setShowLinks(false);
    } else {
      setShowLinks(true);
    }
  };

  const handleClipboardCopy = async (e) => {
    e.preventDefault();
    const d = await executeQuery(props.route, props.ids, "target");
    const prefix = props.tableData.heading[
      props.tableData.heading.length - 1
    ].prefix
      .split("/")
      .slice(-1);

    const text = d.results.map((result) => prefix + result).join("\r\n");
    copy(text, {
      format: "text/plain",
    });
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1000);
  };

  const handleExportCSV = async () => {
    const d = await executeQuery(props.route, props.ids);
    const h = props.tableData.heading.map((v) => v.label);
    const result = d.results.map((data) =>
      data.map(
        (d, j) => props.tableData.heading[j].prefix.split("/").slice(-1) + d
      )
    );
    exportCSV([h, ...result]);
  };

  const handleIdDownload = async () => {
    const d = await executeQuery(props.route, props.ids, "target");
    const prefix = props.tableData.heading[
      props.tableData.heading.length - 1
    ].prefix
      .split("/")
      .slice(-1);

    const text = d.results.map((result) => prefix + result).join("\r\n");
    const blob = new Blob([text], {
      type: "text/plain;charset=utf-8",
    });
    saveAs(blob, "ids.txt");
  };

  const handleURLDownload = async () => {
    const dbName = props.route[props.route.length - 1].name;
    const dbPrefix = dbCatalogue[dbName].prefix;
    const d = await executeQuery(props.route, props.ids, "target");
    const texts = d.results.map((v) => dbPrefix + v).join("\r\n");
    const blob = new Blob([texts], {
      type: "text/plain;charset=utf-8",
    });
    saveAs(blob, "urls.txt");
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
                if (props.notConvertedIds.length > 0) {
                  const limit = showAllFailed ? 10000 : 3;
                  return (
                    <span className="non_forwarded">
                      {`IDs that were not converted: ${props.notConvertedIds
                        .filter((v, i) => i < limit)
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
                          <span>Copy target IDs.</span>
                        )}
                      </button>
                      <button
                        onClick={handleIdDownload}
                        className="child_menu__item"
                      >
                        Download target IDs
                      </button>
                      <button
                        onClick={handleURLDownload}
                        className="child_menu__item"
                      >
                        Download target URLs
                      </button>
                      <button
                        onClick={handleExportCSV}
                        className="child_menu__item"
                      >
                        Download table as CSV
                      </button>
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
                {props.tableData &&
                  props.tableData.heading.length > 0 &&
                  props.tableData.heading.map((v, i) => (
                    <th key={i}>{v.label}</th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {props.tableData && props.tableData.rows.length > 0 ? (
                props.tableData.rows.map((data, i) => (
                  <tr key={i}>
                    {data.map((d, j) => (
                      <td key={j}>
                        <a
                          href={props.tableData.heading[j].prefix + d}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {props.tableData.heading[j].prefix
                            .split("/")
                            .slice(-1) + d}
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
