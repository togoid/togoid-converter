import useSWRImmutable from "swr/immutable";
// import useSWR from "swr";

const useResultModalPreview = (
  previewMode: string,
  isCompact: boolean,
  route: any[],
  ids: any[],
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
  const [filterTable, setFilterTable] =
    useState<ReturnType<typeof editTable>>();

  const { data: baseTable } = useSWRImmutable(
    {
      route: route,
      ids: ids,
      report: previewMode,
      limit: 100,
      compact: isCompact,
    },
    async (key) => {
      const data = await executeQuery(key);

      return data.results;
    },
  );

  useEffect(() => {
    if (baseTable) {
      setFilterTable(
        isCompact ? editCompactTable(baseTable) : editTable(baseTable),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseTable, previewMode]);

  const editTable = (table: NonNullable<typeof baseTable>) => {
    const headList = getHeadList(tableHead, previewMode);

    if (previewMode === "all") {
      // all
      return { heading: headList, rows: table };
    } else if (previewMode === "pair") {
      // origin and targets
      // 重複は消す
      return { heading: headList, rows: table };
    } else if (previewMode === "target") {
      // target
      // 重複は消す
      return {
        heading: headList,
        rows: table.map((v) => [v]) as unknown as string[][],
      };
    } else if (previewMode === "full") {
      // full
      return { heading: headList, rows: table };
    }

    // ここには来ない
    return { heading: [], rows: [[]] };
  };

  const editCompactTable = (table: NonNullable<typeof baseTable>) => {
    const headList = getHeadList(tableHead, previewMode);

    if (previewMode === "all") {
      // all
      return {
        heading: headList,
        rows: table,
      };
    } else if (previewMode === "pair") {
      // origin and targets
      return {
        heading: headList,
        rows: table,
      };
    } else if (previewMode === "target") {
      // target
      // 重複は消す
      return {
        heading: headList,
        rows: table,
      };
    } else if (previewMode === "full") {
      // full
      return {
        heading: headList,
        rows: table,
      };
    }

    // ここには来ない
    return { heading: [], rows: [[]] };
  };

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
