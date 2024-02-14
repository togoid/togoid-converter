import { ArrowArea } from "react-arrow-master";
import NavigateResultItem from "@/components/NavigateResultItem";

const Navigate = (props) => {
  const { datasetConfig } = useConfig();

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
                      <div className="item_wrapper" key={i}>
                        <ul
                          className={
                            i === 0 ? "result_list first" : "result_list"
                          }
                        >
                          {nodes.map((v, j) => (
                            <li key={j} className="result_list__item">
                              {v ? (
                                <>
                                  {i !== 0 && (
                                    <p
                                      id={`label${i}-${j}`}
                                      className="label_list label_list__item label_list__item__inner"
                                    >
                                      {v.link}
                                    </p>
                                  )}
                                  <NavigateResultItem
                                    i={i}
                                    j={j}
                                    v={v}
                                    route={props.route}
                                    selectDatabase={selectDatabase}
                                    selectDatabaseModal={selectDatabaseModal}
                                    ids={props.ids}
                                    databaseNodesList={props.databaseNodesList}
                                  />
                                </>
                              ) : (
                                <>
                                  <p
                                    id={`label${i}-${j}`}
                                    className="label_list label_list__item label_list__item__inner null"
                                  ></p>
                                  <div
                                    id={`to${i}-${j}`}
                                    className="result_list__item__null"
                                  ></div>
                                </>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
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
