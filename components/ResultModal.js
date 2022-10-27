import React, { useState, useEffect } from "react";
import copy from "copy-to-clipboard";
import { executeQuery, exportCsvTsv, invokeUnparse } from "../lib/util";
import { categories } from "../lib/setting";
import { ArrowArea } from "react-arrow-master";
import { printf } from "fast-printf";

// 定数
const previewModeList = new Map([
  ["all", "All converted IDs"],
  ["pair", "Source and target IDs"],
  ["target", "Target IDs"],
  ["full", "All including unconverted IDs"],
]);

const ResultModal = (props) => {
  const [copied, setCopied] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);
  const [previewMode, setPreviewMode] = useState("all");
  const [lineMode, setLineMode] = useState(
    Array(props.tableData.heading.length).fill("")
  );
  const [routePath, setRoutePath] = useState();
  const [baseTable, setBaseTable] = useState();
  const [filterTable, setFilterTable] = useState();
  const [prefixList, setPrefixList] = useState([]);

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

  const handleMenu = (e) => {
    const newLineMode = lineMode.slice();
    newLineMode[e.target.id] = e.target.value;

    setLineMode(newLineMode);
  };

  const createBaseTable = (tableHeading, tableRows) => {
    const table = { heading: [], rows: [] };

    const subPrefixList = tableHeading.map((v, i) => {
      v["index"] = i;
      // formatがあれば使う なければ"prefixから取り出した値%s"で返す
      return v.format ?? [v.prefix.slice(v.prefix.lastIndexOf("/") + 1) + "%s"];
    });
    setPrefixList(subPrefixList);
    setLineMode(subPrefixList.map((v) => v[0]));

    table.rows = tableRows.map((v) => {
      return v.map((w, i) => {
        const formatIdObj = {};

        subPrefixList[i].forEach((x) => {
          formatIdObj[x] = w ? printf(x, w) : null;
        });
        // urlも作成する
        formatIdObj["url"] = w ? tableHeading[i].prefix + w : null;

        return formatIdObj;
      });
    });

    table.heading = tableHeading;

    return table;
  };

  const createExportTable = (tableHeading, tableRows) => {
    if (previewMode === "all") {
      // all
      const rows = tableRows.map((v) =>
        v.map((w, i) => [
          lineMode[i] === "url"
            ? tableHeading[i].prefix + w
            : printf(lineMode[i], w),
        ])
      );

      return { heading: tableHeading, rows };
    } else if (previewMode === "pair") {
      // origin and targets
      // 重複は消す
      return {
        heading: [tableHeading[0], tableHeading[tableHeading.length - 1]],
        rows: tableRows.map((v) => [
          [
            lineMode[0] === "url"
              ? tableHeading[0].prefix + v[0]
              : printf(lineMode[0], v[0]),
          ],
          [
            lineMode[tableHeading.length - 1] === "url"
              ? tableHeading[tableHeading.length - 1].prefix + v[v.length - 1]
              : printf(lineMode[tableHeading.length - 1], v[v.length - 1]),
          ],
        ]),
      };
    } else if (previewMode === "target") {
      // target
      // 重複は消す
      return {
        heading: [tableHeading[tableHeading.length - 1]],
        rows: tableRows.map((v) => [
          lineMode[tableHeading.length - 1] === "url"
            ? tableHeading[tableHeading.length - 1].prefix + v[v.length - 1]
            : printf(lineMode[tableHeading.length - 1], v[v.length - 1]),
        ]),
      };
    } else if (previewMode === "full") {
      // full
      const rows = tableRows.map((v) =>
        v.map((w, i) => [
          w
            ? lineMode[i] === "url"
              ? tableHeading[i].prefix + w
              : printf(lineMode[i], w)
            : null,
        ])
      );

      return { heading: tableHeading, rows };
    }
  };

  const handleClipboardCopy = async (e) => {
    e.preventDefault();
    const d = await executeQuery(props.route, props.ids, previewMode, 10000);

    const results =
      previewMode !== "target" ? d.results : d.results.map((v) => [v]);

    const { rows } = createExportTable(props.tableData.heading, results);
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
    const d = await executeQuery(props.route, props.ids, previewMode, 10000);

    const results =
      previewMode !== "target" ? d.results : d.results.map((v) => [v]);
    const { heading, rows } = createExportTable(
      props.tableData.heading,
      results
    );
    const h = heading.map((v) => v.label);
    exportCsvTsv([h, ...rows], extension, `result.${extension}`);
  };

  const handleClipboardURL = () => {
    const routeName = props.route.map((v) => v.name).join();
    const text = `https://api.togoid.dbcls.jp/convert?ids=${props.ids}&route=${routeName}&report=${previewMode}&format=csv`;
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
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div className="modal" onClick={() => props.setModalVisibility(false)}>
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
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
                    {[...previewModeList].map(([key, value], i) => {
                      if (i !== previewModeList.size - 1) {
                        return (
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
                        );
                      }
                    })}
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
                            onChange={(e) => handleMenu(e)}
                            value={lineMode[v.index]}
                          >
                            {prefixList[v.index].map((w) => (
                              <option key={w} value={w}>
                                Prefix ({w})
                              </option>
                            ))}
                            <option value="url">URLs</option>
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
        </div>
      </div>
    </div>
  );
};

export default ResultModal;
