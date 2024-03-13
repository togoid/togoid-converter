import React from "react";
import { useUpdateEffect } from "react-use";
import ExploreResultItem from "@/components/ExploreResultItem";

const sortConfig = {
  name: { up: "desc", down: "asc" },
  category: { up: "desc", down: "asc" },
  sourceCount: { up: "asc", down: "desc" },
  targetCount: { up: "asc", down: "desc" },
} as const;

const ExploreResult = (props: any) => {
  const { datasetConfig } = useConfig();

  const sortFunc = (
    item: any[],
    mode: keyof typeof sortConfig,
    direction: "up" | "down",
  ) => {
    const n = sortConfig[mode][direction] === "asc" ? 1 : -1;

    if (mode === "name") {
      return item.toSorted((a, b) => {
        if (
          datasetConfig[a.name].label.toLowerCase() <
          datasetConfig[b.name].label.toLowerCase()
        ) {
          return n * -1;
        } else if (
          datasetConfig[a.name].label.toLowerCase() >
          datasetConfig[b.name].label.toLowerCase()
        ) {
          return n * 1;
        }

        return 0;
      });
    } else if (mode === "category") {
      return item.toSorted((a, b) => {
        if (a.category < b.category) {
          return n * -1;
        } else if (a.category > b.category) {
          return n * 1;
        }
        return 0;
      });
    } else if (mode === "sourceCount") {
      return item.toSorted((a, b) => (a.source - b.source) * n);
    } else if (mode === "targetCount") {
      return item.toSorted((a, b) => (a.target - b.target) * n);
    }

    return item;
  };

  // defaultではnameとascでソートする
  const [nodesList, setNodesList] = useState(
    sortFunc(props.nodes, "name", "down"),
  );
  const [sortModeOrder, setSortModeOrder] = useState<{
    mode: keyof typeof sortConfig;
    direction: "up" | "down";
  }>({
    mode: "name",
    direction: "down",
  });

  useUpdateEffect(() => {
    // 直前の状態と比較して変化していればnameとascでソートする
    setNodesList(sortFunc(props.nodes, "name", "down"));
    setSortModeOrder({
      mode: "name",
      direction: "down",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.nodes]);

  const sortNode = (
    mode: keyof typeof sortConfig,
    direction: "up" | "down",
  ) => {
    setNodesList(sortFunc(nodesList, mode, direction));

    setSortModeOrder({
      mode: mode,
      direction: direction,
    });
  };

  return (
    <div className="item_wrapper">
      <div
        className={
          props.i === 0
            ? "item_wrapper__buttons first"
            : "item_wrapper__buttons"
        }
      >
        <label className="sort__label" htmlFor="sort">
          Sort by
        </label>
        <select
          id="sort"
          className="select white"
          onChange={(e) =>
            sortNode(
              e.target.value as keyof typeof sortConfig,
              sortModeOrder.direction,
            )
          }
          value={sortModeOrder.mode}
        >
          <option value="name">Name</option>
          <option value="category">Category</option>
          {props.i !== 0 && (
            <>
              <option value="sourceCount">Source count</option>
              <option value="targetCount">Target count</option>
            </>
          )}
        </select>
        <div className="sort">
          <button
            onClick={() =>
              sortNode(
                sortModeOrder.mode,
                sortModeOrder.direction === "up" ? "down" : "up",
              )
            }
            className={`sort__button`}
          >
            <div
              className={`sort__button up ${
                sortModeOrder.direction === "up" ? "active" : ""
              }`}
            />
            <div
              className={`sort__button down ${
                sortModeOrder.direction === "down" ? "active" : ""
              }`}
            />
          </button>
        </div>
      </div>

      <ul className={props.i === 0 ? "result_list first" : "result_list"}>
        {nodesList.map((v, j) => (
          <li key={j} className="result_list__item">
            {props.i !== 0 && (
              <div
                id={`label${props.i}-${v.name}`}
                className="label_list label_list__item label_list__item__inner"
              >
                <p className="text">{v.link}</p>
                <button className="circle-button">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 6.427 16.004"
                  >
                    <path
                      d="M13.5,4A1.5,1.5,0,1,0,15,5.5,1.5,1.5,0,0,0,13.5,4m-.36,4.77c-1.19.1-4.44,2.69-4.44,2.69-.2.15-.14.14.02.42s.14.29.33.16.53-.34,1.08-.68c2.12-1.36.34,1.78-.57,7.07-.36,2.62,2,1.27,2.61.87s2.21-1.5,2.37-1.61c.22-.15.06-.27-.11-.52-.12-.17-.24-.05-.24-.05-.65.43-1.84,1.33-2,.76-.19-.57,1.03-4.48,1.7-7.17C14,10.07,14.3,8.67,13.14,8.77Z"
                      transform="translate(-8.573 -4)"
                      fill="#fff"
                    />
                  </svg>
                </button>
              </div>
            )}
            <ExploreResultItem
              i={props.i}
              v={v}
              route={props.route}
              ids={props.ids}
              selectDatabase={props.selectDatabase}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ExploreResult;
