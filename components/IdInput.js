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

  const clickIdSetExample = (dataKey) => {
    if (dataKey === "refseq_rna") {
      const examples =
        "NM_001354870,NM_002467,NM_001173531,NM_001285986,NM_001285987,NM_002701,NM_203289,NM_003106,NM_001314052,NM_004235";
      props.exploreExamplesExecute(examples, dataKey);
    } else if (dataKey === "ensembl_gene") {
      const examples =
        "ENSG00000136997,ENSG00000204531,ENSG00000181449,ENSG00000136826";
      props.exploreExamplesExecute(examples, dataKey);
    } else if (dataKey === "uniprot") {
      const examples =
        "P01106,Q01860,M1S623,D2IYK3,F2Z381,P48431,A0A0U3FYV6,O43474";
      props.exploreExamplesExecute(examples, dataKey);
    }
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
      <div>
        <td>
          Try ID set examples (Yamanaka Factors (OCT3/4, SOX2, KLF4, C-MYC)).
        </td>

        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            clickIdSetExample("refseq_rna");
          }}
        >
          `Refseq RNA`
        </a>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            clickIdSetExample("ensembl_gene");
          }}
        >
          `Ensembl gene`
        </a>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            clickIdSetExample("uniprot");
          }}
        >
          `Uniprot`
        </a>
      </div>
    </div>
  );
};

export default IdInput;
