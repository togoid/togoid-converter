import useSWRImmutable from "swr/immutable";
// import useSWR from "swr";

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
    return useSWRImmutable(
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
                      <ResultModalActionTableSelect
                        id={String(tableHead.index)}
                        value={tableHead.lineMode}
                        tableHead={tableHead}
                        onChange={(value: TableHead["lineMode"]) =>
                          setTableHeadBaseList(
                            tableHeadBaseList.with(tableHead.index, {
                              ...tableHeadBaseList[tableHead.index],
                              lineMode: value,
                            }),
                          )
                        }
                      >
                        {tableHead.label}
                      </ResultModalActionTableSelect>
                      {!isCompact && tableHead.annotateList.length ? (
                        <details className="detail">
                          <summary className="detail__summary">
                            ANNOTATION
                          </summary>
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
                                        tableHeadBaseList.with(
                                          tableHead.index,
                                          {
                                            ...tableHeadBaseList[
                                              tableHead.index
                                            ],
                                            annotateList: tableHeadBaseList[
                                              tableHead.index
                                            ].annotateList.with(j, {
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
                        <Fragment key={annotate.variable}>
                          <th>
                            {annotate.label}
                            {annotate.items?.length ? (
                              <details className="detail">
                                <summary className="detail__summary">
                                  FILTER
                                </summary>
                                <div className="detail__contents">
                                  {annotate.items.map((item, j) => (
                                    <Fragment key={j}>
                                      <input
                                        id={
                                          annotate.label +
                                          "-" +
                                          i +
                                          "-" +
                                          item.label
                                        }
                                        type="checkbox"
                                        checked={item.checked}
                                        onChange={(e) =>
                                          setTableHeadBaseList(
                                            tableHeadBaseList.with(
                                              tableHead.index,
                                              {
                                                ...tableHeadBaseList[
                                                  tableHead.index
                                                ],
                                                annotateList: tableHeadBaseList[
                                                  tableHead.index
                                                ].annotateList.with(
                                                  annotate.index,
                                                  {
                                                    ...tableHeadBaseList[
                                                      tableHead.index
                                                    ].annotateList[
                                                      annotate.index
                                                    ],
                                                    items: tableHeadBaseList[
                                                      tableHead.index
                                                    ].annotateList[
                                                      annotate.index
                                                    ].items!.with(j, {
                                                      ...tableHeadBaseList[
                                                        tableHead.index
                                                      ].annotateList[
                                                        annotate.index
                                                      ].items![j],
                                                      checked: e.target.checked,
                                                    }),
                                                  },
                                                ),
                                              },
                                            ),
                                          )
                                        }
                                        className="checkbox"
                                      />
                                      <label
                                        htmlFor={
                                          annotate.label +
                                          "-" +
                                          i +
                                          "-" +
                                          item.label
                                        }
                                        className="checkbox-label"
                                      >
                                        {item.label}
                                      </label>
                                    </Fragment>
                                  ))}
                                </div>
                              </details>
                            ) : null}
                          </th>
                        </Fragment>
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
