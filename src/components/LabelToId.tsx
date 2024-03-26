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
  const [threshold, setThreshold] = useState(0.5);
  const [isShowTable, setIsShowTable] = useState(false);
  const [pubdictionariesParam, setPubdictionariesParam] = useState({
    labels: "",
    dictionaries: "",
    threshold: undefined as number | undefined,
    verbose: true,
  });

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

  const handleExecute = () => {
    setPubdictionariesParam({
      labels: "ovarian+cancer",
      dictionaries: selectDictionaryList.filter((v) => v).join(","),
      threshold: dataset?.label_resolver?.threshold ? threshold : undefined,
      verbose: true,
    });

    setIsShowTable(true);
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
                  min="0"
                  max="1"
                  step="0.1"
                  className="threshold"
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
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

            <button className="submit" onClick={handleExecute}>
              EXECUTE
            </button>
          </>
        )}
      </div>
      {isShowTable && (
        <LabelToIdTable
          pubdictionariesParam={pubdictionariesParam}
          dataset={dataset}
        />
      )}
    </div>
  );
};

export default LabelToId;
