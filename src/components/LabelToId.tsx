import Select from "react-select";

type Props = {
  executeExamples: (idList: string[], exampleTarget: string) => void;
};

const dataset = signal<DatasetConfig[number] & { key: string }>();
const species = signal<string>();
const threshold = signal(0.5);
const selectDictionaryList = signal<
  [string, { label: string; checked: boolean }][]
>([]);
const isShowTable = signal(false);
const pubdictionariesParam = signal({
  labelList: [] as string[],
  dictionaries: "",
  tags: undefined as string | undefined,
  threshold: undefined as number | undefined,
  verbose: true,
});

const LabelToId = ({ executeExamples }: Props) => {
  useSignals();

  const { datasetConfig } = useConfig();

  const readText = useAtomCallback(
    useCallback((get) => {
      return get(textAtom);
    }, []),
  );

  const handleSelectDropDown = (
    value: DatasetConfig[number] & { key: string },
  ) => {
    isShowTable.value = false;
    species.value = undefined;
    threshold.value = 0.5;
    dataset.value = value;

    if (dataset.value.label_resolver!.sparqlist) {
      selectDictionaryList.value = value.label_resolver!.label_types!.map(
        (v: any) => [v.label_type, { label: v.label, checked: true }],
      );
    } else {
      selectDictionaryList.value = value.label_resolver!.dictionaries!.map(
        (v: any) => [v.dictionary, { label: v.label, checked: true }],
      );
    }
  };

  const handleExecute = () => {
    isShowTable.value = false;

    const labelList = readText()
      .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) =>
        String.fromCharCode(s.charCodeAt(0) - 0xfee0),
      )
      .split(/[\n,、,,]+/)
      .filter((v) => v)
      .map((v) => v.trim());

    // exanple: ovarian cancer
    pubdictionariesParam.value = {
      labelList: labelList,
      dictionaries: selectDictionaryList.value
        .filter(([_, value]) => value.checked)
        .map(([key, _]) => key)
        .join(","),
      tags: dataset.value?.label_resolver?.taxonomy ? species.value : undefined,
      threshold: dataset.value?.label_resolver?.threshold ? threshold.value : 1,
      verbose: true,
    };

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
            options={
              Object.entries(datasetConfig)
                .filter(([_, value]) => "label_resolver" in value)
                .map(([key, value]) => ({
                  value: { ...value, key: key },
                  label: value.label,
                })) as any
            }
            value={dataset.value}
            placeholder="Select a dataset"
            onChange={(e) => handleSelectDropDown((e as any).value)}
          />
        </div>

        {dataset.value && (
          <>
            {dataset.value?.label_resolver?.taxonomy && (
              <LabelToIdSpecies species={species} />
            )}
            {dataset.value?.label_resolver?.threshold && (
              <LabelToIdThreshold threshold={threshold} />
            )}
            <LabelToIdDictionaries />

            <button className="submit" onClick={handleExecute}>
              EXECUTE
            </button>
          </>
        )}
      </div>
      {isShowTable.value && (
        <LabelToIdTable
          pubdictionariesParam={pubdictionariesParam}
          dataset={dataset as Signal<NonNullable<typeof dataset.value>>}
          executeExamples={executeExamples}
        />
      )}
    </div>
  );
};

export default LabelToId;

const LabelToIdDictionaries = () => {
  useSignals();

  return (
    <fieldset className="labels">
      <legend className="label">Select label types</legend>
      <div className="labels__wrapper">
        {selectDictionaryList.value.map(([key, value], i) => (
          <Fragment key={value.label}>
            <input
              type="checkbox"
              id={value.label}
              className="checkbox"
              checked={value.checked}
              onChange={(e) => {
                selectDictionaryList.value = selectDictionaryList.value.with(
                  i,
                  [key, { ...value, checked: e.target.checked }],
                );
              }}
            />
            <label htmlFor={value.label} className="checkbox-label">
              {value.label}
            </label>
          </Fragment>
        ))}
      </div>
    </fieldset>
  );
};
