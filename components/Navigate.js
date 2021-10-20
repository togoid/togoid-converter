import React, { useState, useEffect } from "react";
import { saveAs } from "file-saver";
import ResultModal from "../components/ResultModal";
import InformationModal from "../components/InformationModal";
import { executeQuery } from "../lib/util";
import { ArrowArea } from "react-arrow-master";
import { categories } from "../lib/setting";

const Navigate = (props) => {
  const [modalVisibility, setModalVisibility] = useState(false);
  const [tableData, setTableData] = useState({ heading: [], rows: [] });
  const [total, setTotal] = useState(0);
  const [informationModal, setInformationModal] = useState(false);
  const [database, setDatabase] = useState(null);
  const [visibleActionButtonIndex, setVisibleActionButtonIndex] = useState([
    null,
    null,
  ]);
  const [notConvertedIds, setNotConvertedIds] = useState([]);

  useEffect(() => {
    if (tableData.heading.length > 0) setModalVisibility(true);
  }, [tableData]);

  const selectDatabase = (database, i, j = null) => {
    const r = props.route.slice(0, i);
    if (i === 0 || r[i - 1]) {
      r[i] = database;
    } else {
      r[i - 1] = database;
    }

    if (
      i > 0 &&
      j !== null &&
      props.databaseNodesList[i + 1] &&
      props.databaseNodesList[i + 1][j] !== null
    ) {
      r[i + 1] = props.databaseNodesList[i + 1][j];
    }
    props.setRoute(r);
    const offset = props.offsetRoute.slice(0, i);
    offset[i] = j;
    props.setOffsetRoute(offset);
    return r;
  };

  const handleReset = () => {
    props.restartExplore();
  };

  const handleIdDownload = async (database, routeIndex) => {
    const r = selectDatabase(database, routeIndex).slice(0, routeIndex + 1);
    const d = await executeQuery(r, props.ids, "target", 10000, false);
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
    const d = await executeQuery(r, props.ids, "all", 100, false);
    const rows = d.results.map((v) => v.slice(0, routeIndex + 1));

    const dbRegExp = new RegExp(props.dbCatalogue[r[0].name].regex);
    const convertedIds = Array.from(new Set(d.results.map((item) => item[0])));
    setNotConvertedIds(
      props.ids.filter((i) => {
        const match = i.match(dbRegExp);
        const firstNamedCapture = Object.values(match.groups).find((v) => v);
        return convertedIds.indexOf(firstNamedCapture) === -1;
      })
    );

    if (routeIndex === props.databaseNodesList.length - 1) {
      setTotal(props.databaseNodesList[routeIndex][props.offsetRoute[1]].total);
    } else {
      setTotal(database.total);
    }

    setTableData({ heading, rows });
  };

  const showInformationModal = (v) => {
    const dbName = Object.keys(props.dbCatalogue).filter(
      (dataset) => dataset === v.name
    );
    setInformationModal(true);
    setDatabase(dbName[0]);
  };

  const handleActionButtonVisibility = (i, j) => {
    setVisibleActionButtonIndex([i, j]);
  };

  const handleSelectDropDown = (e) => {
    props.setSelectedDropDown(e.target.value);
  };

  const selectOther = (v = null) => {
    if (v) {
      console.log(v);
      props.lookupRoute(v);
    } else {
      console.log(props.selectedDropDown);
      props.lookupRoute(props.selectedDropDown);
    }
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
              <ArrowArea arrows={props.candidatePaths}>
                <div className="drawing">
                  {props.databaseNodesList &&
                    props.databaseNodesList.length > 0 &&
                    props.databaseNodesList.map((nodes, i) => (
                      <div className="item_wrapper" key={i}>
                        {i === 0 ? (
                          <div>
                            <React.Fragment>
                              <p className="item_first_heading">Convert from</p>
                              <p className="item_first_count_heading">
                                Matched
                              </p>
                            </React.Fragment>
                            <ul className="result_list first">
                              {nodes.map((v, j) => {
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
                                      id={`node${i}-${v.name}`}
                                      className="radio green"
                                    >
                                      <input
                                        type="radio"
                                        name={`result${i}`}
                                        id={`result${i}-${j}`}
                                        className="radio__input"
                                        checked={Boolean(
                                          props.offsetRoute[i] &&
                                            props.offsetRoute[i] === j
                                        )}
                                        onChange={() => selectDatabase(v, i, j)}
                                      />
                                      <label
                                        htmlFor={`result${i}-${j}`}
                                        className="radio__large_label green"
                                        style={{
                                          opacity: isActionButtonVisible
                                            ? 0.7
                                            : 1,
                                          backgroundColor: isActionButtonVisible
                                            ? "#000000"
                                            : categories[v.category]
                                            ? categories[v.category].color
                                            : null,
                                        }}
                                      >
                                        <span
                                          className="radio__large_label__inner"
                                          style={{
                                            color: isActionButtonVisible
                                              ? "#333333"
                                              : "#ffffff",
                                          }}
                                        >
                                          {props.dbCatalogue[v.name].label}
                                        </span>
                                      </label>
                                      {isActionButtonVisible && (
                                        <div className="action_icons">
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
                                    <p
                                      id={`total${i}-${v.name}`}
                                      className="total"
                                    >
                                      {v.total >= 0 ? v.total : "too many"}
                                    </p>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        ) : (
                          <div>
                            <ul className="result_list">
                              {nodes.map((v, j) => {
                                if (v === null) {
                                  return (
                                    <div className="item_wrapper">
                                      <ul className="result_list"></ul>
                                    </div>
                                  );
                                } else if (
                                  i !== props.databaseNodesList.length - 1 ||
                                  j < 1
                                ) {
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
                                        id={`node${i}-${v.name}-${j}`}
                                        className={`radio green ${
                                          v.total > 0 ? null : "not_found"
                                        }`}
                                      >
                                        <input
                                          type="radio"
                                          name={`result${i}`}
                                          id={`result${i}-${j}`}
                                          className="radio__input"
                                          checked={Boolean(
                                            props.offsetRoute[i] &&
                                              props.offsetRoute[i] === j
                                          )}
                                          onChange={() =>
                                            selectDatabase(v, i, j)
                                          }
                                          disabled={!v.total}
                                        />
                                        <label
                                          htmlFor={`result${i}-${j}`}
                                          className="radio__large_label green"
                                          style={{
                                            opacity: isActionButtonVisible
                                              ? 0.7
                                              : 1,
                                            backgroundColor: isActionButtonVisible
                                              ? "#000000"
                                              : categories[v.category]
                                              ? categories[v.category].color
                                              : null,
                                          }}
                                        >
                                          <span
                                            className="radio__large_label__inner"
                                            style={{
                                              color: isActionButtonVisible
                                                ? "#333333"
                                                : "#ffffff",
                                            }}
                                          >
                                            {props.dbCatalogue[v.name].label}
                                          </span>
                                        </label>
                                        {isActionButtonVisible && (
                                          <div className="action_icons">
                                            {v.total > 0 && (
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

                                            {v.total > 0 && (
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
                                      {i !==
                                        props.databaseNodesList.length - 1 && (
                                        <p
                                          id={`total${i}-${v.name}-${j}`}
                                          className="total"
                                        >
                                          {i ===
                                          props.databaseNodesList.length - 2
                                            ? props.databaseNodesList[i + 1][j]
                                                .total
                                            : i ===
                                                props.databaseNodesList.length -
                                                  3 &&
                                              props.databaseNodesList[i + 1][
                                                j
                                              ] === null
                                            ? props.databaseNodesList[i + 2][j]
                                                .total
                                            : v.total}
                                        </p>
                                      )}
                                    </li>
                                  );
                                }
                              })}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  {props.route.length === 1 &&
                    props.databaseNodesList.length === 1 && (
                      <div className="item_wrapper">
                        <ul className="result_list">
                          <div id={`nodeOther`} className={`radio green`}>
                            <input
                              type="radio"
                              name={`resultOther`}
                              id={`resultOther`}
                              className="radio__input"
                              onChange={() => selectOther()}
                            />
                            <label
                              htmlFor={`resultOther`}
                              className="radio__large_label green"
                            >
                              <select onChange={handleSelectDropDown}>
                                {Object.keys(props.dbCatalogue).map((key) => {
                                  if (
                                    !props.route.find((v) => v.name === key)
                                  ) {
                                    return (
                                      <option key={key} value={key}>
                                        {props.dbCatalogue[key].label}
                                      </option>
                                    );
                                  }
                                })}
                              </select>
                            </label>
                          </div>
                        </ul>
                      </div>
                    )}

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
                      notConvertedIds={notConvertedIds}
                      total={total}
                      setModalVisibility={setModalVisibility}
                      dbCatalogue={props.dbCatalogue}
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

export default Navigate;
