import React, { useState, useEffect } from "react";
import ResultModal from "../components/ResultModal";
import { exportCSV, executeQuery } from "../lib/util";
import dbConfig from "../public/config.json";
import dbCatalogue from "../public/dataset.json";

const Explore = (props) => {
  const [operationMenuVisibility, setOperationMenuVisibility] = useState(false);
  const [modalVisibility, setModalVisibility] = useState(false);
  const [tableData, setTableData] = useState({ heading: [], rows: [] });
  const [total, setTotal] = useState(0);
  const [menuVisibility, setMenuVisibility] = useState([null, null]);
  const [databaseInfoVisibility, setdatabaseInfoVisibility] = useState(false);
  const [database, setDatabase] = useState(null);

  useEffect(() => {
    if (tableData.heading.length > 0) setModalVisibility(true);
  }, [tableData]);

  const selectDatabase = (database, i) => {
    const r = props.route.slice(0, i);
    r[i] = database;
    props.setRoute(r);
    setMenuVisibility([null, null]);
  };

  const handleReset = () => {
    props.restartExplore();
  };

  const toggleMenuVisibility = (index1, index2) => {
    if (menuVisibility[0] === index1 && menuVisibility[1] === index2) {
      setMenuVisibility([null, null]);
    } else {
      setMenuVisibility([index1, index2]);
    }
  };

  const handleExportCSV = async (routeIndex,w) => {
    if(props.route.length == routeIndex){
      props.route.push(w);
    }
    else if(props.route.length > routeIndex){
      props.route.splice(routeIndex,props.route.length-routeIndex);
      props.route.push(w);
    }
    const heading = props.route
      .filter((v, i) => i <= routeIndex)
      .map((v) => v.name);
    const d = await executeQuery(props.route, props.ids);
    exportCSV([heading, ...d.results]);
  };

  const showModal = async (routeIndex,w) => {
    setOperationMenuVisibility(false);
    setMenuVisibility([null, null]);
    if(props.route.length == routeIndex){
      props.route.push(w);
    }
    else if(props.route.length > routeIndex){
      props.route.splice(routeIndex,props.route.length-routeIndex);
      props.route.push(w);
    }
    const heading = props.route
      .filter((v, i) => i <= routeIndex)
      .map((v) => v.name);
    const d = await executeQuery(props.route, props.ids);
    const rows = d.results.slice(0, 100).map((v) => v.slice(0, routeIndex + 1));

    setTotal(d.total);
    setTableData({ heading, rows });
  };

  const showDatabaseInfo = async (v) => {
    const dbName = Object.keys(dbCatalogue).filter((dataset) => dataset == v.name)
    if (dbName.length == 1) {
      setdatabaseInfoVisibility(true);
      setDatabase(dbName);
    }
  };

  return (
    <div className="explore">
      <div className="drawing_area">
        <div className="panel">
          <div className="panel__button">
            <button
              onClick={handleReset}
              className="button_clear"
            >
              Clear
            </button>
          </div>
          <div className="panel__inner">
            <div className="explore">
              <div className="drawing">
                {props.databaseNodes &&
                  props.databaseNodes.length > 0 &&
                  props.databaseNodes.map((database, i) => (
                    <div className="item_wrapper" key={i}>
                      {i === 0 &&
                        <p className="item_first_heading">Convert from</p>
                      }
                      <ul className="result_list">
                        {database.map((v, j) => (
                          <li key={j}>
                            <div className="radio green">
                              <input
                                type="radio"
                                id={`result${i}-${j}`}
                                className="radio__input"
                                checked={Boolean(
                                  props.route[i] &&
                                    props.route[i].name === v.name
                                )}
                                onChange={() => selectDatabase(v, i)}
                              />
                              <label
                                htmlFor={`result${i}-${j}`}
                                className="radio__large_label green"
                              >
                                <span className="radio__large_label__inner">
                                  {v.name}
                                </span>
                              </label>
                            </div>
                            <p className="result_count">999</p>
                            <div className="action_icons">
                              <button
                                onClick={() => showModal(i, v)}
                                className="action_icons__item">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 16">
                                  <path d="M5,4H19a2,2,0,0,1,2,2V18a2,2,0,0,1-2,2H5a2,2,0,0,1-2-2V6A2,2,0,0,1,5,4M5,8v4h6V8H5m8,0v4h6V8H13M5,14v4h6V14H5m8,0v4h6V14Z" transform="translate(-3 -4)" fill="#fff"/>
                                </svg>
                              </button>

                              <button
                                onClick={() => handleExportCSV(i,v)}
                                className="action_icons__item">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 17">
                                  <path d="M5,20H19V18H5M19,9H15V3H9V9H5l7,7Z" transform="translate(-5 -3)" fill="#fff"/>
                                </svg>
                              </button>

                              <button
                                onClick={() => showDatabaseInfo(v)}
                                className="action_icons__item">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 6.427 16.004">
                                  <path d="M13.5,4A1.5,1.5,0,1,0,15,5.5,1.5,1.5,0,0,0,13.5,4m-.36,4.77c-1.19.1-4.44,2.69-4.44,2.69-.2.15-.14.14.02.42s.14.29.33.16.53-.34,1.08-.68c2.12-1.36.34,1.78-.57,7.07-.36,2.62,2,1.27,2.61.87s2.21-1.5,2.37-1.61c.22-.15.06-.27-.11-.52-.12-.17-.24-.05-.24-.05-.65.43-1.84,1.33-2,.76-.19-.57,1.03-4.48,1.7-7.17C14,10.07,14.3,8.67,13.14,8.77Z" transform="translate(-8.573 -4)" fill="#fafafa" />
                                </svg>
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}

                {modalVisibility && (
                  <ResultModal
                    route={props.route}
                    ids={props.ids}
                    tableData={tableData}
                    total={total}
                    setModalVisibility={setModalVisibility}
                  />
                )}
                {databaseInfoVisibility && (
                  <div className="modal">
                    <div className="modal__inner">
                      <div className="modal__scroll_area">
                        <button
                          onClick={() => setdatabaseInfoVisibility(false)}
                          className="modal__close"
                        >
                          <svg viewBox="0 0 24 24">
                            <path
                              fill="currentColor"
                              d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
                            />
                          </svg>
                        </button>
                        <article className="database__item">
                          <h3 className="title">
                            <img
                              src="/images/icon_rat.png"
                              alt="アイコン画像：ラット"
                              className="icon"
                            />
                            <span className="text">{dbCatalogue[database].label}</span>
                          </h3>
                          <div className="description">
                            {dbCatalogue[database].description}
                          </div>

                          {(() => {
                            const labels = Object.keys(dbConfig).map(label => {
                              if (label.indexOf(database) == 0) {
                                const str = label.replace(`${database}-`, "")
                                return (
                                  <div htmlFor="result" className="path_label small green">
                                    <span className="path_label__inner">
                                      <img
                                        src="/images/icon_rat.png"
                                        alt="アイコン画像：ラット"
                                        className="icon"
                                      />
                                      {str}
                                    </span>
                                  </div>
                                )
                              }
                            }).filter(v => v)

                            if (labels.length) {
                              return (
                                <div className="path">
                                  <div className="path_label small white">LINK TO</div>
                                  <svg className="icon" viewBox="0 0 24 24">
                                    <path
                                      fill="currentColor"
                                      d="M4,15V9H12V4.16L19.84,12L12,19.84V15H4Z"
                                    />
                                  </svg>
                                  {labels}
                                </div>
                              )
                            }
                          })()}
                          

                          <dl className="data">
                            <div className="data__wrapper">
                              <dt>PREFIX</dt>
                              <dd>{dbCatalogue[database].prefix}</dd>
                            </div>
                            <div className="data__wrapper">
                              <dt>CATEGORY</dt>
                              <dd>{dbCatalogue[database].category}</dd>
                            </div>
                            {dbCatalogue[database].organization &&
                              <div className="data__wrapper">
                                <dt>ORGANIZATION</dt>
                                <dd>{dbCatalogue[database].organization}</dd>
                              </div>
                            }
                          </dl>
                        </article>
                      </div>
                    </div>
                  </div>
                )}
              </div>
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
