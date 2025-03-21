const useResultModalSinglePreview = (
  route: Route[],
  tableHead: (DatasetConfig[number] & {
    index: number;
    name: string;
  })[],
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
