import React, { useState } from "react";

const IdInput = (props) => {
  const [inputType, setInputType] = useState(0);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    props.handleSubmit(props.idTexts);
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.shiftKey) && e.keyCode === 13) {
      handleSubmit();
    }
  };

  const selectTextFile = () => {
    setInputType(1);
    inputRef.current.click();
  };
  const inputRef = React.useRef();

  const readTextFile = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsText(file);

    reader.onload = () => {
      props.setIdTexts(reader.result);
    };
    reader.onerror = () => {
      console.log(reader.error);
    };

    setInputType(0);
    e.target.value = "";
  };

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
            onChange={selectTextFile}
          />
          <label htmlFor="csv" className="radio__label">
            Input from text file
          </label>
          <input
            type="file"
            ref={inputRef}
            style={{ display: "none" }}
            onChange={readTextFile}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="textarea">
        <div className="textarea_wrapper">
          <textarea
            cols="30"
            rows="10"
            placeholder="Input IDs"
            className="textarea__input"
            value={props.idTexts}
            onChange={(e) => props.setIdTexts(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {props.idTexts && (
            <button
              onClick={() => props.setIdTexts("")}
              className="textarea_clear"
            />
          )}
        </div>
        <input type="submit" value="EXECUTE" className="button_large" />
      </form>
    </div>
  );
};

export default IdInput;
