import React from "react";

const IdInput = (props) => {
  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    const findDatabaseList = props.handleIdTextsSubmit(props.idTexts);
    if (
      props.previousRoute.length &&
      findDatabaseList.find((v) => v.name === props.previousRoute[0].name)
    ) {
      // keepRouteを使用する
      props.setRoute([props.previousRoute[0]]);
      props.setIsUseKeepRoute(true);
    } else if (findDatabaseList.length === 1) {
      // listが1件の時は自動で選択する
      props.setRoute(findDatabaseList);
    }
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
      props.handleIdTextsSubmit(reader.result);
    };
    reader.onerror = () => {
      console.log(reader.error);
    };

    e.target.value = "";
  };

  const handleReset = () => {
    props.restartExplore();
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
          <input
            className="button_small"
            type="button"
            value="Reset"
            onClick={handleReset}
          />
        </div>
      </form>

      <div className="input_area__bottom">
        <div className="input_area__bottom__links">
          <p className="input_area__bottom__square">Examples:</p>
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid*/}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              props.handleTopExamples("refseq_rna");
            }}
            className="input_area__bottom__link"
          >
            Refseq RNA
          </a>
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid*/}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              props.handleTopExamples("ensembl_gene");
            }}
            className="input_area__bottom__link"
          >
            Ensembl gene
          </a>
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid*/}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              props.handleTopExamples("uniprot");
            }}
            className="input_area__bottom__link"
          >
            Uniprot
          </a>
        </div>
      </div>
    </div>
  );
};

export default IdInput;
