import { ArrowArea } from "react-arrow-master";
import Select from "react-select";
import NavigateResultItem from "@/components/NavigateResultItem";

import type { Arrow } from "react-arrow-master";

const Navigate = (props) => {
  const [offsetRoute, setOffsetRoute] = useState<number | null>(null);

  const { datasetConfig } = useConfig();

  const isShowDropdown = useMemo(() => {
    return Boolean(
      (props.route.length === 1 && props.databaseNodesList.length === 1) ||
        (props.databaseNodesList[1] && props.databaseNodesList[1].length === 0),
    );
  }, [props.route, props.databaseNodesList]);

  const candidatePathList = useMemo(() => {
    const candidatePaths: Arrow[] = [];

    if (isShowDropdown) {
      candidatePaths.push(
        getPathStyle(
          `from${0}-${props.route[0].name}`,
          `nodeOther`,
          false,
          "default",
        ),
      );
    } else if (props.route.length) {
      props.databaseNodesList.forEach((nodes, i) => {
        if (i === 0) {
          if (props.databaseNodesList.length === 1) {
            candidatePaths.push(
              getPathStyle(
                `from${0}-${props.route[0].name}`,
                `nodeOther`,
                false,
                "default",
              ),
            );
          }
        } else if (i === 1) {
          nodes.forEach((v, j) => {
            if (v === null) {
              candidatePaths.push(
                getPathStyle(
                  `from${0}-${props.route[0].name}`,
                  `label${i}-${j}`,
                  j === offsetRoute,
                  "none",
                ),
              );
            } else {
              candidatePaths.push(
                ...mergePathStyle(
                  `from${0}-${props.route[0].name}`,
                  `to${i}-${j}`,
                  j === offsetRoute,
                ),
              );
            }
          });
        } else if (i === props.databaseNodesList.length - 1) {
          nodes.forEach((v, j) => {
            if (props.databaseNodesList[i - 2][j] === null) {
              candidatePaths.push(
                {
                  from: {
                    id: `label${i - 2}-${j}`,
                    posX: "left",
                    posY: "middle",
                  },
                  to: {
                    id: `label${i}-${j}`,
                    posX: "left",
                    posY: "middle",
                  },
                  style:
                    j === offsetRoute
                      ? {
                          color: "#1A8091",
                          head: "none",
                          arrow: "smooth",
                          width: 2,
                        }
                      : {
                          color: "#dddddd",
                          head: "none",
                          arrow: "smooth",
                          width: 1.5,
                        },
                },
                getPathStyle(
                  `label${i}-${j}`,
                  `to${i}-${j}`,
                  j === offsetRoute,
                  "default",
                ),
              );
            } else if (props.databaseNodesList[i - 1][j] === null) {
              candidatePaths.push(
                ...mergePathStyle(
                  `to${i - 2}-${j}`,
                  `to${i}-${j}`,
                  j === offsetRoute,
                ),
              );
            } else {
              candidatePaths.push(
                ...mergePathStyle(
                  `to${i - 1}-${j}`,
                  `to${i}-${j}`,
                  j === offsetRoute,
                ),
              );
            }
          });
        } else {
          nodes.forEach((v, j) => {
            if (v === null) return;
            else {
              candidatePaths.push(
                ...mergePathStyle(
                  `to${i - 1}-${j}`,
                  `to${i}-${j}`,
                  j === offsetRoute,
                ),
              );
            }
          });
        }
      });
    }

    return candidatePaths;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.databaseNodesList, props.route]);

  const selectDatabase = (database) => {
    props.setRoute([database]);
    setOffsetRoute(null);
  };

  const selectDatabaseModal = (i: number, j: number) => {
    const r: any[] = [props.route[0]];
    for (let ii = 1; ii <= i; ii++) {
      if (props.databaseNodesList[ii][j]) {
        r.push(props.databaseNodesList[ii][j]);
      }
    }
    props.setRoute(r);
    setOffsetRoute(j);
    return r;
  };

  const handleSelectDropDown = (value: string) => {
    props.lookupRoute(value);
  };

  return (
    <div className="explore navigate">
      <div className="drawing_area">
        <div className="panel">
          <div className="panel__inner">
            <div className="explore">
              <ArrowArea arrows={candidatePathList}>
                <div className="drawing">
                  {props.databaseNodesList?.map((nodes, i) => (
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
                  {isShowDropdown && (
                    <div className="item_wrapper">
                      <ul className="result_list dropdown_wrap">
                        <div id={`nodeOther`} className={`radio green`}>
                          <Select
                            styles={{
                              control: (css) => ({
                                ...css,
                                width: "300px",
                              }),
                              menu: ({ width, ...css }) => ({
                                ...css,
                                width: "300px",
                              }),
                              option: (css) => ({ ...css, width: "300px" }),
                            }}
                            options={Object.keys(datasetConfig).map((key) => ({
                              value: key,
                              label: datasetConfig[key].label,
                            }))}
                            placeholder="---"
                            onChange={(e) => handleSelectDropDown(e!.value)}
                          />
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
