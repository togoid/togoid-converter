type Props = {
  data: any[];
  tableHeadList: TableHead[];
  resultList: any[];
};

const ResultModalActionTableRow = ({
  data,
  tableHeadList,
  resultList,
}: Props) => {
  const flattened = useMemo(
    () =>
      tableHeadList.flatMap((th, idx) => {
        const base = data[idx];
        const annotated = th.annotateList
          .filter((a) => a.checked)
          .map((a) => {
            const lbl = resultList[th.index].data?.[base]?.[a.variable];

            if (Array.isArray(lbl)) {
              if (a.isCompact) {
                return lbl.join("\n");
              } else if (a.items?.some((x) => x.checked)) {
                const checkedItems = a.items
                  .filter((x) => x.checked)
                  .map((x) => x.label);
                return lbl.filter((v) => checkedItems.includes(v));
              }
            }
            return lbl;
          });
        return [base, ...annotated];
      }),
    [data, tableHeadList, resultList],
  );

  const array2 = useMemo(() => cartesianProduct(flattened), [flattened]);

  function cartesianProduct<T extends string>(
    args: (T | T[] | undefined)[],
  ): (T | undefined)[][] {
    return args.reduce<(T | undefined)[][]>(
      (acc, curr) => {
        let items: (T | undefined)[];
        if (Array.isArray(curr)) {
          // 空配列なら undefined 一要素に、そうでなければ中身をそのまま
          items = curr.length === 0 ? [undefined] : curr;
        } else {
          // string または undefined
          items = [curr];
        }
        return acc.flatMap((prev) => items.map((item) => [...prev, item]));
      },
      // 初期値：空の組み合わせを１つ
      [[]],
    );
  }

  const columnGroups = useMemo(
    () =>
      tableHeadList.map((th) => {
        const checkedCount = th.annotateList.filter((a) => a.checked).length;
        const totalCells = 1 + checkedCount;
        const hrefMode =
          th.lineMode.key === "url"
            ? th.lineMode
            : { key: "url" as const, value: th.prefix[0].uri };
        return { totalCells, lineMode: th.lineMode, hrefMode };
      }),
    [tableHeadList],
  );

  return (
    <>
      {array2.map((rowValues, rowIndex) => {
        let cursor = 0;
        return (
          <tr key={rowIndex}>
            {columnGroups.map(({ totalCells, lineMode, hrefMode }, colIdx) => {
              const slice = rowValues.slice(cursor, cursor + totalCells);
              cursor += totalCells;

              const [value, ...annotations] = slice as (string | undefined)[];
              return (
                <Fragment key={colIdx}>
                  {/* リンクセル */}
                  <td>
                    <a
                      href={joinPrefix(value!, hrefMode)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {joinPrefix(value!, lineMode)}
                    </a>
                  </td>
                  {/* 注釈セル */}
                  {annotations.map((txt, annIdx) => (
                    <td key={annIdx}>
                      <span style={{ whiteSpace: "pre-line" }}>{txt}</span>
                    </td>
                  ))}
                </Fragment>
              );
            })}
          </tr>
        );
      })}
    </>
  );
};

export default ResultModalActionTableRow;
