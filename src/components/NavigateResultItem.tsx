import { createPortal } from "react-dom";
import { useHoverDirty } from "react-use";
import ResultModal from "@/components/ResultModal";
import InformationModal from "@/components/InformationModal";

const NavigateResultItem = (props) => {
  const { datasetConfig } = useConfig();

  const [isShowResultModal, setIsShowResultModal] = useState(false);
  const [isShowInfomationModal, setIsShowInfomationModal] = useState(false);

  const ref = useRef(null);
  const isActionButtonVisible = useHoverDirty(ref);

  const convertedCount = useRef<any[]>([]);

  const handleIdDownload = async () => {
    const r = props.selectDatabaseModal(props.i, props.j);
    const d = await executeQuery({
      route: r,
      ids: props.ids,
      report: "target",
    });

    const prefix = datasetConfig[props.v.name].prefix.split("/").slice(-1);

    exportCsvTsv(
      d.results.map((result: any) => [prefix + result]),
      "tsv",
      "ids.tsv",
    );
  };

  const openResultModal = async () => {
    const r: any[] = props.selectDatabaseModal(props.i, props.j);

    convertedCount.current = r.map((v) => {
      const target = v.message ? v.message : v?.target;
      return { target: target };
    });

    setIsShowResultModal(true);
  };

  return (
    <div ref={ref} id={`to${props.i}-${props.j}`} className="radio green">
      {props.i === 0 ? (
        <>
          <input
            type="radio"
            name={`result${props.i}`}
            id={`result${props.i}-${props.j}`}
            className="radio__input"
            checked={Boolean(
              props.route[props.i] &&
                props.route[props.i].name === props.v.name,
            )}
            onChange={() => props.selectDatabase(props.v, props.i, props.j)}
          />
          <label
            htmlFor={`result${props.i}-${props.j}`}
            className="radio__large_label green"
            style={{
              opacity: isActionButtonVisible ? 0.7 : 1,
              backgroundColor: isActionButtonVisible
                ? "#000000"
                : categories[props.v.category]
                  ? categories[props.v.category].color
                  : null,
            }}
          >
            <div id={`from${props.i}-${props.v.name}`} className="dummy" />
            <p
              className="radio__large_label__inner"
              style={{
                color: isActionButtonVisible ? "#333333" : "#ffffff",
              }}
            >
              <span id={`total${props.i}-${props.v.name}`}></span>
              <span className="text">{datasetConfig[props.v.name].label}</span>
              <span id={`total${props.i}-${props.v.name}`} className="total">
                {props.v.target}
              </span>
            </p>
          </label>
        </>
      ) : (
        <label
          htmlFor={`result${props.i}-${props.j}`}
          className="radio__large_label green no_radio"
          style={{
            opacity: isActionButtonVisible ? 0.7 : 1,
            backgroundColor: isActionButtonVisible
              ? "#000000"
              : categories[props.v.category]
                ? categories[props.v.category].color
                : null,
          }}
        >
          <div id={`from${props.i}-${props.j}`} className="dummy" />
          <p
            className="radio__large_label__inner"
            style={{
              color: isActionButtonVisible ? "#333333" : "#ffffff",
            }}
          >
            <span id={`converted${props.i}-${props.v.name}-${props.j}`}></span>
            <span className="text">{datasetConfig[props.v.name].label}</span>
            {props.i === props.databaseNodesList.length - 1 ? (
              <span
                id={`total${props.i}-${props.v.name}-${props.j}`}
                className="total"
              >
                {props.v.message ? props.v.message : props.v.target}
              </span>
            ) : (
              <span id={`total${props.i}-${props.v.name}-${props.j}`}></span>
            )}
          </p>
        </label>
      )}
      {isActionButtonVisible && (
        <div className="action_icons">
          {props.i !== 0 && (
            <>
              <button
                onClick={() => openResultModal()}
                className="action_icons__item"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 16">
                  <path
                    d="M5,4H19a2,2,0,0,1,2,2V18a2,2,0,0,1-2,2H5a2,2,0,0,1-2-2V6A2,2,0,0,1,5,4M5,8v4h6V8H5m8,0v4h6V8H13M5,14v4h6V14H5m8,0v4h6V14Z"
                    transform="translate(-3 -4)"
                    fill="#fff"
                  />
                </svg>
              </button>
              <button
                onClick={() => handleIdDownload()}
                className="action_icons__item"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 17">
                  <path
                    d="M5,20H19V18H5M19,9H15V3H9V9H5l7,7Z"
                    transform="translate(-5 -3)"
                    fill="#fff"
                  />
                </svg>
              </button>
            </>
          )}

          <button
            onClick={() => setIsShowInfomationModal(true)}
            className="action_icons__item"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 6.427 16.004">
              <path
                d="M13.5,4A1.5,1.5,0,1,0,15,5.5,1.5,1.5,0,0,0,13.5,4m-.36,4.77c-1.19.1-4.44,2.69-4.44,2.69-.2.15-.14.14.02.42s.14.29.33.16.53-.34,1.08-.68c2.12-1.36.34,1.78-.57,7.07-.36,2.62,2,1.27,2.61.87s2.21-1.5,2.37-1.61c.22-.15.06-.27-.11-.52-.12-.17-.24-.05-.24-.05-.65.43-1.84,1.33-2,.76-.19-.57,1.03-4.48,1.7-7.17C14,10.07,14.3,8.67,13.14,8.77Z"
                transform="translate(-8.573 -4)"
                fill="#fafafa"
              />
            </svg>
          </button>
        </div>
      )}
      {isShowInfomationModal &&
        createPortal(
          <InformationModal
            setInformationModal={setIsShowInfomationModal}
            database={props.v.name}
          />,
          document.body,
        )}

      {isShowResultModal &&
        createPortal(
          <ResultModal
            route={props.route}
            ids={props.ids}
            convertedCount={convertedCount.current}
            setModalVisibility={setIsShowResultModal}
          />,
          document.body,
        )}
    </div>
  );
};

export default NavigateResultItem;
