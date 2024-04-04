import { ArrowArea } from "react-arrow-master";

import type { Arrow } from "react-arrow-master";

const Explore = (props: any) => {
  const candidatePathList = useMemo(() => {
    const candidatePathList: Arrow[] = [];
    props.databaseNodesList.forEach((nodes, i) => {
      if (i === 0) return;
      nodes.forEach((v) => {
        candidatePathList.push(
          ...mergePathStyle(
            `from${i - 1}-${props.route[i - 1].name}`,
            `to${i}-${v.name}`,
            props.route[i] && props.route[i].name === v.name,
          ),
        );
      });
    });

    return candidatePathList;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.databaseNodesList]);

  const selectDatabase = (database, i) => {
    const r = props.route.slice(0, i);
    r[i] = database;
    props.setRoute(r);
    props.setPreviousRoute(r);
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
