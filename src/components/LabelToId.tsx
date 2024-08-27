import Select from "react-select";

type Props = {
  executeExamples: (idList: string[], exampleTarget: string) => void;
};

const dataset = signal<DatasetConfig[number] & { key: string }>();
const species = signal<string>();
const threshold = signal(0.5);
const selectDictionaryList = signal<{ [key: string]: boolean }>({});
const isShowTable = signal(false);
const pubdictionariesParam = signal({
  labels: "",
  dictionaries: "",
  tags: undefined as string | undefined,
  threshold: undefined as number | undefined,
  verbose: true,
});

const LabelToId = ({ executeExamples }: Props) => {
  useSignals();

  const { datasetConfig } = useConfig();

  const text = useAtomValue(textAtom);

  const handleSelectDropDown = (
    value: DatasetConfig[number] & { key: string },
  ) => {
    isShowTable.value = false;
    species.value = undefined;
    threshold.value = 0.5;
    dataset.value = value;

    selectDictionaryList.value = value.label_resolver.dictionaries.reduce(
      (prev: any, curr: any) => {
        return { ...prev, [curr.dictionary]: true };
      },
      {},
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
      .map((v) => v.trim())
      .join("|");

    // exanple: ovarian cancer
    pubdictionariesParam.value = {
      labels: labels,
      dictionaries: Object.entries(selectDictionaryList.value)
        .filter(([_, value]) => value)
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
            <fieldset className="labels">
              <legend className="label">Select label types</legend>
              <div className="labels__wrapper">
                {dataset.value.label_resolver.dictionaries?.map((v: any) => (
                  <Fragment key={v.label}>
                    <input
                      type="checkbox"
                      id={v.label}
                      value={v.dictionary}
                      className="checkbox"
                      checked={selectDictionaryList.value[v.dictionary]}
                      onChange={(e) => {
                        selectDictionaryList.value = {
                          ...selectDictionaryList.value,
                          [v.dictionary]: e.target.checked,
                        };
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
          dataset={dataset as Signal<NonNullable<typeof dataset.value>>}
          executeExamples={executeExamples}
        />
      )}
    </div>
  );
};

export default LabelToId;
