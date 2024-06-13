import useSWRImmutable from "swr/immutable";
import axios from "axios";
import Select from "react-select";

const LabelToId = () => {
  useSignals();

  const { datasetConfig } = useConfig();

  const [dataset, setDataset] = useState();
  const species = useSignal<string | undefined>(undefined);
  const threshold = useSignal<number>(0.5);
  const [selectDictionaryList, setSelectDictionaryList] = useState<
    (string | false)[]
  >([]);
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
      threshold: dataset?.label_resolver?.threshold
        ? threshold.value
        : undefined,
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
              <LabelToIdThreshold threshold={threshold} />
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
