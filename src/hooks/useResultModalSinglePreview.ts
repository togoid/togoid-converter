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
  const filterTable = useMemo(() => {
    return {
      heading: tableHead,
      rows: tableHead[0].format?.length
        ? route[0].results.map((v) => [
            tableHead[0].format!.reduce((prev, curr) => {
              return prev.replace(curr.replace("%s", ""), "");
            }, v),
          ])
        : route[0].results.map((v) => [v]),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { filterTable };
};

export default useResultModalSinglePreview;
