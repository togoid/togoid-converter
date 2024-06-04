import PaPa from "papaparse";
import { saveAs } from "file-saver";
import axios from "axios";

import type { Arrow, HeadStyleAlias } from "react-arrow-master";

export const exportCsvTsv = (
  rows: unknown[],
  extension: "csv" | "tsv",
  outputName: string,
) => {
  const blob = new Blob([invokeUnparse(rows, extension)], {
    type: `text/${extension}`,
  });
  saveAs(blob, outputName);
};

export const invokeUnparse = (rows: unknown[], extension: "csv" | "tsv") => {
  const delimiterList = {
    csv: ",",
    tsv: "\t",
  };
  return PaPa.unparse(rows, { delimiter: delimiterList[extension] });
};

export const executeQuery = async (baseParams: {
  route: Route[];
  ids: string[];
  report: string;
  limit?: number;
  compact?: boolean;
}) => {
  const params = new URLSearchParams({
    // route: baseParams.route
    //   .map((v, i) =>
    //     i === 0 ? v.name : `,${v.relation?.link.label},${v.name}`,
    //   )
    //   .join(","),
    route: baseParams.route.map((v) => v.name).join(","),
    ids: baseParams.ids.join(","),
    report: baseParams.report,
    format: "json",
  });
  if (baseParams.limit) {
    params.set("limit", String(baseParams.limit));
  }
  if (baseParams.compact) {
    params.set("compact", "1");
  }

  return await axios
    .post(`${process.env.NEXT_PUBLIC_API_ENDOPOINT}/convert`, params)
    .then((d) => d.data);
};

export const executeCountQuery = async (option: {
  relation: string;
  ids: string[];
  link: string;
}) => {
  return await axios
    .post(
      `${process.env.NEXT_PUBLIC_API_ENDOPOINT}/count/${option.relation}`,
      new URLSearchParams({
        ids: option.ids.join(","),
        link: option.link,
      }),
    )
    .then((d) => d.data);
};

export const mergePathStyle = (
  fromId: string,
  toId: string,
  isRoute: boolean,
) => {
  const toLabelId = toId.replace(/^to/, "label");
  const toLabelPath = getPathStyle(fromId, toLabelId, isRoute, "none");
  const fromLabelPath = getPathStyle(toLabelId, toId, isRoute, "default");
  return [toLabelPath, fromLabelPath];
};

export const getPathStyle = (
  fromId: string,
  toId: string,
  isRoute: boolean,
  head: HeadStyleAlias,
): Arrow => {
  const style = isRoute
    ? ({
        color: "#1A8091",
        head: head,
        arrow: "smooth",
        width: 2,
      } as const)
    : ({
        color: "#dddddd",
        head: head,
        arrow: "smooth",
        width: 1.5,
      } as const);
  return {
    from: {
      id: fromId,
      posX: "right",
      posY: "middle",
    },
    to: {
      id: toId,
      posX: "left",
      posY: "middle",
    },
    style: style,
  };
};
