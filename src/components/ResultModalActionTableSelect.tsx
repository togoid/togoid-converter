type Props = {
  id: string;
  value: TableHead["lineMode"];
  tableHead: TableHead | (DatasetConfig[number] & { key: string });
  onChange: (value: TableHead["lineMode"]) => void;
  children: React.ReactNode;
};

const ResultModalActionTableSelect = ({
  id,
  value,
  tableHead,
  onChange,
  children,
}: Props) => {
  return (
    <>
      <label htmlFor={id} className="select__label">
        {children}
      </label>
      <select
        id={id}
        className="select white"
        value={JSON.stringify(value)}
        onChange={(e) => onChange(JSON.parse(e.target.value))}
      >
        {tableHead.format ? (
          tableHead.format.map((w: string) => (
            <option key={w} value={JSON.stringify({ key: "id", value: w })}>
              {w === "%s" ? "ID" : `ID (${w.replace("%s", "")})`}
            </option>
          ))
        ) : (
          <option value={JSON.stringify({ key: "id", value: "" })}>ID</option>
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
              {`URL (${w.label})`}
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
    </>
  );
};

export default ResultModalActionTableSelect;
