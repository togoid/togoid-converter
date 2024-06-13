import { useClickAway } from "react-use";
import { ArrowArea } from "react-arrow-master";
import ResultModalAction from "@/components/ResultModalAction";

import type { Arrow, HeadStyleAlias } from "react-arrow-master";

type Props = {
  route: Route[];
  ids: any;
  convertedCount: any;
  setIsShowResultModal: Dispatch<SetStateAction<boolean>>;
};

const ResultModal = ({ setIsShowResultModal, ...props }: Props) => {
  const { datasetConfig } = useConfig();

  const getResultPathStyle = (
    from: string,
    to: string,
    head: HeadStyleAlias,
  ): Arrow => {
    return {
      from: {
        id: from,
        posX: "right",
        posY: "middle",
      },
      to: {
        id: to,
        posX: "left",
        posY: "middle",
      },
      style: {
        color: "#1A8091",
        head: head,
        arrow: "smooth",
        width: 1.5,
      },
    };
  };

  const routePath = useMemo<Arrow[]>(
    () =>
      props.route.flatMap((_, i) => {
        if (i === 0) {
          return getResultPathStyle(`label-${i}`, `link-${i + 1}`, "none");
        } else if (i === props.route.length - 1) {
          return getResultPathStyle(`link-${i}`, `label-${i}`, "default");
        } else {
          return [
            getResultPathStyle(`link-${i}`, `label-${i}`, "default"),
            getResultPathStyle(`label-${i}`, `link-${i + 1}`, "none"),
          ];
        }
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

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
                <ArrowArea arrows={routePath}>
                  <div className="modal__path__frame__inner">
                    {props.route.map((v: any, i: number) => (
                      <div className="modal__path__frame__item" key={i}>
                        {i !== 0 && (
                          <div className="path_label white" id={`link-${i}`}>
                            {v.relation.link.display_label}
                          </div>
                        )}
                        <div
                          key={i}
                          className="path_label green"
                          id={`label-${i}`}
                          style={{
                            backgroundColor: datasetConfig[v.name].color,
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
                        </div>
                      </div>
                    ))}
                  </div>
                </ArrowArea>
              </div>
            </div>
          </div>

          <ResultModalAction
            route={props.route}
            ids={props.ids}
            lastTargetCount={
              props.convertedCount[props.convertedCount.length - 1].target
            }
          />
        </div>
      </div>
    </div>
  );
};

export default ResultModal;
