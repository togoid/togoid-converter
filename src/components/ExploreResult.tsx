import { useUpdateEffect } from "react-use";

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
            {props.i !== 0 && <ExploreResultRelation i={props.i} v={v} />}
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
