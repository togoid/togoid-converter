type Props = {
  isCompact: boolean;
  tableHead: {
    index: number;
    name: string;
    catalog: string;
    category: string;
    description?: string;
    examples: string[];
    format?: string[];
    label: string;
    label_resolver?: any;
    linkTo: any;
    prefix: string;
    regex: string;
  }[];
  lineMode: string[];
  setLineMode: Dispatch<SetStateAction<string[]>>;
  isShowLabelList: boolean[];
  setIsShowLabelList: Dispatch<SetStateAction<boolean[]>>;
  filterTable: ReturnType<typeof useResultModalPreview>["filterTable"];
  labelList: ReturnType<typeof useResultModalPreview>["labelList"];
};

const ResultModalActionTable = ({
  isCompact,
  tableHead,
  lineMode,
  setLineMode,
  isShowLabelList,
  setIsShowLabelList,
  filterTable,
  labelList,
}: Props) => {
  const { annotateConfig } = useAnnotateConfig();

  return (
    <table className="table">
      <thead>
        <tr>
          {filterTable?.rows?.length &&
            filterTable.heading.map((v, i) => {
              return (
                <th key={i}>
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
                      <option value="id">ID</option>
                      {v.format?.map((w) => (
                        <option key={w} value={w}>
                          ID ({w.replace("%s", "")})
                        </option>
                      ))}
                      <option value="url">URL</option>
                    </select>

                    {annotateConfig?.includes(v.name) && (
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
              );
            })}
        </tr>
      </thead>
      <tbody>
        {filterTable?.heading?.length && filterTable?.rows?.length
          ? filterTable.rows.map((data, i) => (
              <tr key={i}>
                {data.map((d, j) => (
                  <td key={j}>
                    {isCompact ? (
                      d?.split(" ")?.map((f, k) => (
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
                          {isShowLabelList[filterTable.heading![j].index] &&
                            labelList?.[filterTable.heading![j].index]?.find(
                              (v) => v.id === f,
                            ) && (
                              <span>
                                {" " +
                                  labelList?.[
                                    filterTable.heading![j].index
                                  ]?.find((v) => v.id === f)?.label}
                              </span>
                            )}
                          <br />
                        </Fragment>
                      ))
                    ) : (
                      <>
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
                        {isShowLabelList[filterTable.heading![j].index] &&
                          labelList?.[filterTable.heading![j].index]?.find(
                            (v) => v.id === d,
                          ) && (
                            <span>
                              {" " +
                                labelList?.[
                                  filterTable.heading![j].index
                                ]?.find((v) => v.id === d)?.label}
                            </span>
                          )}
                      </>
                    )}
                  </td>
                ))}
              </tr>
            ))
          : filterTable?.heading && (
              <tr>
                <td colSpan={tableHead.length} className="no_results">
                  No Results
                </td>
              </tr>
            )}
      </tbody>
    </table>
  );
};

export default ResultModalActionTable;
