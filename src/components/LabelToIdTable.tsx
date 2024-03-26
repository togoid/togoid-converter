import useSWRImmutable from "swr/immutable";
import axios from "axios";

type Props = {
  pubdictionariesParam: {
    labels: string;
    dictionaries: string;
    threshold?: number;
    verbose: boolean;
  };
  dataset: any;
};

const LabelToIdTable = ({ pubdictionariesParam, dataset }: Props) => {
  const { data: tableData } = useSWRImmutable(
    pubdictionariesParam,
    async (key) => {
      const res = await axios.get("https://pubdictionaries.org/find_ids.json", {
        params: key,
      });

      return res.data[pubdictionariesParam.labels] as any[];
    },
  );

  return (
    <div>
      {tableData && (
        <table>
          <thead>
            <tr>
              <th>Input</th>
              <th>Match type</th>
              <th>Symbol</th>
              <th>Score</th>
              <th>ID</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((v, i) => (
              <tr key={i}>
                <th>{v.label}</th>
                <th>
                  {
                    dataset.label_resolver.dictionaries.find(
                      (w: any) => w.dictionary === v.dictionary,
                    )?.label
                  }
                </th>
                <th></th>
                <th>{v.score}</th>
                <th>{v.identifier}</th>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default LabelToIdTable;
