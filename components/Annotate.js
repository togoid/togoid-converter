// @ts-check
import React, { useMemo } from "react";
import { categories } from "../lib/setting";
import { annotateTargetList } from "../lib/annotate-target";
import useConfig from "../hooks/useConfig";

/**
 * @param {{ databaseNodesList: any[]; route: any[]; setRoute: Function }} props
 */
const Annotate = (props) => {
  const { datasetConfig } = useConfig();

  const annotateDatabaseNodesList = useMemo(
    () => props.databaseNodesList[0]?.filter((v) => annotateTargetList[v.name]),
    [props.databaseNodesList]
  );

  const selectDataset = (input) => {
    props.setRoute([input]);
  };

  return (
    <div className="annotate">
      {annotateDatabaseNodesList && (
        <>
          <nav className="annotate__side-menu">
            {annotateDatabaseNodesList.map((v, i) => (
              <button
                key={i}
                className={`annotate__side-menu__button ${
                  v.name === props.route[0]?.name ? "active" : ""
                }`}
                style={{
                  backgroundColor: categories[v.category]?.color,
                }}
                onClick={() => selectDataset(v)}
              >
                <span className="text">{datasetConfig[v.name].label}</span>
                <span className="total">{v.target}</span>
              </button>
            ))}
          </nav>
          <table className="table">
            <thead>
              <tr>
                <th>URI</th>
                <th>ID</th>
                <th>LABEL</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Xxx-xxx-xxxx</td>
                <td>YYY-YYY-YYY</td>
                <td>Zzz-zzz-zzzz</td>
              </tr>
              <tr>
                <td>Xxx-xxx-xxxx</td>
                <td>YYY-YYY-YYY</td>
                <td>Zzz-zzz-zzzz</td>
              </tr>
              <tr>
                <td>Xxx-xxx-xxxx</td>
                <td>YYY-YYY-YYY</td>
                <td>Zzz-zzz-zzzz</td>
              </tr>
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default Annotate;
