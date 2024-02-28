const IdInput = (props) => {
  const [text, setText] = useState("");

  const isUpdateText = useRef(true);

  useEffect(() => {
    if (isUpdateText.current) {
      setText(props.ids.join("\n"));
    } else {
      isUpdateText.current = true;
    }
  }, [props.ids]);

  const handleIdTextsSubmit = (t: string) => {
    const ids = t
      .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) =>
        String.fromCharCode(s.charCodeAt(0) - 0xfee0),
      )
      .split(/[\s,\n,、,,]+/)
      .filter((v) => v)
      .map((v) => v.trim());

    props.setDatabaseNodesList([]);
    props.setRoute([]);

    isUpdateText.current = false;
    props.setIds(ids);
    return props.searchDatabase(ids);
  };

  const handleSubmit = (e: any) => {
    if (e) e.preventDefault();

    const findDatabaseList = handleIdTextsSubmit(text);
    if (props.previousRoute.length) {
      const firstRoute = findDatabaseList.find(
        (v) => v.name === props.previousRoute[0].name,
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

  const handleKeyDown = (e: any) => {
    if ((e.ctrlKey || e.shiftKey) && e.keyCode === 13) {
      handleSubmit(e);
    }
  };

  const selectTextFile = () => {
    // @ts-expect-error
    inputRef.current.click();
  };
  const inputRef = useRef();

  const readTextFile = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsText(file);

    reader.onload = () => {
      setText(reader.result as string);

      const findDatabaseList = handleIdTextsSubmit(reader.result as string);
      e.target.value = "";
      if (props.previousRoute.length) {
        const firstRoute = findDatabaseList.find(
          (v) => v.name === props.previousRoute[0].name,
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
    reader.onerror = () => {
      console.error(reader.error);
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
          {text && (
            <button onClick={() => setText("")} className="textarea_clear" />
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
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              props.executeExamples(topExamples["refseq_rna"], "refseq_rna");
            }}
            className="input_area__bottom__link"
          >
            Refseq RNA
          </a>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              props.executeExamples(
                topExamples["ensembl_gene"],
                "ensembl_gene",
              );
            }}
            className="input_area__bottom__link"
          >
            Ensembl gene
          </a>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              props.executeExamples(topExamples["uniprot"], "uniprot");
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
