import React, { useState } from "react";

const IdInput = (props) => {
  const [inputType, setInputType] = useState(0);
  const [idTexts, setIdTexts] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const ids = idTexts.split(/[\s,\n]+/).map((v) => v.trim());
    props.handleSubmit(ids);
  }

  return (
    <div className="input_area">
      <div className="radio_wrapper">
        <div className="radio">
          <input
            type="radio"
            id="textField"
            name="input_type"
            className="radio__input"
            checked={inputType === 0}
            onChange={() => setInputType(0)}
          />
          <label htmlFor="textField" className="radio__label">
            INPUT from text field
          </label>
        </div>

        <div className="radio">
          <input
            type="radio"
            id="csv"
            name="input_type"
            className="radio__input"
            checked={inputType === 1}
            onChange={() => setInputType(1)}
          />
          <label htmlFor="csv" className="radio__label">
            INPUT from CSV
          </label>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="textarea">
        <textarea
          cols="30"
          rows="10"
          placeholder="Enter IDs"
          className="textarea__input"
          value={idTexts}
          onChange={(e) => setIdTexts(e.target.value)}
        />
        <input type="submit" value="EXECUTE" className="button_large" />
      </form>
    </div>
  );
};

export default IdInput;