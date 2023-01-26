import React, { useState, useEffect } from "react";
import ResultModal from "../components/ResultModal";
import InformationModal from "../components/InformationModal";
import { executeQuery, exportCsvTsv } from "../lib/util";
import { ArrowArea } from "react-arrow-master";
import { categories } from "../lib/setting";
import useConfig from "../hooks/useConfig";

const Navigate = (props) => {
  const [modalVisibility, setModalVisibility] = useState(false);
  const [tableData, setTableData] = useState({ heading: [], rows: [] });
  const [informationModal, setInformationModal] = useState(false);
  const [database, setDatabase] = useState(null);
  const [visibleActionButtonIndex, setVisibleActionButtonIndex] = useState([
    null,
    null,
  ]);
  const [convertedCount, setConvertedCount] = useState([]);

  const { datasetConfig } = useConfig();

  useEffect(() => {
    if (tableData.heading.length > 0) setModalVisibility(true);
  }, [tableData]);

  const selectDatabase = (database) => {
    props.setRoute([database]);
    props.setOffsetRoute(null);
  };

  const selectDatabaseModal = (i, j) => {
    const r = props.databaseNodesList
      .map((node, l) => (l === 0 ? props.route[0] : node[j]))
      .filter((v) => v)
      .slice(0, i + 1);
    props.setRoute(r);
    props.setOffsetRoute(j);
    return r;
  };

  const handleIdDownload = async (database, routeIndex, j) => {
    const r = selectDatabaseModal(routeIndex, j);
    const d = await executeQuery({
      route: r,
      ids: props.ids,
      report: "target",
    });
    const prefix = datasetConfig[database.name].prefix.split("/").slice(-1);

    exportCsvTsv(
      d.results.map((result) => [prefix + result]),
      "tsv",
      "ids.tsv"
    );
  };

  const showModal = async (database, routeIndex, j) => {
    const r = selectDatabaseModal(routeIndex, j);
    const heading = r.map((v) => datasetConfig[v.name]);
    const d = await executeQuery({
      route: r,
      ids: props.ids,
      report: "full",
      limit: 100,
    });
    const rows = d.results;
    setTableData({ heading, rows });

    const counts = r.map((v) => {
      const target = v.message ? v.message : v?.target;
      return { target: target };
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

  const handleSelectDropDown = (value) => {
    props.lookupRoute(value);
  };

  return (
    <div className="explore navigate">
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
                                if (v && v.name) {
                                  return (
                                    <li key={j} className="label_list__item">
                                      <p
                                        id={`label${i}-${j}`}
                                        className="label_list__item__inner"
                                      >
                                        {v.link}
                                      </p>
                                    </li>
                                  );
                                } else {
                                  return (
                                    <li
                                      key={j}
                                      className="label_list__item null"
                                    ></li>
                                  );
                                }
                              })}
                            </ul>
                          </div>
                        )}
                        <div className="item_wrapper" key={2}>
                          {i === 0 ? (
                            <div>
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
                                        id={`to${i}-${v.name}`}
                                        className="radio green"
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
                                          onChange={() =>
                                            selectDatabase(v, i, j)
                                          }
                                        />
                                        <label
                                          htmlFor={`result${i}-${j}`}
                                          className="radio__large_label green"
                                          style={{
                                            opacity: isActionButtonVisible
                                              ? 0.7
                                              : 1,
                                            backgroundColor:
                                              isActionButtonVisible
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
                                            <span
                                              id={`total${i}-${v.name}`}
                                            ></span>
                                            <span className="text">
                                              {datasetConfig[v.name].label}
                                            </span>
                                            <span
                                              id={`total${i}-${v.name}`}
                                              className="total"
                                            >
                                              {v.target}
                                            </span>
                                          </p>
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
                                      <div
                                        id={`to${i}-${j}`}
                                        className="item_wrapper"
                                      >
                                        <ul className="result_list"></ul>
                                      </div>
                                    );
                                  } else {
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
                                          handleActionButtonVisibility(
                                            null,
                                            null
                                          )
                                        }
                                        className="result_list__item"
                                      >
                                        <div
                                          id={`to${i}-${j}`}
                                          className="radio green"
                                        >
                                          <label
                                            htmlFor={`result${i}-${j}`}
                                            className="radio__large_label green no_radio"
                                            style={{
                                              opacity: isActionButtonVisible
                                                ? 0.7
                                                : 1,
                                              backgroundColor:
                                                isActionButtonVisible
                                                  ? "#000000"
                                                  : categories[v.category]
                                                  ? categories[v.category].color
                                                  : null,
                                            }}
                                          >
                                            <div
                                              id={`from${i}-${j}`}
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
                                              <span
                                                id={`converted${i}-${v.name}-${j}`}
                                              ></span>
                                              <span className="text">
                                                {datasetConfig[v.name].label}
                                              </span>
                                              {i ===
                                              props.databaseNodesList.length -
                                                1 ? (
                                                <span
                                                  id={`total${i}-${v.name}-${j}`}
                                                  className="total"
                                                >
                                                  {v.message
                                                    ? v.message
                                                    : v.target}
                                                </span>
                                              ) : (
                                                <span
                                                  id={`total${i}-${v.name}-${j}`}
                                                ></span>
                                              )}
                                            </p>
                                          </label>
                                          {isActionButtonVisible && (
                                            <div className="action_icons">
                                              <button
                                                onClick={() =>
                                                  showModal(v, i, j)
                                                }
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
                                              <button
                                                onClick={() =>
                                                  handleIdDownload(v, i, j)
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
                          )}
                        </div>
                      </React.Fragment>
                    ))}
                  {((props.route.length === 1 &&
                    props.databaseNodesList.length === 1) ||
                    (props.databaseNodesList[1] &&
                      props.databaseNodesList[1].length === 0)) && (
                    <div className="item_wrapper">
                      <ul className="result_list dropdown_wrap">
                        <div id={`nodeOther`} className={`radio green`}>
                          <select
                            className="dropdown"
                            onChange={(e) =>
                              handleSelectDropDown(e.target.value)
                            }
                          >
                            <option>---</option>
                            {Object.keys(datasetConfig).map((key) => {
                              if (!props.route.find((v) => v.name === key)) {
                                return (
                                  <option key={key} value={key}>
                                    {datasetConfig[key].label}
                                  </option>
                                );
                              }
                            })}
                          </select>
                        </div>
                      </ul>
                    </div>
                  )}

                  {informationModal && (
                    <InformationModal
                      setInformationModal={setInformationModal}
                      database={database}
                    />
                  )}

                  {modalVisibility && (
                    <ResultModal
                      route={props.route}
                      ids={props.ids}
                      tableData={tableData}
                      setModalVisibility={setModalVisibility}
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

export default Navigate;
