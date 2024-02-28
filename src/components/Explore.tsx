import React from "react";
import { ArrowArea } from "react-arrow-master";
import ExploreResult from "@/components/ExploreResult";

const Explore = (props) => {
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
              <ArrowArea arrows={props.candidatePaths}>
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
