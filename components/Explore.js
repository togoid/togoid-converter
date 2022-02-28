import React, { useState, useEffect } from "react";
import ResultModal from "../components/ResultModal";
import InformationModal from "../components/InformationModal";
import { executeQuery, exportCsvTsv } from "../lib/util";
import { ArrowArea } from "react-arrow-master";
import { categories } from "../lib/setting";

const Explore = (props) => {
  const [modalVisibility, setModalVisibility] = useState(false);
  const [tableData, setTableData] = useState({ heading: [], rows: [] });
  const [informationModal, setInformationModal] = useState(false);
  const [database, setDatabase] = useState(null);
  const [visibleActionButtonIndex, setVisibleActionButtonIndex] = useState([
    null,
    null,
  ]);
  const [convertedCount, setConvertedCount] = useState([]);

  useEffect(() => {
    if (tableData.heading.length > 0) setModalVisibility(true);
  }, [tableData]);

  const selectDatabase = (database, i) => {
    const r = props.route.slice(0, i);
    r[i] = database;
    props.setRoute(r);
    props.setPreviousRoute(r);
    return r;
  };

  const handleIdDownload = async (database, routeIndex) => {
    const r = selectDatabase(database, routeIndex).slice(0, routeIndex + 1);
    const d = await executeQuery(r, props.ids, "target", 10000, false, false);
    const prefix = props.dbCatalogue[database.name].prefix.split("/").slice(-1);

    exportCsvTsv(
      d.results.map((result) => [prefix + result]),
      "tsv",
      "ids.tsv"
    );
  };

  const showModal = async (database, routeIndex) => {
    const r = selectDatabase(database, routeIndex).slice(0, routeIndex + 1);
    const heading = r
      .filter((v, i) => i <= routeIndex)
      .map((v) => props.dbCatalogue[v.name]);
    const d = await executeQuery(r, props.ids, "verbose", 100, false, false);
    const rows = d.results.map((v) => v.slice(0, routeIndex + 1));

    setTableData({ heading, rows });
    const counts = r.map((v) => {
      return { source: v?.source, target: v?.target };
    });
    setConvertedCount(counts);
  };

  const showInformationModal = (v) => {
    setInformationModal(true);
    setDatabase(v.name);
  };

  const handleActionButtonVisibility = (i, j) => {
    setVisibleActionButtonIndex([i, j]);
  };

  return (
    <div className="explore">
      <div className="drawing_area">
        <div className="panel">
          <div className="panel__inner">
            <div className="explore">
              <ArrowArea arrows={props.candidatePaths}>
                <div className="drawing">
                  {props.databaseNodesList &&
                    props.databaseNodesList.length > 0 &&
                    props.databaseNodesList.map((nodes, i) => (
                      <React.Fragment key={i}>
                        {i !== 0 && (
                          <div className="item_wrapper" key={1}>
                            <ul className="label_list" key={2}>
                              {nodes.map((v, j) => {
                                return (
                                  <li key={j} className="label_list__item">
                                    <p
                                      id={`label${i}-${v.name}`}
                                      className="label_list__item__inner"
                                    >
                                      {v.link}
                                    </p>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        )}
                        <div className="item_wrapper" key={2}>
                          <ul
                            className={
                              i === 0 ? "result_list first" : "result_list"
                            }
                            key={1}
                          >
                            {nodes.map((v, j) => {
                              if (!(j > 0 && nodes[j - 1].name === v.name)) {
                                const isActionButtonVisible =
                                  visibleActionButtonIndex[0] === i &&
                                  visibleActionButtonIndex[1] === j;
                                return (
                                  <li
                                    key={j}
                                    onMouseOver={() =>
                                      handleActionButtonVisibility(i, j)
                                    }
                                    onMouseLeave={() =>
                                      handleActionButtonVisibility(null, null)
                                    }
                                    className="result_list__item"
                                  >
                                    <div
                                      id={`to${i}-${v.name}`}
                                      className={`radio green ${
                                        i === 0 || v.target > 0
                                          ? null
                                          : "not_found"
                                      }`}
                                    >
                                      <input
                                        type="radio"
                                        name={`result${i}`}
                                        id={`result${i}-${j}`}
                                        className="radio__input"
                                        checked={Boolean(
                                          props.route[i] &&
                                            props.route[i].name === v.name
                                        )}
                                        onChange={() => selectDatabase(v, i)}
                                        disabled={i > 0 && !v.target}
                                      />
                                      <label
                                        htmlFor={`result${i}-${j}`}
                                        className="radio__large_label green"
                                        style={{
                                          backgroundColor: isActionButtonVisible
                                            ? "#000000"
                                            : categories[v.category]
                                            ? categories[v.category].color
                                            : null,
                                        }}
                                      >
                                        <div
                                          id={`from${i}-${v.name}`}
                                          className="dummy"
                                        />
                                        <p
                                          className="radio__large_label__inner"
                                          style={{
                                            color: isActionButtonVisible
                                              ? "#333333"
                                              : "#ffffff",
                                          }}
                                        >
                                          {i > 0 ? (
                                            <span
                                              id={`converted${i}-${v.name}`}
                                              className="total"
                                            >
                                              {v.source >= 0
                                                ? v.source
                                                : "too many"}
                                            </span>
                                          ) : (
                                            <span
                                              id={`converted${i}-${v.name}`}
                                            ></span>
                                          )}
                                          <span className="text">
                                            {props.dbCatalogue[v.name].label}
                                          </span>
                                          <span
                                            id={`total${i}-${v.name}`}
                                            className="total"
                                          >
                                            {v.target >= 0
                                              ? v.target
                                              : "too many"}
                                          </span>
                                        </p>
                                      </label>
                                      {isActionButtonVisible && (
                                        <div className="action_icons">
                                          {i > 0 && v.target > 0 && (
                                            <button
                                              onClick={() => showModal(v, i)}
                                              className="action_icons__item"
                                            >
                                              <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 18 16"
                                              >
                                                <path
                                                  d="M5,4H19a2,2,0,0,1,2,2V18a2,2,0,0,1-2,2H5a2,2,0,0,1-2-2V6A2,2,0,0,1,5,4M5,8v4h6V8H5m8,0v4h6V8H13M5,14v4h6V14H5m8,0v4h6V14Z"
                                                  transform="translate(-3 -4)"
                                                  fill="#fff"
                                                />
                                              </svg>
                                            </button>
                                          )}

                                          {i > 0 && v.target > 0 && (
                                            <button
                                              onClick={() =>
                                                handleIdDownload(v, i)
                                              }
                                              className="action_icons__item"
                                            >
                                              <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 14 17"
                                              >
                                                <path
                                                  d="M5,20H19V18H5M19,9H15V3H9V9H5l7,7Z"
                                                  transform="translate(-5 -3)"
                                                  fill="#fff"
                                                />
                                              </svg>
                                            </button>
                                          )}

                                          <button
                                            onClick={() =>
                                              showInformationModal(v)
                                            }
                                            className="action_icons__item"
                                          >
                                            <svg
                                              xmlns="http://www.w3.org/2000/svg"
                                              viewBox="0 0 6.427 16.004"
                                            >
                                              <path
                                                d="M13.5,4A1.5,1.5,0,1,0,15,5.5,1.5,1.5,0,0,0,13.5,4m-.36,4.77c-1.19.1-4.44,2.69-4.44,2.69-.2.15-.14.14.02.42s.14.29.33.16.53-.34,1.08-.68c2.12-1.36.34,1.78-.57,7.07-.36,2.62,2,1.27,2.61.87s2.21-1.5,2.37-1.61c.22-.15.06-.27-.11-.52-.12-.17-.24-.05-.24-.05-.65.43-1.84,1.33-2,.76-.19-.57,1.03-4.48,1.7-7.17C14,10.07,14.3,8.67,13.14,8.77Z"
                                                transform="translate(-8.573 -4)"
                                                fill="#fafafa"
                                              />
                                            </svg>
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </li>
                                );
                              }
                            })}
                          </ul>
                        </div>
                      </React.Fragment>
                    ))}

                  {informationModal && (
                    <InformationModal
                      setInformationModal={setInformationModal}
                      database={database}
                      dbCatalogue={props.dbCatalogue}
                      dbConfig={props.dbConfig}
                      dbDesc={props.dbDesc}
                    />
                  )}

                  {modalVisibility && (
                    <ResultModal
                      route={props.route}
                      ids={props.ids}
                      tableData={tableData}
                      setModalVisibility={setModalVisibility}
                      dbCatalogue={props.dbCatalogue}
                      convertedCount={convertedCount}
                    />
                  )}
                </div>
              </ArrowArea>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Explore;
