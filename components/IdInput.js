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
      props.handleSubmit(reader.result);
    };
    reader.onerror = () => {
      console.log(reader.error);
    };

    e.target.value = "";
  };

  return (
    <div className="input_area">
      <form onSubmit={handleSubmit} className="textarea">
        <div className="textarea_wrapper">
          <textarea
            cols="30"
            rows="10"
            placeholder="Input your ID (set), separated by comma, space, or newline (e.g. 5460, 6657, 9314, 4609 for NCBI gene)."
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
        <div className="input">
          <input type="submit" value="SUBMIT" className="button_large" />
          <input
            className="button_small"
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
      </form>
    </div>
  );
};

export default IdInput;
