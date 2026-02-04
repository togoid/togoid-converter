import { ArrowArea } from "react-arrow-master";
import Select from "react-select";

import type { Arrow } from "react-arrow-master";

type Props = {
  databaseNodesList: any[][];
  route: Route[];
  ids: string[];
  setRoute: (key: any) => any;
  lookupRoute: (key: any) => any;
};

const Navigate = (props: Props) => {
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
        getPathStyle(`from${0}-${props.route[0].name}`, `nodeOther`, {
          head: "default",
          isRoute: false,
        }),
      );
    } else if (props.route.length) {
      props.databaseNodesList.forEach((nodes, i) => {
        if (i === 0) {
          return;
        } else if (i === 1) {
          nodes.forEach((v, j) => {
            if (v === null) {
              candidatePaths.push(
                getPathStyle(`from0-${props.route[0].name}`, `label1-${j}`, {
                  head: "none",
                  isRoute: j === offsetRoute,
                }),
                getPathStyle(`label1-${j}`, `label1-${j}`, {
                  head: "none",
                  isRoute: j === offsetRoute,
                }),
              );
            } else {
              candidatePaths.push(
                ...mergePathStyle(
                  `from0-${props.route[0].name}`,
                  `to1-${j}`,
                  j === offsetRoute,
                ),
              );
            }
          });
        } else {
          nodes.forEach((v, j) => {
            if (v === null) {
              return;
            }

            if (props.databaseNodesList[1][j] === null) {
              candidatePaths.push(
                ...mergePathStyle(
                  `label${1}-${j}`,
                  `to${i}-${j}`,
                  j === offsetRoute,
                ),
              );
              return;
            }

            if (props.databaseNodesList[i - 1][j] === null) {
              candidatePaths.push(
                ...mergePathStyle(
                  `to${i - 2}-${j}`,
                  `to${i}-${j}`,
                  j === offsetRoute,
                ),
              );
              return;
            }

            candidatePaths.push(
              ...mergePathStyle(
                `to${i - 1}-${j}`,
                `to${i}-${j}`,
                j === offsetRoute,
              ),
            );
          });
        }
      });
    }

    return candidatePaths;
  }, [props.databaseNodesList, props.route]);

  const selectDatabase = (database: any) => {
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
                                  <NavigateResultRelation i={i} j={j} v={v} />
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
                                position: "relative",
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
