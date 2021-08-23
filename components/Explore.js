import React, { useState, useEffect } from "react";
import { saveAs } from "file-saver";
import ResultModal from "../components/ResultModal";
import { executeQuery } from "../lib/util";
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
  const [language, setLanguage] = useState("en");
  const [notConvertedIds, setNotConvertedIds] = useState([]);

  useEffect(() => {
    if (tableData.heading.length > 0) setModalVisibility(true);
  }, [tableData]);

  const selectDatabase = (database, i) => {
    const r = props.route.slice(0, i);
    r[i] = database;
    props.setRoute(r);
    return r;
  };

  const handleReset = () => {
    props.restartExplore();
  };

  const handleIdDownload = async (database, routeIndex) => {
    const r = selectDatabase(database, routeIndex).slice(0, routeIndex + 1);
    const d = await executeQuery(r, props.ids, "target");
    const prefix = props.dbCatalogue[database.name].prefix.split("/").slice(-1);

    const text = d.results.map((result) => prefix + result).join("\r\n");
    const blob = new Blob([text], {
      type: "text/plain;charset=utf-8",
    });
    saveAs(blob, "ids.txt");
  };

  const showModal = async (database, routeIndex) => {
    const r = selectDatabase(database, routeIndex).slice(0, routeIndex + 1);
    const heading = r
      .filter((v, i) => i <= routeIndex)
      .map((v) => props.dbCatalogue[v.name]);
    const d = await executeQuery(r, props.ids);
    const rows = d.results.slice(0, 100).map((v) => v.slice(0, routeIndex + 1));

    const dbRegExp = new RegExp(props.dbCatalogue[r[0].name].regex);
    const convertedIds = Array.from(new Set(d.results.map((item) => item[0])));
    setNotConvertedIds(
      props.ids.filter((i) => {
        const match = i.match(dbRegExp);
        const firstNamedCapture = Object.values(match.groups).find((v) => v);
        return convertedIds.indexOf(firstNamedCapture) === -1;
      })
    );

    setTotal(d.total);
    setTableData({ heading, rows });
  };

  const showInformationModal = async (v) => {
    const dbName = Object.keys(props.dbCatalogue).filter(
      (dataset) => dataset === v.name
    );
    setInformationModal(true);
    setDatabase(dbName[0]);
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
          {props.databaseNodesList && props.databaseNodesList.length > 0 && (
            <div className="panel__button">
              <button onClick={handleReset} className="button_clear">
                Clear
              </button>
            </div>
          )}
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
                              <p className="item_first_count_heading">
                                Matched
                              </p>
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
                                onMouseLeave={() =>
                                  handleActionButtonVisibility(null, null)
                                }
                                className="result_list__item"
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
                                      opacity:
                                        visibleActionButtonIndex[0] === i &&
                                        visibleActionButtonIndex[1] === j
                                          ? 0.7
                                          : 1,
                                      backgroundColor:
                                        visibleActionButtonIndex[0] === i &&
                                        visibleActionButtonIndex[1] === j
                                          ? "#000000"
                                          : categories[v.category]
                                          ? categories[v.category].color
                                          : null,
                                    }}
                                  >
                                    <span
                                      className="radio__large_label__inner"
                                      style={{
                                        color:
                                          visibleActionButtonIndex[0] === i &&
                                          visibleActionButtonIndex[1] === j
                                            ? "#333333"
                                            : "#ffffff",
                                      }}
                                    >
                                      {props.dbCatalogue[v.name].label}
                                    </span>
                                  </label>
                                  {visibleActionButtonIndex[0] === i &&
                                    visibleActionButtonIndex[1] === j && (
                                      <div className="action_icons">
                                        {i > 0 && v.total > 0 && (
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

                                        {i > 0 && v.total > 0 && (
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
                                <p id={`total${i}-${v.name}`} className="total">
                                  {v.total >= 0 ? v.total : "too many"}
                                </p>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}

                    {informationModal && (
                      <div
                        className="modal modal--through"
                        onClick={() => hideInformationModal()}
                      >
                        <div
                          className="modal__inner modal__inner--through"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <button
                            onClick={() => hideInformationModal()}
                            className="modal--through__close"
                          />
                          <h2 className="modal--through__title">
                            {props.dbCatalogue[database].label}
                          </h2>
                          <div className="select_lang">
                            <div className="radio">
                              <input
                                type="radio"
                                id="en"
                                name="en"
                                value="en"
                                className="radio__input"
                                style={{ width: "20px", height: "20px" }}
                                onChange={() => setLanguage("en")}
                                checked={language === "en"}
                              />
                              <label htmlFor="en" className="radio__label">
                                en
                              </label>
                            </div>
                            <div className="radio">
                              <input
                                type="radio"
                                id="ja"
                                name="ja"
                                value="ja"
                                className="radio__input"
                                style={{ width: "20px", height: "20px" }}
                                onChange={() => setLanguage("ja")}
                                checked={language === "ja"}
                              />
                              <label htmlFor="ja" className="radio__label">
                                ja
                              </label>
                            </div>
                          </div>
                          <p className="modal--through__description">
                            {Object.prototype.hasOwnProperty.call(
                              props.dbDesc,
                              database
                            ) &&
                              props.dbDesc[database][
                                `description_${language}`
                              ] && (
                                <div>
                                  <p>
                                    {
                                      props.dbDesc[database][
                                        `description_${language}`
                                      ]
                                    }
                                  </p>
                                  <p>
                                    Cited from{" "}
                                    <a
                                      href={`https://integbio.jp/dbcatalog/record/${props.dbCatalogue[database].catalog}`}
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      Integbio Database Catalog
                                    </a>
                                  </p>
                                </div>
                              )}
                          </p>
                          {(() => {
                            const labels = Array.from(
                              new Set(
                                Object.keys(props.dbConfig).map((k) => {
                                  const names = k.split("-");
                                  if (
                                    names.indexOf(database) === 0 ||
                                    names.indexOf(database) === 1
                                  ) {
                                    return names.indexOf(database) === 0
                                      ? names[1]
                                      : names[0];
                                  }
                                })
                              )
                            ).filter((v) => v);

                            if (labels.length) {
                              return (
                                <div className="modal--through__buttons path">
                                  <div className="path_label small white">
                                    LINK TO
                                  </div>
                                  <svg className="arrow" viewBox="0 0 24 24">
                                    <path
                                      fill="currentColor"
                                      d="M4,15V9H12V4.16L19.84,12L12,19.84V15H4Z"
                                    />
                                  </svg>
                                  <div className="path_children">
                                    {labels.map((l, i) => (
                                      <div
                                        className="path_label small green"
                                        style={{
                                          backgroundColor: categories[
                                            props.dbCatalogue[l].category
                                          ]
                                            ? categories[
                                                props.dbCatalogue[l].category
                                              ].color
                                            : null,
                                        }}
                                        key={i}
                                      >
                                        {props.dbCatalogue[l].label}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            }
                          })()}

                          <dl className="modal--through__data_list">
                            <div className="modal--through__data_list__item">
                              <dt>PREFIX</dt>
                              <dd>{props.dbCatalogue[database].prefix}</dd>
                            </div>
                            <div className="modal--through__data_list__item">
                              <dt>CATEGORY</dt>
                              <dd>{props.dbCatalogue[database].category}</dd>
                            </div>
                            {Object.prototype.hasOwnProperty.call(
                              props.dbDesc,
                              database
                            ) &&
                              props.dbDesc[database][
                                `organization_${language}`
                              ] && (
                                <div className="modal--through__data_list__item">
                                  <dt>ORGANIZATION</dt>
                                  <dd>
                                    {
                                      props.dbDesc[database][
                                        `organization_${language}`
                                      ]
                                    }
                                  </dd>
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
                        notConvertedIds={notConvertedIds}
                        total={total}
                        setModalVisibility={setModalVisibility}
                        dbCatalogue={props.dbCatalogue}
                      />
                    )}
                  </div>
                </ArrowArea>
              </ArrowArea>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Explore;
