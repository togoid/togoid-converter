type Props = {
  route: Route[];
  ids: any;
  previewMode: string;
  isCompact: boolean;
  tableHead: any[];
  prefixList: any[];
  lineMode: string[];
  handleSelectPrefix: (e: any) => any;
};

const ResultModalActionTable = ({
  route,
  ids,
  previewMode,
  isCompact,
  tableHead,
  prefixList,
  lineMode,
  handleSelectPrefix,
}: Props) => {
  const filterTable = useResultModalPreview(
    previewMode,
    isCompact,
    route,
    ids,
    tableHead,
    prefixList,
  );

  return (
    <table className="table">
      <thead>
        <tr>
          {filterTable?.rows?.length > 0 &&
            filterTable.heading.map((v, i) => {
              return (
                <th key={i}>
                  <fieldset>
                    <label htmlFor={i} className="select__label">
                      {v.label}
                    </label>
                    <select
                      id={v.index}
                      className="select white"
                      onChange={(e) => handleSelectPrefix(e)}
                      value={lineMode[v.index]}
                    >
                      <option value="id">ID</option>
                      {prefixList[v.index].map((w) => (
                        <option key={w.label} value={w.value}>
                          ID ({w.label})
                        </option>
                      ))}
                      <option value="url">URL</option>
                    </select>

                    <input
                      id={"showLabels" + i}
                      type="checkbox"
                      className="c-switch"
                    />
                    <label htmlFor={"showLabels" + i}>Show Labels</label>
                  </fieldset>
                </th>
              );
            })}
        </tr>
      </thead>
      <tbody>
        {filterTable?.rows?.length > 0
          ? filterTable.rows.map((data, i) => (
              <tr key={i}>
                {data.map((d, j) => (
                  <td key={j}>
                    {isCompact ? (
                      d.url &&
                      Array.isArray(d.url) &&
                      d.url.map((f, k) => (
                        <Fragment key={k}>
                          <a href={f} target="_blank" rel="noreferrer">
                            {d[lineMode[filterTable.heading[j].index]][k]}
                          </a>
                          <br />
                        </Fragment>
                      ))
                    ) : (
                      <a href={d.url} target="_blank" rel="noreferrer">
                        {d[lineMode[filterTable.heading[j].index]]}
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
