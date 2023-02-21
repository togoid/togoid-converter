// @ts-check
import React from "react";
import { categories } from "../lib/setting";
import useConfig from "../hooks/useConfig";

/**
 * @param {{ databaseNodesList: any[]; route: any[]; setRoute: Function }} props
 */
const Annotate = (props) => {
  const { datasetConfig } = useConfig();

  const selectDataset = (input) => {
    props.setRoute([input]);
  };

  return (
    <div className="annotate">
      {props.databaseNodesList[0] && (
        <>
          <nav className="annotate__side-menu">
            {props.databaseNodesList[0].map((v, i) => (
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
