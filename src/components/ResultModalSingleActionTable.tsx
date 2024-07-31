import { printf } from "fast-printf";

type Props = {
  route: Route[];
  tableHead: any[];
  lineMode: string[];
  setLineMode: Dispatch<SetStateAction<string[]>>;
  isShowLabelList: boolean[];
  setIsShowLabelList: Dispatch<SetStateAction<boolean[]>>;
};

const ResultModalActionTable = ({
  route,
  tableHead,
  lineMode,
  setLineMode,
  isShowLabelList,
  setIsShowLabelList,
}: Props) => {
  const { annotateConfig } = useAnnotateConfig();

  const { filterTable } = useResultModalSinglePreview(
    route,
    tableHead,
    isShowLabelList,
    lineMode,
  );

  const joinPrefix = (id: string, mode: string, prefix: string) => {
    // nullチェックが必要な場合は関数に渡す前にチェックすること
    // compactの際の処理を共通化させるためにsplitする
    if (mode === "id") {
      return id;
    } else if (mode === "url") {
      return id
        .split(" ")
        .map((v) => prefix + v)
        .join(" ");
    } else {
      return id
        .split(" ")
        .map((v) => printf(mode, v))
        .join(" ");
    }
  };

  return (
    <table className="table">
      {filterTable && (
        <>
          <thead>
            <tr>
              <th>
                <fieldset>
                  <label htmlFor="0" className="select__label">
                    {filterTable.head[0][0].label}
                  </label>
                  <select
                    id="0"
                    className="select white"
                    value={lineMode[0]}
                    onChange={(e) =>
                      setLineMode(lineMode.toSpliced(0, 1, e.target.value))
                    }
                  >
                    <option value="id">ID</option>
                    {filterTable.head[0][0].format?.map((w: string) => (
                      <option key={w} value={w}>
                        ID ({w.replace("%s", "")})
                      </option>
                    ))}
                    <option value="url">URL</option>
                  </select>

                  {annotateConfig?.includes(filterTable.head[0][0].name) && (
                    <>
                      <input
                        id={"showLabels" + 0}
                        type="checkbox"
                        className="c-switch"
                        checked={isShowLabelList[0]}
                        onChange={(e) =>
                          setIsShowLabelList(
                            isShowLabelList.toSpliced(0, 1, e.target.checked),
                          )
                        }
                      />
                      <label htmlFor={"showLabels" + 0}>Show Labels</label>
                    </>
                  )}
                </fieldset>
              </th>
            </tr>
          </thead>
          <tbody>
            {filterTable.row[0].map((v, i) => (
              <tr key={i}>
                <td>
                  <a
                    href={filterTable.head[0][0].prefix + v[0]}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {joinPrefix(
                      v[0],
                      lineMode[0],
                      filterTable.head[0][0].prefix,
                    )}
                  </a>
                  {v[1] && <span> {v[1]}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </>
      )}
    </table>
  );
};

export default ResultModalActionTable;
