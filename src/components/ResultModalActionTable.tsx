// import useSWRImmutable from "swr/immutable";
import useSWR from "swr";

type Props = {
  isCompact: boolean;
  tableHeadBaseList: ({
    index: number;
    name: string;
    lineMode: {
      key: "id" | "url";
      value: string;
    };
  } & DatasetConfig[number])[];
  setTableHeadBaseList: Dispatch<
    SetStateAction<
      ({
        index: number;
        name: string;
        lineMode: {
          key: "id" | "url";
          value: string;
        };
      } & DatasetConfig[number])[]
    >
  >;
  tableHeadList: ({
    index: number;
    name: string;
    lineMode: {
      key: "id" | "url";
      value: string;
    };
  } & DatasetConfig[number])[];
  isShowLabelList: boolean[];
  setIsShowLabelList: Dispatch<SetStateAction<boolean[]>>;
  filterTable: ReturnType<typeof useResultModalPreview>["filterTable"];
  isLoading: boolean;
};

const ResultModalActionTable = ({
  isCompact,
  tableHeadBaseList,
  setTableHeadBaseList,
  tableHeadList,
  isShowLabelList,
  setIsShowLabelList,
  filterTable,
  isLoading,
}: Props) => {
  const { annotateConfig } = useAnnotateConfig();

  // const resultList = isShowLabelList.map((_, i) => {
  //   const index = filterTable?.heading.findIndex((v) => v.index === i)!;
  //   const head = filterTable?.heading![index];
  //   // eslint-disable-next-line react-hooks/rules-of-hooks
  //   return useSWR(
  //     isShowLabelList[i] && filterTable
  //       ? {
  //           name: filterTable.heading![index].name,
  //           ids: filterTable.rows.map((v) => v[index]),
  //           annotations: head?.annotations,
  //         }
  //       : null,
  //     async (key) => {
  //       return await executeAnnotateQuery(key);
  //     },
  //   );
  // });

  return (
    <table className="table">
      <thead>
        <tr>
          {filterTable?.rows?.length &&
            tableHeadList.map((tableHead, i) => {
              return (
                <Fragment key={tableHead.index}>
                  <th>
                    <fieldset>
                      <label
                        htmlFor={String(tableHead.index)}
                        className="select__label"
                      >
                        {tableHead.label}
                      </label>
                      <select
                        id={String(tableHead.index)}
                        className="select white"
                        value={JSON.stringify(tableHead.lineMode)}
                        onChange={(e) =>
                          setTableHeadBaseList(
                            tableHeadBaseList.toSpliced(tableHead.index, 1, {
                              ...tableHeadBaseList[tableHead.index],
                              lineMode: JSON.parse(e.target.value),
                            }),
                          )
                        }
                      >
                        {tableHead.format ? (
                          tableHead.format.map((w: string) => (
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
                        {tableHead.prefix?.length > 1 ? (
                          tableHead.prefix.map((w) => (
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
                              value: tableHead.prefix?.[0].uri,
                            })}
                          >
                            URL
                          </option>
                        )}
                      </select>

                      {!isCompact &&
                        annotateConfig.includes(tableHead.name) && (
                          <>
                            <input
                              id={"showLabels" + i}
                              type="checkbox"
                              className="c-switch"
                              checked={isShowLabelList[tableHead.index]}
                              onChange={(e) =>
                                setIsShowLabelList(
                                  isShowLabelList.toSpliced(
                                    tableHead.index,
                                    1,
                                    e.target.checked,
                                  ),
                                )
                              }
                            />
                            <label htmlFor={"showLabels" + i}>
                              Show Labels
                            </label>
                          </>
                        )}
                    </fieldset>
                  </th>
                  {!isCompact &&
                    annotateConfig.includes(tableHead.name) &&
                    isShowLabelList[tableHead.index] && <th></th>}
                  {!isCompact &&
                    annotateConfig.includes(tableHead.name) &&
                    isShowLabelList[tableHead.index] &&
                    tableHead.annotations?.map((v) => (
                      <th key={v.variable}>{v.label}</th>
                    ))}
                </Fragment>
              );
            })}
        </tr>
      </thead>
      <tbody>
        {!isLoading && filterTable?.rows?.length
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
                                tableHeadList[j].lineMode.key === "url"
                                  ? tableHeadList[j].lineMode
                                  : {
                                      key: "url",
                                      value: tableHeadList[j].prefix[0].uri,
                                    },
                              )}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {joinPrefix(f, tableHeadList[j].lineMode)}
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
                              tableHeadList[j].lineMode.key === "url"
                                ? tableHeadList[j].lineMode
                                : {
                                    key: "url",
                                    value: tableHeadList[j].prefix[0].uri,
                                  },
                            )}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {joinPrefix(d, tableHeadList[j].lineMode)}
                          </a>
                        </td>
                        {/* {isShowLabelList[filterTable.heading![j].index] && (
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
                          ))} */}
                      </>
                    )}
                  </Fragment>
                ))}
              </tr>
            ))
          : !isLoading && (
              <tr>
                <td colSpan={tableHeadList.length} className="no_results">
                  No Results
                </td>
              </tr>
            )}
      </tbody>
    </table>
  );
};

export default ResultModalActionTable;
