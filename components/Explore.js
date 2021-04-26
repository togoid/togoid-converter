import React, { useState, useEffect } from "react";
import ResultModal from "../components/ResultModal";
import axios from "axios";

const Explore = (props) => {
  const [operationMenuVisibility, setOperationMenuVisibility] = useState(false);
  const [modalVisibility, setModalVisibility] = useState(false);
  const [modalData, setModalData] = useState({ heading: [], rows: [] });
  const [menuVisibility, setMenuVisibility] = useState([null, null]);

  /**
   * modalDataがstatusにセットされたら、データモーダルを表示する
   */
  useEffect(() => {
    if (modalData.rows.length > 0) setModalVisibility(!modalVisibility);
  }, [modalData]);

  const executeQuery = async () => {
    const route = props.route.map((v) => v.label).join(",");
    const ids = props.ids.join(",");
    return await axios
      .get(
        `${process.env.NEXT_PUBLIC_SPARQL_ENDOPOINT}/convert?ids=${ids}&route=${route}&include=all&format=json`
      )
      .then((d) => d.data);
  };

  /**
   * databaseのラジオボタンを選択する
   * @param database
   * @param i
   */
  const selectDatabase = (database, i) => {
    const r = props.route.slice(0, i);
    r[i] = database;
    props.setRoute(r);
    setMenuVisibility([null, null]);
  };

  const handleReset = () => {
    props.restartExplore();
  };
  /**
   * ３点リーダサブメニューの表示非表示を切り替える
   * @param index1
   * @param index2
   */
  const toggleMenuVisibility = (index1, index2) => {
    if (menuVisibility[0] === index1 && menuVisibility[1] === index2) {
      setMenuVisibility([null, null]);
    } else {
      setMenuVisibility([index1, index2]);
    }
  };

  /**
   * モーダルの表示非表示を切り替える
   * モーダルを表示する際に３点リーダサブメニューを閉じる
   * @param index1
   */
  const showModal = async (index1) => {
    setMenuVisibility([null, null]);
    const headings = props.route
      .filter((v, i) => i <= index1)
      .map((v) => v.label);
    const d = await executeQuery();
    console.log(d);
    setModalData({ headings, rows: d.results });
  };

  return (
    <div className="explore">
      <div className="drawing_area">
        <div className="panel">
          <div className="panel__button">
            <div className="button_pull_down__wrapper">
              <button
                onClick={() =>
                  setOperationMenuVisibility(!operationMenuVisibility)
                }
                className={
                  operationMenuVisibility
                    ? "button_pull_down active"
                    : "button_pull_down"
                }
              >
                Operation
              </button>
              {operationMenuVisibility && (
                <div className="button_pull_down__children">
                  <button className="button_pull_down__children__item">
                    <svg className="icon" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z"
                      />
                    </svg>
                    Export as CSV
                  </button>
                  <button
                    onClick={handleReset}
                    className="button_pull_down__children__item"
                  >
                    <svg className="icon" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M13.5,7A6.5,6.5 0 0,1 20,13.5A6.5,6.5 0 0,1 13.5,20H10V18H13.5C16,18 18,16 18,13.5C18,11 16,9 13.5,9H7.83L10.91,12.09L9.5,13.5L4,8L9.5,2.5L10.92,3.91L7.83,7H13.5M6,18H8V20H6V18Z"
                      />
                    </svg>
                    Reset
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="panel__inner">
            <div className="explore">
              <div className="drawing">
                {props.databaseNodes &&
                  props.databaseNodes.length > 0 &&
                  props.databaseNodes.map((database, i) => (
                    <div className="item_wrapper" key={i}>
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
                                  {v.label}
                                </span>
                              </label>
                              {i > 0 &&
                              props.route[i] &&
                              props.route[i].name === v.name &&
                              v.name ? (
                                <button
                                  className="radio__three_dots"
                                  onClick={() => toggleMenuVisibility(i, j)}
                                />
                              ) : null}
                              {menuVisibility[0] === i &&
                                menuVisibility[1] === j && (
                                  <div className="button_pull_down__children">
                                    <button
                                      className="button_pull_down__children__item"
                                      onClick={() => showModal(i, j)}
                                    >
                                      <svg className="icon" viewBox="0 0 24 24">
                                        <path
                                          fill="currentColor"
                                          d="M9,5V9H21V5M9,19H21V15H9M9,14H21V10H9M4,9H8V5H4M4,19H8V15H4M4,14H8V10H4V14Z"
                                        />
                                      </svg>
                                      Resolve with this
                                    </button>
                                  </div>
                                )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}

                {modalVisibility && (
                  <ResultModal
                    modalData={modalData}
                    setModalVisibility={setModalVisibility}
                  />
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
