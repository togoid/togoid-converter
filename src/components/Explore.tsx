import React from "react";
import { ArrowArea } from "react-arrow-master";
import ExploreResultItem from "@/components/ExploreResultItem";
// import ResultModal from "../components/ResultModal";

const sortConfig = {
  name: { up: "desc", down: "asc" },
  category: { up: "desc", down: "asc" },
  sourceCount: { up: "asc", down: "desc" },
  targetCount: { up: "asc", down: "desc" },
};

const Explore = (props) => {
  const [tableData, setTableData] = useState({ heading: [] });
  const [convertedCount, setConvertedCount] = useState([]);
  const [nodesList, setNodesList] = useState([]);
  const [sortModeOrderList, setSortModeOrderList] = useState([]);

  const { datasetConfig } = useConfig();

  useEffect(() => {
    // 直前の状態と比較して変化していればnameとascでソートする
    const sortNodes = [];
    const sortModeOrders = [];
    props.databaseNodesList.forEach((v, i) => {
      if (v === nodesList[i]) {
        sortNodes.push(v);
        sortModeOrders.push(sortModeOrderList[i]);
      } else {
        const sorted = sortFunc(v, "name", "down");

        sortNodes.push(sorted);
        sortModeOrders.push({ mode: "name", direction: "down" });
      }
    });
    setNodesList(sortNodes);
    setSortModeOrderList(sortModeOrders);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.databaseNodesList]);

  const sortNode = (mode, direction, i) => {
    // この時点で元の配列が壊れても気にしないので shallow copy する
    const nodesListCopy = nodesList.slice();
    nodesListCopy[i] = sortFunc(nodesListCopy[i], mode, direction);

    setNodesList(nodesListCopy);

    const sortModeOrderListCopy = sortModeOrderList.slice();
    sortModeOrderListCopy[i] = {
      mode,
      direction,
    };
    setSortModeOrderList(sortModeOrderListCopy);
  };

  const sortFunc = (item, mode, direction) => {
    const n = sortConfig[mode][direction] === "asc" ? 1 : -1;

    if (mode === "name") {
      item.sort((a, b) => {
        if (
          datasetConfig[a.name].label.toLowerCase() <
          datasetConfig[b.name].label.toLowerCase()
        ) {
          return n * -1;
        } else if (
          datasetConfig[a.name].label.toLowerCase() >
          datasetConfig[b.name].label.toLowerCase()
        ) {
          return n * 1;
        }
      });
    } else if (mode === "category") {
      item.sort((a, b) => {
        if (a.category < b.category) {
          return n * -1;
        } else if (a.category > b.category) {
          return n * 1;
        }
      });
    } else if (mode === "sourceCount") {
      item.sort((a, b) => (a.source - b.source) * n);
    } else if (mode === "targetCount") {
      item.sort((a, b) => (a.target - b.target) * n);
    }

    return item;
  };

  const selectDatabase = (database, i) => {
    const r = props.route.slice(0, i);
    r[i] = database;
    props.setRoute(r);
    props.setPreviousRoute(r);
    return r;
  };

  const showModal = async (database, routeIndex) => {
    const r = selectDatabase(database, routeIndex).slice(0, routeIndex + 1);
    const heading = r
      .filter((v, i) => i <= routeIndex)
      .map((v) => datasetConfig[v.name]);

    setTableData({ heading });
    const counts = r.map((v) => {
      const source = v.message
        ? v.message === "ERROR"
          ? v.message
          : "-"
        : v.source;
      const target = v.message ? v.message : v.target;
      return { source: source, target: target };
    });
    setConvertedCount(counts);
  };

  return (
    <div className="explore">
      <div className="drawing_area">
        <div className="panel">
          <div className="panel__inner">
            <div className="explore">
              <ArrowArea arrows={props.candidatePaths}>
                <div className="drawing">
                  {nodesList.map((nodes, i) => (
                    <React.Fragment key={i}>
                      {i !== 0 && (
                        <div className="item_wrapper" key={1}>
                          <ul className="label_list with_sort" key={2}>
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
                        <div
                          className={
                            i === 0
                              ? "item_wrapper__buttons first"
                              : "item_wrapper__buttons"
                          }
                          key={1}
                        >
                          <label className="sort__label" htmlFor="sort">
                            Sort by
                          </label>
                          <select
                            id="sort"
                            className="select white"
                            onChange={(e) =>
                              sortNode(
                                e.target.value,
                                sortModeOrderList[i].direction,
                                i,
                              )
                            }
                            value={sortModeOrderList[i].mode}
                          >
                            <option value="name">Name</option>
                            <option value="category">Category</option>
                            {i !== 0 && (
                              <>
                                <option value="sourceCount">
                                  Source count
                                </option>
                                <option value="targetCount">
                                  Target count
                                </option>
                              </>
                            )}
                          </select>
                          <div className="sort">
                            <button
                              onClick={() =>
                                sortNode(
                                  sortModeOrderList[i].mode,
                                  sortModeOrderList[i].direction === "up"
                                    ? "down"
                                    : "up",
                                  i,
                                )
                              }
                              className={`sort__button`}
                            >
                              <div
                                className={`sort__button up ${
                                  sortModeOrderList[i].direction === "up"
                                    ? "active"
                                    : ""
                                }`}
                              />
                              <div
                                className={`sort__button down ${
                                  sortModeOrderList[i].direction === "down"
                                    ? "active"
                                    : ""
                                }`}
                              />
                            </button>
                          </div>
                        </div>

                        <ul
                          className={
                            i === 0 ? "result_list first" : "result_list"
                          }
                          key={2}
                        >
                          {nodes.map((v, j) => (
                            <ExploreResultItem
                              key={j}
                              i={i}
                              j={j}
                              v={v}
                              route={props.route}
                              selectDatabase={selectDatabase}
                              ids={props.ids}
                              showModal={showModal}
                              tableData={tableData}
                              convertedCount={convertedCount}
                            />
                          ))}
                        </ul>
                      </div>
                    </React.Fragment>
                  ))}
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
