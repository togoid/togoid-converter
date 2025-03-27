// import useSWRImmutable from "swr/immutable";
import useSWR from "swr";

type Props = {
  isCompact: boolean;
  tableHeadBaseList: TableHead[];
  setTableHeadBaseList: Dispatch<SetStateAction<TableHead[]>>;
  tableHeadList: TableHead[];
  filterTable?: string[][];
  isLoading: boolean;
};

const ResultModalActionTable = ({
  isCompact,
  tableHeadBaseList,
  setTableHeadBaseList,
  tableHeadList,
  filterTable,
  isLoading,
}: Props) => {
  const resultList = tableHeadBaseList.map((tableHeadBase, i) => {
    const index = tableHeadList.findIndex((v) => v.index === i)!;
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useSWR(
      index !== -1 &&
        tableHeadBase.annotateList.some((annotate) => annotate.checked)
        ? {
            name: tableHeadBase.name,
            ids: filterTable!.map((v) => v[index]),
            annotations: tableHeadBase.annotateList.map(
              (annotate) => annotate.variable,
            ),
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
          {filterTable?.length &&
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
                      {!isCompact && tableHead.annotateList.length ? (
                        <details className="detail">
                          <summary className="detail__summary">SELECT</summary>
                          <div className="detail__contents">
                            {!isCompact &&
                              tableHead.annotateList.map((annotate, j) => (
                                <Fragment key={j}>
                                  <input
                                    id={annotate.label + "-" + i}
                                    type="checkbox"
                                    checked={annotate.checked}
                                    onChange={(e) =>
                                      setTableHeadBaseList(
                                        tableHeadBaseList.toSpliced(
                                          tableHead.index,
                                          1,
                                          {
                                            ...tableHeadBaseList[
                                              tableHead.index
                                            ],
                                            annotateList: tableHeadBaseList[
                                              tableHead.index
                                            ].annotateList.toSpliced(j, 1, {
                                              ...tableHeadBaseList[
                                                tableHead.index
                                              ].annotateList[j],
                                              checked: e.target.checked,
                                            }),
                                          },
                                        ),
                                      )
                                    }
                                    className="checkbox"
                                  />
                                  <label
                                    htmlFor={annotate.label + "-" + i}
                                    className="checkbox-label"
                                  >
                                    {annotate.label}
                                  </label>
                                </Fragment>
                              ))}
                          </div>
                        </details>
                      ) : null}
                    </fieldset>
                  </th>
                  {!isCompact &&
                    tableHead.annotateList
                      .filter((annotate) => annotate.checked)
                      .map((annotate) => (
                        <th key={annotate.variable}>{annotate.label}</th>
                      ))}
                </Fragment>
              );
            })}
        </tr>
      </thead>
      <tbody>
        {!isLoading && filterTable?.length
          ? filterTable.map((data, i) => (
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
                        {tableHeadList[j].annotateList
                          .filter((annotate) => annotate.checked)
                          .map((annotate) => (
                            <td key={`${i}-${j}-${annotate.variable}`}>
                              <span>
                                {
                                  resultList[tableHeadList[j].index].data?.[d][
                                    annotate.variable
                                  ]
                                }
                              </span>
                            </td>
                          ))}
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
