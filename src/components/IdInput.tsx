import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

const IdInput = (props: any) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const idTexts = searchParams.get("ids");

  const setActiveTab = useSetAtom(activeTabAtom);

  const [text, setText] = useState(idTexts ?? "");

  useEffect(() => {
    if (idTexts) {
      setText(idTexts.replaceAll(",", "\n"));
    } else {
      setText("");
    }
  }, [idTexts]);

  const handleSubmit = (e: any) => {
    if (e) e.preventDefault();

    // const findDatabaseList = props.handleIdTextsSubmit(text);
    // if (props.previousRoute.length) {
    //   const firstRoute = findDatabaseList.find(
    //     (v) => v.name === props.previousRoute[0].name,
    //   );
    //   if (firstRoute) {
    //     // keepRouteを使用する
    //     props.setRoute([firstRoute]);
    //     props.setIsUseKeepRoute(true);
    //     return;
    //   }
    // }

    // if (findDatabaseList.length === 1) {
    //   // listが1件の時は自動で選択する
    //   props.setRoute(findDatabaseList);
    // }
  };

  const handleKeyDown = (e: any) => {
    if ((e.ctrlKey || e.shiftKey) && e.keyCode === 13) {
      handleSubmit(e);
    }
  };

  // const selectTextFile = () => {
  //   // @ts-expect-error
  //   inputRef.current.click();
  // };
  // const inputRef = React.useRef();

  // const readTextFile = (e) => {
  //   const file = e.target.files[0];
  //   const reader = new FileReader();
  //   reader.readAsText(file);

  //   reader.onload = () => {
  //     props.setIdTexts(reader.result);
  //     props.handleIdTextsSubmit(reader.result);
  //   };
  //   reader.onerror = () => {
  //     console.log(reader.error);
  //   };

  //   e.target.value = "";
  // };

  // const handleReset = () => {
  //   props.restartExplore();
  // };

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
            <button
              type="button"
              onClick={() => {
                setText("");
                router.push("/");
              }}
              className="textarea_clear"
            />
          )}
        </div>
        <div className="input">
          <input type="submit" value="Submit" className="button_large" />
          {/* <input
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
          /> */}
        </div>
      </form>

      <div className="input_area__bottom">
        <div className="input_area__bottom__links">
          <p className="input_area__bottom__square">Examples:</p>
          <Link
            href={{
              query: { ids: topExamples.refseq_rna.join(",") },
            }}
            onClick={() => setActiveTab("EXPLORE")}
            className="input_area__bottom__link"
          >
            Refseq RNA
          </Link>
          <Link
            href={{
              query: { ids: topExamples.ensembl_gene.join(",") },
            }}
            onClick={() => setActiveTab("EXPLORE")}
            className="input_area__bottom__link"
          >
            Ensembl gene
          </Link>
          <Link
            href={{
              query: { ids: topExamples.uniprot.join(",") },
            }}
            onClick={() => setActiveTab("EXPLORE")}
            className="input_area__bottom__link"
          >
            UniProt
          </Link>
        </div>
      </div>
    </div>
  );
};

export default IdInput;
