// @ts-check
import React, { useState, useEffect } from "react";

const IdInput = (props) => {
  const [text, setText] = useState(props.idTexts);

  useEffect(() => {
    setText(props.idTexts);
  }, [props.idTexts]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    const findDatabaseList = props.handleIdTextsSubmit(text);
    if (props.previousRoute.length) {
      const firstRoute = findDatabaseList.find(
        (v) => v.name === props.previousRoute[0].name
      );
      if (firstRoute) {
        // keepRouteを使用する
        props.setRoute([firstRoute]);
        props.setIsUseKeepRoute(true);
        return;
      }
    }

    if (findDatabaseList.length === 1) {
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
    // @ts-expect-error
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
            cols={30}
            rows={10}
            placeholder="Input your ID (set), separated by comma, space, or newline (e.g. 5460, 6657, 9314, 4609 for NCBI gene)."
            className="textarea__input"
            value={text}
            onChange={(e) => setText(e.target.value)}
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
          <input type="submit" value="Submit" className="button_large" />
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
            // @ts-expect-error
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
            UniProt
          </a>
        </div>
      </div>
    </div>
  );
};

export default IdInput;
