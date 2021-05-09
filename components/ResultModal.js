import React, { useState, useEffect } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { saveAs } from "file-saver";
import { exportCSV } from "../lib/util";
import dbCatalogue from "../public/dataset.json";

const Explore = (props) => {
  const [exportMenuVisibility, setExportMenuVisibility] = useState(false);
  const [clipboardText, setClipboardText] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setClipboardText(createClipboardText(props.tableData.rows));
  }, [props.tableData]);

  useEffect(() => {
    if (copied) {
      setTimeout(() => {
        setCopied(false);
      }, 1000);
    }
  }, [copied]);

  const createClipboardText = (array) => {
    let text = "";
    array.forEach((v, i) => {
      if (i > 0) {
        text = text.concat("\n");
      }
      text = text.concat(v[v.length - 1]);
    });
    return text;
  };

  const handleExportCSV = () => {
    exportCSV([props.tableData.heading, ...props.tableData.rows]);
  };

  const handleIdDownload = () => {
    // todo APIから取得し直す
    const texts = props.tableData.rows.map((v) => v.slice().pop()).join("\r\n");
    const blob = new Blob([texts], {
      type: "text/plain;charset=utf-8",
    });
    saveAs(blob, "ids.txt");
  };

  const handleURLDownload = () => {
    // todo APIから取得し直す
    const dbName = props.route.slice().pop().name;
    const dbPrefix = dbCatalogue[dbName].prefix;
    const texts = props.tableData.rows
      .map((v) => dbPrefix + v.slice().pop())
      .join("\r\n");
    const blob = new Blob([texts], {
      type: "text/plain;charset=utf-8",
    });
    saveAs(blob, "urls.txt");
  };

  return (
    <div className="modal">
      <div className="modal__inner">
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
          <h2 className="title">ID forwarding</h2>

          <div className="modal__path">
            <p className="modal__heading">PATH</p>
            <div className="modal__path__frame">
              <div className="modal__path__frame__inner">
                {props.tableData.heading.map((v, i) => (
                  <div key={i} className="path_label green">
                    <span className="path_label__inner">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="modal__top">
            <div className="item_wrapper">
              <div className="input_search">
                <svg className="input_search__icon" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"
                  />
                </svg>
                <input type="search" className="input_search__input" />
              </div>
              <div className="export_button">
                <button
                  onClick={() => setExportMenuVisibility(!exportMenuVisibility)}
                  className="button_icon"
                >
                  <svg className="button_icon__icon" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z"
                    />
                  </svg>
                  <span className="button_icon__label">エクスポート</span>
                </button>
                {exportMenuVisibility ? (
                  <div className="button_pull_down__children">
                    <CopyToClipboard
                      text={clipboardText}
                      onCopy={() => setCopied(true)}
                    >
                      <button className="button_pull_down__children__item">
                        <svg className="icon" viewBox="0 0 24 24">
                          <path
                            fill="currentColor"
                            d="M4,15V9H12V4.16L19.84,12L12,19.84V15H4Z"
                          />
                        </svg>
                        変換後IDをクリップボードにコピー
                        {copied ? <span>Copied.</span> : null}
                      </button>
                    </CopyToClipboard>
                    <button
                      onClick={handleIdDownload}
                      className="button_pull_down__children__item"
                    >
                      <svg className="icon" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M9,5V9H21V5M9,19H21V15H9M9,14H21V10H9M4,9H8V5H4M4,19H8V15H4M4,14H8V10H4V14Z"
                        />
                      </svg>
                      変換後IDをダウンロード
                    </button>
                    <button
                      onClick={handleURLDownload}
                      className="button_pull_down__children__item"
                    >
                      <svg className="icon" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M9,5V9H21V5M9,19H21V15H9M9,14H21V10H9M4,9H8V5H4M4,19H8V15H4M4,14H8V10H4V14Z"
                        />
                      </svg>
                      変換後URLをダウンロード
                    </button>
                    <button
                      onClick={handleExportCSV}
                      className="button_pull_down__children__item"
                    >
                      <svg className="icon" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M9,5V9H21V5M9,19H21V15H9M9,14H21V10H9M4,9H8V5H4M4,19H8V15H4M4,14H8V10H4V14Z"
                        />
                      </svg>
                      CSVをダウンロード
                    </button>
                  </div>
                ) : (
                  ""
                )}
              </div>
            </div>
          </div>
          <table className="table">
            <thead>
              <tr>
                {props.tableData && props.tableData.heading.length > 0
                  ? props.tableData.heading.map((v, i) => <th key={i}>{v}</th>)
                  : null}
              </tr>
            </thead>
            <tbody>
              {props.tableData && props.tableData.rows.length > 0 ? (
                props.tableData.rows.map((data, i) => (
                  <tr key={i}>
                    {data.map((d, j) => {
                      return <td key={j}>{d}</td>;
                    })}
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
          {props.tableData && props.tableData.rows.length > 0 && (
            <button className="button_more">MORE</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Explore;
