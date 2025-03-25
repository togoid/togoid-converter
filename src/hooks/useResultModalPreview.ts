import useSWRImmutable from "swr/immutable";
// import useSWR from "swr";

const useResultModalPreview = (
  previewMode: string,
  isCompact: boolean,
  route: any[],
  ids: any[],
) => {
  const { data: filterTable, isLoading } = useSWRImmutable(
    {
      route: route,
      ids: ids,
      report: previewMode,
      limit: 100,
      compact: isCompact,
    },
    async (key) => {
      const data = await executeQuery(key);

      if (!isCompact && previewMode === "target") {
        return {
          rows: data.results.map((v) => [v]) as unknown as string[][],
        };
      }

      return {
        rows: data.results,
      };
    },
  );

  return { filterTable, isLoading };
};

export default useResultModalPreview;
