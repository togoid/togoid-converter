import useSWRImmutable from "swr/immutable";
import axios from "axios";
import Select from "react-select";

const LabelToId = () => {
  const { datasetConfig } = useConfig();

  const [dataset, setDataset] = useState();
  const [path, setPath] = useState();

  const { data } = useSWRImmutable(
    {
      dataset: dataset,
      path: path,
    },
    async () => {
      if (dataset && path) {
        const res = await axios.get<string[][]>(
          `${process.env.NEXT_PUBLIC_API_ENDOPOINT}/config/${path}`,
        );

        return res.data;
      }
    },
  );
  // console.log(data);

  const handleSelectDropDown = (value) => {
    setDataset(value);
    console.log(value);
    if (value) {
      Object.entries(value.label_resolver).forEach(([key, value]) => {
        if (value === true) {
          setPath(key);
        }
      });
    }
  };

  return (
    <div className="home">
      <Select
        styles={{
          control: (css) => ({
            ...css,
            width: "300px",
          }),
          menu: ({ width, ...css }) => ({
            ...css,
            width: "300px",
          }),
          option: (css) => ({ ...css, width: "300px" }),
        }}
        options={Object.keys(datasetConfig)
          .filter((key) => "label_resolver" in datasetConfig[key])
          .map((key) => ({
            value: datasetConfig[key],
            label: datasetConfig[key].label,
          }))}
        placeholder="---"
        onChange={(e) => handleSelectDropDown(e!.value)}
      />
      {data?.length && (
        <div>
          <div>
            <Select
              styles={{
                control: (css) => ({
                  ...css,
                  width: "300px",
                }),
                menu: ({ width, ...css }) => ({
                  ...css,
                  width: "300px",
                }),
                option: (css) => ({ ...css, width: "300px" }),
              }}
              options={data.map((v) => ({
                value: "",
                label: `${v[1]} (ID: ${v[0]}, ${v[2]}, ${v[3]})`,
              }))}
              placeholder="---"
              onChange={(e) => handleSelectDropDown(e!.value)}
            />
            OR
            <input type="text" />
          </div>
          <div>
            <p>Select label types</p>
            {dataset.label_resolver.relations?.map((v) => (
              <div key={v.label}>
                <input type="checkbox" />
                <label>{v.label}</label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LabelToId;
