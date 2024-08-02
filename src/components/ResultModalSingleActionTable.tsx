import { printf } from "fast-printf";

type Props = {
  route: Route[];
  tableHead: any[];
  lineMode: string[];
  setLineMode: Dispatch<SetStateAction<string[]>>;
  isShowLabelList: boolean[];
  setIsShowLabelList: Dispatch<SetStateAction<boolean[]>>;
};

const ResultModalSingleActionTable = ({
  route,
  tableHead,
  lineMode,
  setLineMode,
  isShowLabelList,
  setIsShowLabelList,
}: Props) => {
  const { annotateConfig } = useAnnotateConfig();

  const { filterTable, labelList } = useResultModalSinglePreview(
    route,
    tableHead,
    isShowLabelList,
    lineMode,
  );

  return (
    <table className="table">
      {filterTable && (
        <>
          <thead>
            <tr>
              <th>
                <fieldset>
                  <label htmlFor="0" className="select__label">
                    {filterTable.head[0].label}
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
                    {filterTable.head[0].format?.map((w: string) => (
                      <option key={w} value={w}>
                        ID ({w.replace("%s", "")})
                      </option>
                    ))}
                    <option value="url">URL</option>
                  </select>

                  {annotateConfig?.includes(filterTable.head[0].name) && (
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
                    href={joinPrefix(v, "url", filterTable.head[0].prefix)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {joinPrefix(v, lineMode[0], filterTable.head[0].prefix)}
                  </a>
                  {isShowLabelList[0] &&
                    labelList?.[filterTable.head![0].index]?.find(
                      (w) => w.id === v,
                    ) && (
                      <span>
                        {" " +
                          labelList?.[filterTable.head![0].index]?.find(
                            (w) => w.id === v,
                          )?.label}
                      </span>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </>
      )}
    </table>
  );
};

export default ResultModalSingleActionTable;
