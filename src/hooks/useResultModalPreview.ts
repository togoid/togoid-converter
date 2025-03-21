import useSWRImmutable from "swr/immutable";
// import useSWR from "swr";

const useResultModalPreview = (
  previewMode: string,
  isCompact: boolean,
  route: any[],
  ids: any[],
  tableHead: (DatasetConfig[number] & {
    index: number;
    name: string;
  })[],
) => {
  const { data: filterTable } = useSWRImmutable(
    {
      route: route,
      ids: ids,
      report: previewMode,
      limit: 100,
      compact: isCompact,
    },
    async (key) => {
      const data = await executeQuery(key);
      const headList = getHeadList(tableHead, previewMode);

      if (!isCompact && previewMode === "target") {
        return {
          heading: headList,
          rows: data.results.map((v) => [v]) as unknown as string[][],
        };
      }

      return { heading: headList, rows: data.results };
    },
  );

  const getHeadList = (head: typeof tableHead, mode: typeof previewMode) => {
    if (mode === "all" || mode === "full") {
      return head;
    } else if (mode === "pair") {
      return [head[0], head[head.length - 1]];
    } else if (mode === "target") {
      return [head[head.length - 1]];
    }

    return head;
  };

  return { filterTable, getHeadList };
};

export default useResultModalPreview;
