// import useSWRImmutable from "swr/immutable";
import useSWR from "swr";

type Props = {
  isCompact: boolean;
  lineMode: string[];
  setLineMode: Dispatch<SetStateAction<string[]>>;
  isShowLabelList: boolean[];
  setIsShowLabelList: Dispatch<SetStateAction<boolean[]>>;
  filterTable: ReturnType<typeof useResultModalPreview>["filterTable"];
};

const ResultModalActionTable = ({
  isCompact,
  lineMode,
  setLineMode,
  isShowLabelList,
  setIsShowLabelList,
  filterTable,
}: Props) => {
  const { annotateConfig } = useAnnotateConfig();

  const resultList = isShowLabelList.map((_, i) => {
    const index = filterTable?.heading.findIndex((v) => v.index === i)!;
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useSWR(
      isShowLabelList[i] && filterTable
        ? {
            name: filterTable.heading![index].name,
            ids: filterTable.rows.map((v) => v[index]),
          }
        : null,
      async (key) => {
        return await executeAnnotateQuery(key);
      },
    );
  });

  return (
    <table className="table">
      <thead>
        <tr>
          {filterTable?.rows?.length &&
            filterTable.heading.map((v, i) => {
              return (
                <Fragment key={v.index}>
                  <th>
                    <fieldset>
                      <label
                        htmlFor={String(v.index)}
                        className="select__label"
                      >
                        {v.label}
                      </label>
                      <select
                        id={String(v.index)}
                        className="select white"
                        value={lineMode[v.index]}
                        onChange={(e) =>
                          setLineMode(
                            lineMode.toSpliced(v.index, 1, e.target.value),
                          )
                        }
                      >
                        {v.format ? (
                          v.format.map((w: string) => (
                            <option key={w} value={w}>
                              {w === "%s"
                                ? "ID"
                                : `ID (${w.replace("%s", "")})`}
                            </option>
                          ))
                        ) : (
                          <option value="id">ID</option>
                        )}
                        <option value="url">URL</option>
                      </select>

                      {!isCompact && annotateConfig.includes(v.name) && (
                        <>
                          <input
                            id={"showLabels" + i}
                            type="checkbox"
                            className="c-switch"
                            checked={isShowLabelList[v.index]}
                            onChange={(e) =>
                              setIsShowLabelList(
                                isShowLabelList.toSpliced(
                                  v.index,
                                  1,
                                  e.target.checked,
                                ),
                              )
                            }
                          />
                          <label htmlFor={"showLabels" + i}>Show Labels</label>
                        </>
                      )}
                    </fieldset>
                  </th>
                  {!isCompact &&
                    annotateConfig.includes(v.name) &&
                    isShowLabelList[v.index] && <th></th>}
                </Fragment>
              );
            })}
        </tr>
      </thead>
      <tbody>
        {filterTable?.heading?.length && filterTable?.rows?.length
          ? filterTable.rows.map((data, i) => (
              <tr key={i}>
                {data.map((d, j) => (
                  <Fragment key={j}>
                    {isCompact ? (
                      <td>
                        {d?.split(" ")?.map((f, k) => (
                          <Fragment key={k}>
                            <a
                              href={joinPrefix(
                                f,
                                "url",
                                filterTable.heading![j].prefix,
                              )}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {joinPrefix(
                                f,
                                lineMode[filterTable.heading![j].index],
                                filterTable.heading![j].prefix,
                              )}
                            </a>
                            <br />
                          </Fragment>
                        ))}
                      </td>
                    ) : (
                      <>
                        <td>
                          <a
                            href={joinPrefix(
                              d,
                              "url",
                              filterTable.heading![j].prefix,
                            )}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {joinPrefix(
                              d,
                              lineMode[filterTable.heading![j].index],
                              filterTable.heading![j].prefix,
                            )}
                          </a>
                        </td>
                        {isShowLabelList[filterTable.heading![j].index] && (
                          <td>
                            <span>
                              {
                                resultList[filterTable.heading![j].index]
                                  .data?.[d]
                              }
                            </span>
                          </td>
                        )}
                      </>
                    )}
                  </Fragment>
                ))}
              </tr>
            ))
          : filterTable?.heading && (
              <tr>
                <td
                  colSpan={filterTable?.heading.length}
                  className="no_results"
                >
                  No Results
                </td>
              </tr>
            )}
      </tbody>
    </table>
  );
};

export default ResultModalActionTable;
