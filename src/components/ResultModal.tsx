import { useClickAway } from "react-use";

type Props = {
  route: Route[];
  ids: string[];
  convertedCount: any;
  setIsShowResultModal: Dispatch<SetStateAction<boolean>>;
};

const ResultModal = ({ setIsShowResultModal, ...props }: Props) => {
  const { datasetConfig } = useConfig();

  const ref = useRef(null);
  useClickAway(ref, () => {
    setIsShowResultModal(false);
  });

  return (
    <div className="modal">
      <div ref={ref} className="modal__inner">
        <div className="modal__scroll_area">
          <button
            onClick={() => setIsShowResultModal(false)}
            className="modal__close"
          >
            <svg viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
              />
            </svg>
          </button>
          <h2 className="modal--through__title">Results</h2>

          <div className="modal__path">
            <p className="modal__heading">Route</p>
            <div className="modal__path__frame">
              <div className="modal__path__frame__inner">
                {props.route.map((v, i) => (
                  <Fragment key={i}>
                    {i !== 0 && (
                      <div className="path_label white" id={`link-${i}`}>
                        <span>{v.relation?.link.display_label}</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 40 20"
                          className="path_label__arrow"
                        >
                          <path
                            d="M10,0,20,40H0Z"
                            transform="translate(40) rotate(90)"
                            fill="#249eb3"
                          />
                        </svg>
                      </div>
                    )}
                    <div
                      className="path_label green"
                      id={`label-${i}`}
                      style={{
                        backgroundColor:
                          categoryColor[datasetConfig[v.name].category],
                      }}
                    >
                      {i !== 0 && props.convertedCount[i].source && (
                        <span id={`converted${i}`} className="total">
                          {props.convertedCount[i].source}
                        </span>
                      )}
                      <span className="path_label__inner">
                        {datasetConfig[v.name].label}
                      </span>
                      {props.convertedCount[i].target && (
                        <span id={`total${i}`} className="total">
                          {props.convertedCount[i].target}
                        </span>
                      )}

                      {i !== 0 && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 40 20"
                          className="path_label__arrow"
                        >
                          <path
                            d="M10,0,20,40H0Z"
                            transform="translate(40) rotate(90)"
                            fill="#249eb3"
                          />
                        </svg>
                      )}
                    </div>
                  </Fragment>
                ))}
              </div>
            </div>
          </div>

          {props.route.length > 1 ? (
            <ResultModalAction
              route={props.route}
              ids={props.ids}
              lastTargetCount={
                props.convertedCount[props.convertedCount.length - 1].target
              }
            />
          ) : (
            <ResultModalSingleAction
              route={props.route}
              ids={props.ids}
              lastTargetCount={
                props.convertedCount[props.convertedCount.length - 1].target
              }
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultModal;
