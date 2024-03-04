import useSWRImmutable from "swr/immutable";
import axios from "axios";
import Select from "react-select";

const LabelToId = () => {
  const { datasetConfig } = useConfig();

  const [dataset, setDataset] = useState();
  const [species, setSpecies] = useState();
  const [selectDictionaryList, setSelectDictionaryList] = useState<
    (string | false)[]
  >([]);

  const { data: taxonomyList } = useSWRImmutable("taxonomy", async () => {
    const res = await axios.get<string[][]>(
      `${process.env.NEXT_PUBLIC_API_ENDOPOINT}/config/taxonomy`,
    );

    return res.data;
  });

  const handleSelectDropDown = (value: any) => {
    setDataset(value);
    setSelectDictionaryList(
      value.label_resolver.dictionaries.map((v) => v.dictionary),
    );
  };

  const handleSelectSpecies = (value: any) => {
    setSpecies(value);
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
        options={Object.values(datasetConfig)
          .filter((value) => "label_resolver" in value)
          .map((value) => ({
            value: value,
            label: value.label,
          }))}
        placeholder="Select a dataset"
        onChange={(e) => handleSelectDropDown(e!.value)}
      />

      {taxonomyList?.length && dataset && (
        <div>
          {dataset?.label_resolver?.taxonomy && (
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
                options={taxonomyList.map((v) => ({
                  value: "",
                  label: `${v[1]} (ID: ${v[0]}, ${v[2]}, ${v[3]})`,
                }))}
                placeholder="Select a species"
                onChange={(e) => handleSelectSpecies(e!.value)}
              />
              OR
              <input type="text" />
            </div>
          )}
          {dataset?.label_resolver?.threshold && (
            <div>
              <p>Threshold</p>
            </div>
          )}
          <div>
            <p>Select label types</p>
            {dataset.label_resolver.dictionaries?.map((v, i) => (
              <div key={v.label}>
                <label>
                  <input
                    type="checkbox"
                    value={v.dictionary}
                    checked={Boolean(selectDictionaryList[i])}
                    onChange={(e) =>
                      setSelectDictionaryList(
                        selectDictionaryList.toSpliced(
                          i,
                          1,
                          e.target.checked ? e.target.value : false,
                        ),
                      )
                    }
                  />
                  {v.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LabelToId;
