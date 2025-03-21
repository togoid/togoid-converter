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
) => {
  const baseTable = useMemo(() => {
    return tableHead[0].format?.length
      ? route.map((v) =>
          v.results.map((w) =>
            tableHead[0].format!.reduce((prev, curr) => {
              return prev.replace(curr.replace("%s", ""), "");
            }, w),
          ),
        )
      : route.map((v) => v.results);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [filterTable, setFilterTable] = useState<{
    heading: typeof tableHead;
    rows: string[][];
  }>();

  useEffect(() => {
    if (baseTable) {
      const arr: string[][] = [];
      baseTable.forEach((v) => {
        v.forEach((w) => {
          arr.push([w]);
        });
      });
      setFilterTable({
        heading: tableHead,
        rows: arr,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseTable]);

  return { filterTable };
};

export default useResultModalSinglePreview;
