import { ArrowArea } from "react-arrow-master";
import type { Arrow } from "react-arrow-master";

type Props = {
  databaseNodesList: any[][];
  route: Route[];
  ids: string[];
  setRoute: Function;
  setRouterRoute: Function;
};

const Explore = (props: Props) => {
  const candidatePathList = useMemo(() => {
    const candidatePathList: Arrow[] = [];
    props.databaseNodesList.forEach((nodes, i) => {
      if (i === 0) return;
      nodes.forEach((v) => {
        candidatePathList.push(
          ...mergePathStyle(
            `from${i - 1}-${props.route[i - 1]?.relation?.link?.label}-${props.route[i - 1].name}`,
            `to${i}-${v.relation.link.label}-${v.name}`,
            props.route[i] &&
              props.route[i].name === v.name &&
              props.route[i].relation?.link.label === v.relation.link.label,
          ),
        );
      });
    });

    return candidatePathList;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.databaseNodesList]);

  const selectDatabase = (database, i) => {
    console.log(database);
    const r = props.route.slice(0, i);
    r[i] = database;
    props.setRoute(r);
    props.setRouterRoute(r.map((v: any) => v.name));
    return r;
  };

  return (
    <div className="explore">
      <div className="drawing_area">
        <div className="panel">
          <div className="panel__inner">
            <div className="explore">
              <ArrowArea arrows={candidatePathList}>
                <div className="drawing">
                  {props.databaseNodesList.map((nodes, i) => (
                    <ExploreResult
                      key={i}
                      i={i}
                      nodes={nodes}
                      route={props.route}
                      ids={props.ids}
                      selectDatabase={selectDatabase}
                    />
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
