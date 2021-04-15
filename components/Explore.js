import React, { useState, useEffect } from "react";
import ResultModal from "../components/ResultModal";
import { q } from "../lib/util";

const Explore = () => {
  const [operationMenuVisibility, setOperationMenuVisibility] = useState(false);
  const [databases, setDatabases] = useState([]);
  const [selectedDatabase, setSelectedDatabase] = useState([]);
  const [modalVisibility, setModalVisibility] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [modalData, setModalData] = useState({ heading: [], rows: [] });

  /**
   * 選択されたdatabaseがstatusにセットされたら、クエリを実行する
   */
  useEffect(() => {
    if (selectedDatabase.length > 0) {
      const database = databases[currentIndex].find(
        (database) => database.name === selectedDatabase[currentIndex]
      );
      executeQuery(database);
    }
  }, [selectedDatabase]);
  /**
   * modalDataがstatusにセットされたら、データモーダルを表示する
   */
  useEffect(() => {
    if (modalData.rows.length > 0) setModalVisibility(!modalVisibility);
  }, [modalData]);
  /**
   * idsに入力されたIDまたはIDリストをidPatternsから正規表現で検索
   */
  const executeQuery = async (databaseInfo) => {
    // TODO クエリ実行中にloading画面を表示させる
    const newDatabases = JSON.parse(JSON.stringify(databases));
    const d = await q(
      databaseInfo.name,
      databaseInfo.ids.map((v) => v.to)
    );
    if (d) {
      const convertResults = [];
      d.result.forEach((v) => {
        const index = convertResults.findIndex((pref) => pref.name === v.tn);
        if (index === -1) {
          convertResults.push({
            name: v.tn,
            count: 1,
            hasMenu: false,
            ids: [{ from: v.f, to: v.t }],
          });
        } else {
          convertResults[index].count += 1;
          convertResults[index].ids.push({ from: v.f, to: v.t });
        }
      });
      convertResults.sort((a, b) => {
        if (a.count < b.count) return 1;
        if (a.count > b.count) return -1;
        return 0;
      });
      newDatabases.push(convertResults);
      setDatabases(newDatabases);
    }
  };
  /**
   * databaseのラジオボタンを選択する
   * @param name 選択されたdatabase
   * @param index 選択されたdatabaseの階層番号
   */
  const selectDatabase = (name, index) => {
    setCurrentIndex(index);
    const array = JSON.parse(JSON.stringify(selectedDatabase));
    const newDatabases = JSON.parse(JSON.stringify(databases));
    if (array.length - 1 >= index) {
      array[index] = name;
      // 変更したら、それ以下のリストを削除
      if (array.length - 1 > index) {
        array.splice(index + 1, array.length - (index + 1));
      }
      if (newDatabases.length - 1 > index) {
        newDatabases.splice(index + 1, newDatabases.length - (index + 1));
      }
    } else {
      array.push(name);
    }
    setSelectedDatabase(array);
    setDatabases(newDatabases);
  };
  /**
   * ３点リーダサブメニューの表示非表示を切り替える
   * @param index1
   * @param index2
   */
  const toggleHasMenu = (index1, index2) => {
    const newDatabases = JSON.parse(JSON.stringify(databases));
    const newDatabase = newDatabases[index1];
    newDatabase[index2].hasMenu = !newDatabase[index2].hasMenu;
    setDatabases(newDatabases);
  };
  /**
   * モーダルの表示非表示を切り替える
   * モーダルを表示する際に３点リーダサブメニューを閉じる
   * @param index1
   * @param index2
   */
  const showModal = (index1, index2) => {
    toggleHasMenu(index1, index2);
    const results = [];
    const headings = [];
    databases.forEach((v, i) => {
      if (i <= index1) {
        const data = v.filter((v2) => {
          if (v2.name === selectedDatabase[i]) {
            return v2;
          }
        });
        results.push(data[0].ids);
        headings.push(data[0].name);
      }
    });
    let arrList = [];
    const newArrayList = [];
    results.forEach((rows, i) => {
      rows.forEach((v) => {
        if (i === 1) {
          // 2列目はsとoで1列目と2列目のリストを追加
          arrList.push([v.from, v.to]);
        } else if (i > 1) {
          // 3列目以降は列または行追加
          arrList.forEach((row) => {
            const colIndex = row.indexOf(v.from);
            if (colIndex >= 0) {
              const newRow = row.filter((v, i) => i <= colIndex);
              newArrayList.push(newRow.concat(v.to));
            }
          });
        }
      });
      if (i >= 2) arrList = newArrayList;
    });
    setModalData({ headings, rows: arrList });
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
              {operationMenuVisibility ? (
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
                  <button className="button_pull_down__children__item">
                    <svg className="icon" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M13.5,7A6.5,6.5 0 0,1 20,13.5A6.5,6.5 0 0,1 13.5,20H10V18H13.5C16,18 18,16 18,13.5C18,11 16,9 13.5,9H7.83L10.91,12.09L9.5,13.5L4,8L9.5,2.5L10.92,3.91L7.83,7H13.5M6,18H8V20H6V18Z"
                      />
                    </svg>
                    Reset
                  </button>
                </div>
              ) : (
                ""
              )}
            </div>
          </div>
          <div className="panel__inner">
            <div className="explore">
              <div className="drawing">
                {databases && databases.length > 0
                  ? databases.map((database, i) => (
                      <div className="item_wrapper" key={i}>
                        <ul className="result_list">
                          {database.map((v, j) => (
                            <li key={j}>
                              <div className="radio green">
                                <input
                                  type="radio"
                                  id={`result${i}-${j}`}
                                  className="radio__input"
                                  checked={selectedDatabase[i] === v.name}
                                  onChange={() => selectDatabase(v.name, i)}
                                />
                                <label
                                  htmlFor={`result${i}-${j}`}
                                  className="radio__large_label green"
                                >
                                  <span className="radio__large_label__inner">
                                    <img
                                      src="/images/icon_rat.png"
                                      alt="アイコン画像：ラット"
                                      className="icon"
                                    />
                                    {v.name}
                                  </span>
                                </label>
                                {i > 0 && selectedDatabase[i] === v.name ? (
                                  <button
                                    className="radio__three_dots"
                                    onClick={() => toggleHasMenu(i, j)}
                                  />
                                ) : null}
                                {v.hasMenu ? (
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
                                ) : (
                                  ""
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                        {i < databases.length - 1 ? (
                          <>
                            <div className="point" />
                            <select name="" id="" className="select white">
                              <option value="">rdfs:seeAlso</option>
                            </select>
                            <div className="point" />
                          </>
                        ) : null}
                      </div>
                    ))
                  : null}

                {modalVisibility && <ResultModal modalData={modalData} />}
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
