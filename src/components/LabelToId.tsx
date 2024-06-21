import Select from "react-select";

const LabelToId = () => {
  useSignals();

  const { datasetConfig } = useConfig();

  const [dataset, setDataset] = useState<any>();
  const species = useSignal<string | undefined>(undefined);
  const threshold = useSignal(0.5);
  const isShowTable = useSignal(false);
  const [selectDictionaryList, setSelectDictionaryList] = useState<{
    [key: string]: boolean;
  }>({});
  const [pubdictionariesParam, setPubdictionariesParam] = useState({
    labels: "",
    dictionaries: "",
    tags: undefined as string | undefined,
    threshold: undefined as number | undefined,
    verbose: true,
  });
  const text = useAtomValue(textAtom);

  const handleSelectDropDown = (value: any) => {
    isShowTable.value = false;
    species.value = undefined;
    setDataset(value);

    setSelectDictionaryList(
      value.label_resolver.dictionaries.reduce((prev: any, curr: any) => {
        return { ...prev, [curr.dictionary]: true };
      }, {}),
    );
  };

  const handleExecute = () => {
    isShowTable.value = false;

    const labels = text
      .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) =>
        String.fromCharCode(s.charCodeAt(0) - 0xfee0),
      )
      .split(/[\n,、,,]+/)
      .filter((v) => v)
      .map((v) => v.trim().replace(/\s+/g, "+"))
      .join("|");

    // exanple: ovarian cancer
    setPubdictionariesParam({
      labels: labels,
      dictionaries: Object.entries(selectDictionaryList)
        .filter(([_, value]) => value)
        .map(([key, _]) => key)
        .join(","),
      tags: dataset?.label_resolver?.taxonomy ? species.value : undefined,
      threshold: dataset?.label_resolver?.threshold
        ? threshold.value
        : undefined,
      verbose: true,
    });

    isShowTable.value = true;
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

        {dataset && (
          <>
            {dataset?.label_resolver?.taxonomy && (
              <LabelToIdSpecies species={species} />
            )}
            {dataset?.label_resolver?.threshold && (
              <LabelToIdThreshold threshold={threshold} />
            )}
            <fieldset className="labels">
              <legend className="label">Select label types</legend>
              <div className="labels__wrapper">
                {dataset.label_resolver.dictionaries?.map((v: any) => (
                  <Fragment key={v.label}>
                    <input
                      type="checkbox"
                      id={v.label}
                      value={v.dictionary}
                      className="checkbox"
                      checked={selectDictionaryList[v.dictionary]}
                      onChange={(e) => {
                        setSelectDictionaryList({
                          ...selectDictionaryList,
                          [v.dictionary]: e.target.checked,
                        });
                      }}
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
      {isShowTable.value && (
        <LabelToIdTable
          pubdictionariesParam={pubdictionariesParam}
          dataset={dataset}
        />
      )}
    </div>
  );
};

export default LabelToId;
