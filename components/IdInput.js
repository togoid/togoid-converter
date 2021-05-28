import React from "react";

const IdInput = (props) => {
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

    e.target.value = "";
  };

  return (
    <div className="input_area">
      <div className="radio_wrapper">
        <input
          type="button"
          value="Input from text file"
          id="csv"
          name="input_type"
          onClick={selectTextFile}
        />
        <input
          type="file"
          ref={inputRef}
          style={{ display: "none" }}
          onChange={readTextFile}
        />
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
