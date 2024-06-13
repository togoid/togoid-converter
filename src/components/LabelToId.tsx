import useSWRImmutable from "swr/immutable";
import axios from "axios";
import Select from "react-select";

const LabelToId = () => {
  useSignals();

  const { datasetConfig } = useConfig();

  const species = useSignal<string | undefined>(undefined);
  const [dataset, setDataset] = useState();
  const [selectDictionaryList, setSelectDictionaryList] = useState<
    (string | false)[]
  >([]);
  const [threshold, setThreshold] = useState(0.5);
  const [isShowTable, setIsShowTable] = useState(false);
  const [pubdictionariesParam, setPubdictionariesParam] = useState({
    labels: "",
    dictionaries: "",
    tag: undefined as string | undefined,
    threshold: undefined as number | undefined,
    verbose: true,
  });
  const text = useAtomValue(textAtom);

  const { data: taxonomyList } = useSWRImmutable("taxonomy", async () => {
    const res = await axios.get<string[][]>(
      `${process.env.NEXT_PUBLIC_API_ENDOPOINT}/config/taxonomy`,
    );

    return res.data;
  });

  const handleSelectDropDown = (value: any) => {
    setIsShowTable(false);
    species.value = undefined;
    setDataset(value);
    setSelectDictionaryList(
      value.label_resolver.dictionaries.map((v) => v.dictionary),
    );
  };

  const handleExecute = () => {
    const labels = text
      .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) =>
        String.fromCharCode(s.charCodeAt(0) - 0xfee0),
      )
      .split(/[\n,、,,]+/)
      .filter((v) => v)
      .map((v) => v.trim().replace(/\s+/g, "+"))
      .join("|");

    // exanple: ovarian+cancer
    setPubdictionariesParam({
      labels: labels,
      dictionaries: selectDictionaryList.filter((v) => v).join(","),
      tag: dataset?.label_resolver?.taxonomy ? species.value : undefined,
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
              <LabelToIdSpecies species={species} />
            )}
            {dataset?.label_resolver?.threshold && (
              <div>
                <label className="label">
                  <span>Threshold</span>
                  <details className="information-tooltip">
                    <summary className="information-tooltip__summary">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                      >
                        <title>information</title>
                        <path d="M12.3 7.29C12.5 7.11 12.74 7 13 7C13.27 7 13.5 7.11 13.71 7.29C13.9 7.5 14 7.74 14 8C14 8.27 13.9 8.5 13.71 8.71C13.5 8.9 13.27 9 13 9C12.74 9 12.5 8.9 12.3 8.71C12.11 8.5 12 8.27 12 8C12 7.74 12.11 7.5 12.3 7.29M9.8 11.97C9.8 11.97 11.97 10.25 12.76 10.18C13.5 10.12 13.35 10.97 13.28 11.41L13.27 11.47C13.13 12 12.96 12.64 12.79 13.25C12.41 14.64 12.04 16 12.13 16.25C12.23 16.59 12.85 16.16 13.3 15.86C13.36 15.82 13.41 15.78 13.46 15.75C13.46 15.75 13.54 15.67 13.62 15.78C13.64 15.81 13.66 15.84 13.68 15.86C13.77 16 13.82 16.05 13.7 16.13L13.66 16.15C13.44 16.3 12.5 16.96 12.12 17.2C11.71 17.47 10.14 18.37 10.38 16.62C10.59 15.39 10.87 14.33 11.09 13.5C11.5 12 11.68 11.32 10.76 11.91C10.39 12.13 10.17 12.27 10.04 12.36C9.93 12.44 9.92 12.44 9.85 12.31L9.82 12.25L9.77 12.17C9.7 12.07 9.7 12.06 9.8 11.97M22 12C22 17.5 17.5 22 12 22C6.5 22 2 17.5 2 12C2 6.5 6.5 2 12 2C17.5 2 22 6.5 22 12M20 12C20 7.58 16.42 4 12 4C7.58 4 4 7.58 4 12C4 16.42 7.58 20 12 20C16.42 20 20 16.42 20 12Z" />
                      </svg>
                    </summary>
                    <div className="information-tooltip__body">
                      Threshold can be set to a value between 0.5 and 1. When
                      this is set to 1, only exact matched labels are allowed,
                      while lower values allow for less strict matches.
                    </div>
                  </details>
                </label>
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
