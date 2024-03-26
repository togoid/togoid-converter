import useSWRImmutable from "swr/immutable";
import axios from "axios";

type Props = {
  pubdictionariesParam: {
    labels: string;
    dictionaries: string;
    tag?: string;
    threshold?: number;
    verbose: boolean;
  };
  dataset: any;
};

const LabelToIdTable = ({ pubdictionariesParam, dataset }: Props) => {
  const { data: tableData } = useSWRImmutable(
    pubdictionariesParam,
    async (key) => {
      const res = await axios.get<any>(
        "https://pubdictionaries.org/find_ids.json",
        {
          params: key,
        },
      );

      const tableBaseData = res.data[pubdictionariesParam.labels] as any[];

      const preferredDictionary = dataset.label_resolver.dictionaries.find(
        (v: any) => v.preferred,
      )?.dictionary;

      const synonymIdList = tableBaseData
        .filter((v: any) => v.dictionary !== preferredDictionary)
        .map((v) => v.identifier);

      if (synonymIdList.length) {
        const res2 = await axios.get<any>(
          "https://pubdictionaries.org/find_terms.json",
          {
            params: {
              ids: synonymIdList.join("|"),
              dictionaries: preferredDictionary,
            },
          },
        );

        tableBaseData.forEach((v) => {
          if (res2.data[v.identifier] && v.dictionary !== preferredDictionary) {
            v.symbol = res2.data[v.identifier][0].label;
          }
        });
      }

      return tableBaseData;
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
                <th>{v.symbol}</th>
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
