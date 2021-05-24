import React, { useState, useEffect } from "react";
import ResultModal from "../components/ResultModal";
import { exportCSV, executeQuery } from "../lib/util";
import dbConfig from "../public/config.json";
import dbCatalogue from "../public/dataset.json";
import { ArrowArea } from "react-arrow-master";
import { categories } from "../lib/setting";

const Explore = (props) => {
  const [modalVisibility, setModalVisibility] = useState(false);
  const [tableData, setTableData] = useState({ heading: [], rows: [] });
  const [total, setTotal] = useState(0);
  const [informationModal, setInformationModal] = useState(false);
  const [database, setDatabase] = useState(null);
  const [visibleActionButtonIndex, setVisibleActionButtonIndex] = useState([
    null,
    null,
  ]);

  useEffect(() => {
    if (tableData.heading.length > 0) setModalVisibility(true);
  }, [tableData]);

  const selectDatabase = async (database, i) => {
    const r = props.route.slice(0, i);
    r[i] = database;
    props.setRoute(r);
  };

  const handleReset = () => {
    props.restartExplore();
  };

  const handleExportCSV = async (routeIndex) => {
    const r = props.route.slice(0, routeIndex + 1);
    const heading = props.route
      .filter((v, i) => i <= routeIndex)
      .map((v) => v.name);
    const d = await executeQuery(r, props.ids);
    exportCSV([heading, ...d.results]);
  };

  const showModal = async (routeIndex) => {
    const r = props.route.slice(0, routeIndex + 1);
    const heading = props.route
      .filter((v, i) => i <= routeIndex)
      .map((v) => dbCatalogue[v.name].label);
    const d = await executeQuery(r, props.ids);
    const rows = d.results.slice(0, 100).map((v) => v.slice(0, routeIndex + 1));

    setTotal(d.total);
    setTableData({ heading, rows });
  };

  const showInformationModal = async (v) => {
    const dbName = Object.keys(dbCatalogue).filter(
      (dataset) => dataset === v.name
    );
    setInformationModal(true);
    setDatabase(dbName);
  };
  const hideInformationModal = async () => {
    setInformationModal(false);
  };

  const handleActionButtonVisibility = (i, j) => {
    setVisibleActionButtonIndex([i, j]);
  };
  return (
    <div className="explore">
      <div className="drawing_area">
        <div className="panel">
          <div className="panel__button">
            <button onClick={handleReset} className="button_clear">
              Clear
            </button>
          </div>
          <div className="panel__inner">
            <div className="explore">
              <ArrowArea arrows={props.routePaths}>
                <ArrowArea arrows={props.candidatePaths}>
                  <div className="drawing">
                    {props.databaseNodesList &&
                      props.databaseNodesList.length > 0 &&
                      props.databaseNodesList.map((nodes, i) => (
                        <div className="item_wrapper" key={i}>
                          {i === 0 && (
                            <React.Fragment>
                              <p className="item_first_heading">Convert from</p>
                              <p className="item_first_count_heading">Ids</p>
                            </React.Fragment>
                          )}
                          <ul
                            className={
                              i === 0 ? "result_list first" : "result_list"
                            }
                          >
                            {nodes.map((v, j) => (
                              <li
                                key={j}
                                onMouseOver={() =>
                                  handleActionButtonVisibility(i, j)
                                }
                              >
                                <div
                                  id={`node${i}-${v.name}`}
                                  className={`radio green ${
                                    i === 0 || v.total > 0 ? null : "not_found"
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
                                    disabled={i > 0 && !v.total}
                                  />
                                  <label
                                    htmlFor={`result${i}-${j}`}
                                    className="radio__large_label green"
                                    style={{
                                      backgroundColor: categories[v.category]
                                        ? categories[v.category].color
                                        : null,
                                    }}
                                  >
                                    <span className="radio__large_label__inner">
                                      {dbCatalogue[v.name].label}
                                    </span>
                                  </label>
                                  {visibleActionButtonIndex[0] === i &&
                                    visibleActionButtonIndex[1] === j && (
                                      <div className="action_icons">
                                        {i > 0 && (
                                          <button
                                            onClick={() => showModal(i)}
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

                                        {i > 0 && (
                                          <button
                                            onClick={() => handleExportCSV(i)}
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
                                <p id={`total${i}-${v.name}`} className="total">
                                  {v.total}
                                </p>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}

                    {informationModal && (
                      <div className="modal modal--through">
                        <div className="modal__inner modal__inner--through">
                          <button
                            onClick={() => hideInformationModal()}
                            className="modal--through__close"
                          />
                          <h2 className="modal--through__title">
                            {dbCatalogue[database].label}
                          </h2>
                          <p className="modal--through__description">
                            {dbCatalogue[database].description}
                          </p>
                          {(() => {
                            const labels = Object.keys(dbConfig)
                              .filter((label) => label.indexOf(database) === 0)
                              .map((label, i) => {
                                const str = label.replace(`${database}-`, "");
                                return (
                                  <div
                                    className="path_label small green"
                                    key={i}
                                  >
                                    {str}
                                  </div>
                                );
                              });

                            if (labels.length) {
                              return (
                                <div className="modal--through__buttons path">
                                  <div className="path_label small white">
                                    LINK TO
                                  </div>
                                  <svg className="path" viewBox="0 0 24 24">
                                    <path
                                      fill="currentColor"
                                      d="M4,15V9H12V4.16L19.84,12L12,19.84V15H4Z"
                                    />
                                  </svg>
                                  <div className="path_children">{labels}</div>
                                </div>
                              );
                            }
                          })()}

                          <dl className="modal--through__data_list">
                            <div className="modal--through__data_list__item">
                              <dt>PREFIX</dt>
                              <dd>{dbCatalogue[database].prefix}</dd>
                            </div>

                            <div className="modal--through__data_list__item">
                              <dt>CATEGORY</dt>
                              <dd>{dbCatalogue[database].category}</dd>
                            </div>

                            {dbCatalogue[database].organization && (
                              <div className="modal--through__data_list__item">
                                <dt>ORGANIZATION</dt>
                                <dd>{dbCatalogue[database].organization}</dd>
                              </div>
                            )}
                          </dl>
                        </div>
                      </div>
                    )}

                    {modalVisibility && (
                      <ResultModal
                        route={props.route}
                        ids={props.ids}
                        tableData={tableData}
                        total={total}
                        setModalVisibility={setModalVisibility}
                      />
                    )}
                  </div>
                </ArrowArea>
              </ArrowArea>
            </div>
          </div>
        </div>
        <div className="notice_area">
          <p className="heading">NOTICE</p>
          <p className="text">
            - Your IDs match with “NCBI Gene”
            <br />
            - Relation(s) found: “HGNC”, “xxx”, “yyy”, “zzz”
            <br />- LINE 999 “xxx-xxx-xxxx“ is not match the pattern. <br />-
            LINE 999 “xxx-xxx-xxxx“ is not match the pattern.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Explore;
