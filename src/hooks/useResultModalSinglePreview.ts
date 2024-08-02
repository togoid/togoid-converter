import useSWRImmutable from "swr/immutable";
// import useSWR from "swr";

const useResultModalSinglePreview = (
  route: Route[],
  tableHead: {
    index: number;
    name: string;
    catalog: string;
    category: string;
    description?: string;
    examples: string[];
    format?: string[];
    label: string;
    label_resolver?: any;
    linkTo: any;
    prefix: string;
    regex: string;
  }[],
  isShowLabelList: boolean[],
  lineMode: string[],
) => {
  const baseTable = useMemo(() => route.map((v) => v.results), []);

  const { data: labelList } = useSWRImmutable(
    {
      baseTable: baseTable,
      isShowLabelSome: isShowLabelList.some((v) => v),
    },
    async () => {
      if (!(baseTable && isShowLabelList.some((v) => v))) {
        return null;
      }

      return await Promise.all(
        baseTable.map(async (v, i) => {
          if (!isShowLabelList[i]) {
            return null;
          }
          const data = await executeAnnotateQuery({
            name: tableHead[i].name,
            ids: v,
          });
          return Object.values(data.data)[0];
        }),
      );
    },
  );

  const [filterTable, setFilterTable] = useState<{
    head: typeof tableHead;
    row: string[][];
  }>();

  useEffect(() => {
    if (baseTable) {
      setFilterTable({ head: tableHead, row: baseTable });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseTable, labelList, isShowLabelList, lineMode]);

  return { filterTable, labelList };
};

export default useResultModalSinglePreview;
