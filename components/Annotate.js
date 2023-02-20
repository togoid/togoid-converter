// @ts-check
import React from "react";

/**
 *
 */
const Annotate = () => {
  return (
    <div className="annotate">
      <nav className="annotate__side-menu">
        <button className="annotate__side-menu__button green active">
          <span className="text">HGNC</span>
          <span className="total">999</span>
        </button>
        <button className="annotate__side-menu__button green">
          <span className="text">HGNC</span>
          <span className="total">999</span>
        </button>
        <button className="annotate__side-menu__button orange">
          <span className="text">HGNC</span>
          <span className="total">999</span>
        </button>
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
    </div>
  );
};

export default Annotate;
