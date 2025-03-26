const useResultModalSinglePreview = (route: Route[]) => {
  const filterTable = useMemo(() => {
    return {
      rows: route[0].results.map((v) => [v]),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { filterTable };
};

export default useResultModalSinglePreview;
