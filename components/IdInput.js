import React, { useState } from "react";

const IdInput = (props) => {
  // const [inputType, setInputType] = useState(0);
  const [idTexts, setIdTexts] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const ids = idTexts.split(/[\s,\n,,]+/).map((v) => v.trim());
    props.handleSubmit(ids);
  };

  return (
    <div className="input_area">
      {/*
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
            Input from text field
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
            Input from CSV
          </label>
        </div>
      </div>
*/}

      <form onSubmit={handleSubmit} className="textarea">
        <div className="textarea_wrapper">
          <textarea
            cols="30"
            rows="10"
            placeholder="Input IDs"
            className="textarea__input"
            value={idTexts}
            onChange={(e) => setIdTexts(e.target.value)}
          />
          {idTexts && (
            <button onClick={() => setIdTexts("")} className="textarea_clear" />
          )}
        </div>
        <input type="submit" value="EXECUTE" className="button_large" />
      </form>
    </div>
  );
};

export default IdInput;
