type Props = {
  route: Route[];
  ids: string[];
  previewMode: string;
  isCompact: boolean;
  tableHead: any[];
  lineMode: string[];
  setLineMode: Dispatch<SetStateAction<string[]>>;
};

const ResultModalActionTable = ({
  route,
  ids,
  previewMode,
  isCompact,
  tableHead,
  lineMode,
  setLineMode,
}: Props) => {
  const filterTable = useResultModalPreview(
    previewMode,
    isCompact,
    route,
    ids,
    tableHead,
  );

  const { annotateConfig } = useAnnotateConfig();

  return (
    <table className="table">
      <thead>
        <tr>
          {filterTable?.rows?.length &&
            filterTable.heading!.map((v, i) => {
              return (
                <th key={i}>
                  <fieldset>
                    <label htmlFor={i} className="select__label">
                      {v.label}
                    </label>
                    <select
                      id={v.index}
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
        {filterTable?.rows?.length
          ? filterTable.rows.map((data, i) => (
              <tr key={i}>
                {data.map((d, j) => (
                  <td key={j}>
                    {isCompact ? (
                      d.id &&
                      Array.isArray(d.id) &&
                      d.id.map((f, k) => (
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
                      ))
                    ) : (
                      <a
                        href={joinPrefix(
                          d.id,
                          "url",
                          filterTable.heading![j].prefix,
                        )}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {joinPrefix(
                          d.id,
                          lineMode[filterTable.heading![j].index],
                          filterTable.heading![j].prefix,
                        )}
                      </a>
                    )}
                  </td>
                ))}
              </tr>
            ))
          : filterTable.heading && (
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
