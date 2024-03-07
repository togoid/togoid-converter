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
    <div className="label-to-id">
      <div className="label-to-id__inner">
        <div className="dataset">
          <label htmlFor="selectDataset" className="label">
            Dataset
          </label>
          <Select
            id="selectDataset"
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
        </div>

        {taxonomyList?.length && dataset && (
          <>
            {dataset?.label_resolver?.taxonomy && (
              <>
                <div className="">
                  <label htmlFor="selectSpiecies" className="label">
                    Spiecies
                  </label>
                  <Select
                    id="selectSpiecies"
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
                </div>

                <span className="between-text">OR</span>
                <input type="text" className="keyword" />
              </>
            )}
            {dataset?.label_resolver?.threshold && (
              <div>
                <label className="label">Threshold</label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  className="threshold"
                />
              </div>
            )}
            <fieldset className="labels">
              <legend className="label">Select label types</legend>
              <div className="labels__wrapper">
                {dataset.label_resolver.dictionaries?.map((v, i) => (
                  <Fragment key={v.label}>
                    <input
                      type="checkbox"
                      id={v.label}
                      value={v.dictionary}
                      className="checkbox"
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
                    <label htmlFor={v.label} className="checkbox-label">
                      {v.label}
                    </label>
                  </Fragment>
                ))}
              </div>
            </fieldset>

            <button className="submit">EXECUTE</button>
          </>
        )}
      </div>
    </div>
  );
};

export default LabelToId;
