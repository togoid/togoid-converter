import axios from "axios";
import useSWRImmutable from "swr/immutable";
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

  return (
    <table className="table">
      <thead>
        <tr>
          <th>
            <fieldset>
              <label htmlFor="0" className="select__label">
                {tableHead[0].label}
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
                {tableHead[0].format?.map((w: string) => (
                  <option key={w} value={w}>
                    ID ({w.replace("%s", "")})
                  </option>
                ))}
                <option value="url">URL</option>
              </select>

              {annotateConfig?.includes(tableHead[0].name) && (
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
        {route[0].results.map((v, i) => (
          <tr key={i}>
            <td>
              {
                <a
                  href={tableHead[0].prefix + v}
                  target="_blank"
                  rel="noreferrer"
                >
                  {v}
                </a>
              }
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ResultModalActionTable;
