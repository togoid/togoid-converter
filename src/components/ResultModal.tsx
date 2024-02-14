import ResultModalAction from "@/components/ResultModalAction";
import { ArrowArea } from "react-arrow-master";

import type { Arrow, HeadStyleAlias } from "react-arrow-master";

const ResultModal = (props) => {
  const { datasetConfig } = useConfig();

  const tableHead = useMemo(
    () => props.route.map((v) => datasetConfig[v.name]),
    [],
  );

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
      tableHead.flatMap((v, i) => {
        if (i === 0) {
          return getResultPathStyle(`label-${i}`, `link-${i + 1}`, "none");
        } else if (i === tableHead.length - 1) {
          return getResultPathStyle(`link-${i}`, `label-${i}`, "default");
        } else {
          return [
            getResultPathStyle(`link-${i}`, `label-${i}`, "default"),
            getResultPathStyle(`label-${i}`, `link-${i + 1}`, "none"),
          ];
        }
      }),
    [],
  );

  return (
    <div className="modal" onClick={() => props.setModalVisibility(false)}>
      <div
        className="modal__inner"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="modal__scroll_area">
          <button
            onClick={() => props.setModalVisibility(false)}
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
                    {tableHead.map((v, i) => (
                      <div className="modal__path__frame__item" key={i}>
                        {i !== 0 && (
                          <div className="path_label white" id={`link-${i}`}>
                            {props.route[i].link}
                          </div>
                        )}
                        <div
                          key={i}
                          className="path_label green"
                          id={`label-${i}`}
                          style={{
                            backgroundColor: categories[v.category]
                              ? categories[v.category].color
                              : null,
                          }}
                        >
                          {i !== 0 && props.convertedCount[i].source && (
                            <span id={`converted${i}`} className="total">
                              {props.convertedCount[i].source}
                            </span>
                          )}
                          <span className="path_label__inner">{v.label}</span>
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
            tableHead={tableHead}
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
