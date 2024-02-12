import { ArrowArea } from "react-arrow-master";
import NavigateResultItem from "@/components/NavigateResultItem";

const Navigate = (props) => {
  const [modalVisibility, setModalVisibility] = useState(false);
  const [tableData, setTableData] = useState({ heading: [] });

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

  const showModal = async (database, routeIndex, j) => {
    const r = selectDatabaseModal(routeIndex, j);
    const heading = r.map((v) => datasetConfig[v.name]);

    setTableData({ heading });

    const counts = r.map((v) => {
      const target = v.message ? v.message : v?.target;
      return { target: target };
    });
    setConvertedCount(counts);
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
                            <NavigateResultItem
                              key={j}
                              i={i}
                              j={j}
                              v={v}
                              route={props.route}
                              selectDatabase={selectDatabase}
                              selectDatabaseModal={selectDatabaseModal}
                              ids={props.ids}
                              showModal={showModal}
                              tableData={tableData}
                              convertedCount={convertedCount}
                              databaseNodesList={props.databaseNodesList}
                            />
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

                  {/* {modalVisibility && (
                    <ResultModal
                      route={props.route}
                      ids={props.ids}
                      tableData={tableData}
                      setModalVisibility={setModalVisibility}
                      convertedCount={convertedCount}
                    />
                  )} */}
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
