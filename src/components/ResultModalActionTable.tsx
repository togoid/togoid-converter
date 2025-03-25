// import useSWRImmutable from "swr/immutable";
import useSWR from "swr";

type Props = {
  isCompact: boolean;
  lineModeList: {
    key: "id" | "url";
    value: string;
  }[];
  setLineModeList: Dispatch<
    SetStateAction<
      {
        key: "id" | "url";
        value: string;
      }[]
    >
  >;
  isShowLabelList: boolean[];
  setIsShowLabelList: Dispatch<SetStateAction<boolean[]>>;
  filterTable: ReturnType<typeof useResultModalPreview>["filterTable"];
};

const ResultModalActionTable = ({
  isCompact,
  lineModeList,
  setLineModeList,
  isShowLabelList,
  setIsShowLabelList,
  filterTable,
}: Props) => {
  const { annotateConfig } = useAnnotateConfig();

  const resultList = isShowLabelList.map((_, i) => {
    const index = filterTable?.heading.findIndex((v) => v.index === i)!;
    const head = filterTable?.heading![index];
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useSWR(
      isShowLabelList[i] && filterTable
        ? {
            name: filterTable.heading![index].name,
            ids: filterTable.rows.map((v) => v[index]),
            annotations: head?.annotations,
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
                        value={JSON.stringify(lineModeList[v.index])}
                        onChange={(e) =>
                          setLineModeList(
                            lineModeList.toSpliced(
                              v.index,
                              1,
                              JSON.parse(e.target.value),
                            ),
                          )
                        }
                      >
                        {v.format ? (
                          v.format.map((w: string) => (
                            <option
                              key={w}
                              value={JSON.stringify({ key: "id", value: w })}
                            >
                              {w === "%s"
                                ? "ID"
                                : `ID (${w.replace("%s", "")})`}
                            </option>
                          ))
                        ) : (
                          <option
                            value={JSON.stringify({ key: "id", value: "" })}
                          >
                            ID
                          </option>
                        )}
                        {v.prefix.length > 1 ? (
                          v.prefix.map((w) => (
                            <option
                              key={w.uri}
                              value={JSON.stringify({
                                key: "url",
                                value: w.uri,
                              })}
                            >
                              {`URL (${w.uri})`}
                            </option>
                          ))
                        ) : (
                          <option
                            value={JSON.stringify({
                              key: "url",
                              value: v.prefix[0].uri,
                            })}
                          >
                            URL
                          </option>
                        )}
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
                  {!isCompact &&
                    annotateConfig.includes(v.name) &&
                    isShowLabelList[v.index] &&
                    v.annotations?.map((v) => (
                      <th key={v.variable}>{v.label}</th>
                    ))}
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
                                lineModeList[filterTable.heading![j].index]
                                  .key === "url"
                                  ? lineModeList[filterTable.heading![j].index]
                                  : {
                                      key: "url",
                                      value:
                                        filterTable.heading![j].prefix[0].uri,
                                    },
                              )}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {joinPrefix(
                                f,
                                lineModeList[filterTable.heading![j].index],
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
                              lineModeList[filterTable.heading![j].index]
                                .key === "url"
                                ? lineModeList[filterTable.heading![j].index]
                                : {
                                    key: "url",
                                    value:
                                      filterTable.heading![j].prefix[0].uri,
                                  },
                            )}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {joinPrefix(
                              d,
                              lineModeList[filterTable.heading![j].index],
                            )}
                          </a>
                        </td>
                        {isShowLabelList[filterTable.heading![j].index] && (
                          <td>
                            <span>
                              {
                                resultList[filterTable.heading![j].index]
                                  .data?.[d].label
                              }
                            </span>
                          </td>
                        )}
                        {isShowLabelList[filterTable.heading![j].index] &&
                          filterTable.heading![j].annotations?.map((v) => (
                            <td key={v.variable}>
                              <span>
                                {Array.isArray(
                                  resultList[filterTable.heading![j].index]
                                    .data?.[d][v.variable],
                                )
                                  ? resultList[
                                      filterTable.heading![j].index
                                    ].data?.[d][v.variable].join(" ")
                                  : resultList[filterTable.heading![j].index]
                                      .data?.[d][v.variable]}
                              </span>
                            </td>
                          ))}
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
