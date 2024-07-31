// import useSWRImmutable from "swr/immutable";
import useSWR from "swr";
import axios from "axios";

const useResultModalSinglePreview = (
  route: Route[],
  tableHead: any[],
  isShowLabelList: boolean[],
  lineMode: string[],
) => {
  const { data: baseTable } = useSWR(
    {
      route: route,
    },
    () => {
      return route.map((v) => v.results);
    },
  );

  const [labelList, setLabelList] = useState<any[]>();

  useEffect(() => {
    const func = async () => {
      if (!baseTable) {
        return;
      }

      const res = await Promise.all(
        baseTable.map(async (v, i) => {
          if (!isShowLabelList[i]) {
            return null;
          }
          const response = await axios({
            url: "https://rdfportal.org/grasp-togoid",
            method: "POST",
            data: {
              query: `query {
              ${tableHead[i].name}(id: ${JSON.stringify(v)}) {
                iri
                id
                label
              }
            }`,
            },
          });

          return Object.values(response.data.data)[0];
        }),
      );

      setLabelList(res);
    };

    func();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseTable, isShowLabelList]);

  const [filterTable, setFilterTable] = useState<any>();

  useEffect(() => {
    if (baseTable) {
      setFilterTable(editTable(baseTable));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseTable, labelList, isShowLabelList, lineMode]);

  const editTable = (table: NonNullable<typeof baseTable>) => {
    if (isShowLabelList[0]) {
      const head = tableHead.map((v) => [v, null]);
      const row = table.map((v, i) =>
        v.map((w, j) => {
          return [w, labelList?.[i]?.[j]?.label];
        }),
      );
      return { head: head, row: row };
    } else {
      const head = tableHead.map((v) => [v]);
      const row = table.map((v) =>
        v.map((w) => {
          return [w];
        }),
      );
      return { head: head, row: row };
    }
  };

  return { filterTable };
};

export default useResultModalSinglePreview;
