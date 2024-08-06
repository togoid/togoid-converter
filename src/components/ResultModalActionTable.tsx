type Props = {
  isCompact: boolean;
  lineMode: string[];
  setLineMode: Dispatch<SetStateAction<string[]>>;
  isShowLabelList: boolean[];
  setIsShowLabelList: Dispatch<SetStateAction<boolean[]>>;
  filterTable: ReturnType<typeof useResultModalPreview>["filterTable"];
  labelList: ReturnType<typeof useResultModalPreview>["labelList"];
};

const ResultModalActionTable = ({
  isCompact,
  lineMode,
  setLineMode,
  isShowLabelList,
  setIsShowLabelList,
  filterTable,
  labelList,
}: Props) => {
  const { annotateConfig } = useAnnotateConfig();
  console.log(labelList);

  return (
    <table className="table">
      <thead>
        <tr>
          {filterTable?.rows?.length &&
            filterTable.heading.map((v, i) => {
              return (
                <Fragment key={i}>
                  <th>
                    <fieldset>
                      <label htmlFor={String(i)} className="select__label">
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

                      {!isCompact && annotateConfig?.includes(v.name) && (
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
                    annotateConfig?.includes(v.name) &&
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
                        {isShowLabelList[filterTable.heading![j].index] &&
                          labelList?.[filterTable.heading![j].index]?.[d] && (
                            <td>
                              <span>
                                {
                                  labelList?.[filterTable.heading![j].index]?.[
                                    d
                                  ]
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
