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
        filterTable &&
        !isCompact &&
        tableHeadBase.annotateList.some((annotate) => annotate.checked)
        ? {
            name: tableHeadBase.name,
            ids: filterTable.map((v) => v[index]),
            fields: tableHeadBase.annotateList.map(
              (annotate) => annotate.variable,
            ),
            variables: tableHeadBase.annotateList.reduce((prev, curr) => {
              const tmp = curr.items
                ?.filter((v) => v.checked)
                .map((v) => v.label);
              return tmp?.length
                ? {
                    ...prev,
                    [curr.variable]: { value: tmp, type: "[String!]" },
                  }
                : prev;
            }, {}),
          }
        : null,
      async (key) => {
        return await executeAnnotateQuery(key);
      },
    );
  });

  const filterTableAnnotate = useMemo(() => {
    if (
      !filterTable ||
      isCompact ||
      !tableHeadList.some((v) =>
        v.annotateList.some(
          (w) => w.checked && w.items?.some((x) => x.checked),
        ),
      )
    ) {
      return filterTable;
    }

    const idsList = resultList.map((v) =>
      v.data ? Object.keys(v.data) : v.data,
    );

    return filterTable.filter((data) =>
      tableHeadList.every((tableHead, i) => {
        return (
          !tableHead.annotateList.some((v) => v.checked) ||
          idsList[tableHead.index]?.includes(data[i])
        );
      }),
    );
  }, [isCompact, filterTable, tableHeadList, resultList]);

  const updateAnnotate = (
    tableIndex: number,
    annotateIndex: number,
    updater: (
      annotate: TableHead["annotateList"][number],
    ) => TableHead["annotateList"][number],
  ) => {
    setTableHeadBaseList((prev) => {
      const table = prev[tableIndex];
      const oldAnnotate = table.annotateList[annotateIndex];
      const updatedAnnotate = updater(oldAnnotate);
      const updatedAnnotateList = table.annotateList.with(
        annotateIndex,
        updatedAnnotate,
      );
      const updatedTable = { ...table, annotateList: updatedAnnotateList };
      return prev.with(tableIndex, updatedTable);
    });
  };

  const updateAnnotateChecked = (
    tableIndex: number,
    annotateIndex: number,
    checked: boolean,
  ) => {
    updateAnnotate(tableIndex, annotateIndex, (annotate) => {
      const updatedItems =
        !checked && annotate.items
          ? annotate.items.map((item) => ({
              ...item,
              checked: false,
            }))
          : annotate.items;

      return {
        ...annotate,
        checked,
        items: updatedItems,
      };
    });
  };

  const updateAnnotateItemChecked = (
    tableIndex: number,
    annotateIndex: number,
    itemIndex: number,
    checked: boolean,
  ) => {
    updateAnnotate(tableIndex, annotateIndex, (annotate) => {
      const updatedItems = annotate.items!.with(itemIndex, {
        ...annotate.items![itemIndex],
        checked,
      });
      return { ...annotate, items: updatedItems };
    });
  };

  return (
    <table className="table">
      <thead>
        <tr>
          {filterTable?.length &&
            tableHeadList.map((tableHead, i) => (
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
                    {!isCompact && tableHead.annotateList.length > 0 && (
                      <div className="flex-box">
                        {tableHead.annotateList.length > 1 && (
                          <details className="detail">
                            <summary className="detail__summary">
                              ANNOTATION
                            </summary>
                            <div className="detail__contents">
                              {tableHead.annotateList
                                .slice(1)
                                .map((annotate, j) => (
                                  <Fragment key={j}>
                                    <input
                                      id={`${annotate.label}-${i}`}
                                      className="checkbox"
                                      type="checkbox"
                                      checked={annotate.checked}
                                      onChange={(e) =>
                                        updateAnnotateChecked(
                                          tableHead.index,
                                          annotate.index,
                                          e.target.checked,
                                        )
                                      }
                                    />
                                    <label
                                      htmlFor={`${annotate.label}-${i}`}
                                      className="checkbox-label"
                                    >
                                      {annotate.label}
                                    </label>
                                  </Fragment>
                                ))}
                            </div>
                          </details>
                        )}
                        <input
                          id={`showLabels${i}`}
                          type="checkbox"
                          className="c-switch"
                          checked={tableHead.annotateList[0].checked}
                          onChange={(e) =>
                            updateAnnotateChecked(
                              tableHead.index,
                              tableHead.annotateList[0].index,
                              e.target.checked,
                            )
                          }
                        />
                        <label htmlFor={`showLabels${i}`}>Show Labels</label>
                      </div>
                    )}
                  </fieldset>
                </th>
                {!isCompact &&
                  tableHead.annotateList
                    .filter((annotate) => annotate.checked)
                    .map((annotate) => (
                      <Fragment key={annotate.variable}>
                        <th>
                          {annotate.label}
                          {annotate.items?.length && (
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
                                      className="checkbox"
                                      type="checkbox"
                                      checked={item.checked}
                                      onChange={(e) =>
                                        updateAnnotateItemChecked(
                                          tableHead.index,
                                          annotate.index,
                                          j,
                                          e.target.checked,
                                        )
                                      }
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
                          )}
                        </th>
                      </Fragment>
                    ))}
              </Fragment>
            ))}
        </tr>
      </thead>
      <tbody>
        {!isLoading &&
          (filterTableAnnotate?.length ? (
            filterTableAnnotate.map((data, i) => (
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
                                      value: tableHeadList[j].prefix![0].uri,
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
                                    value: tableHeadList[j].prefix![0].uri,
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
                                  resultList?.[tableHeadList[j].index]?.data?.[
                                    d
                                  ]?.[annotate.variable]
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
          ) : (
            <tr>
              <td colSpan={tableHeadList.length} className="no_results">
                No Results
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  );
};

export default ResultModalActionTable;
