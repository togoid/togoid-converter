import PaPa from "papaparse";
import { saveAs } from "file-saver";
import axios from "axios";
import { printf } from "fast-printf";

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

export const getConvertUrlSearchParams = (baseParams: {
  route: Route[];
  ids: string[];
  report: string;
  format: "csv" | "json";
  limit?: number;
  compact?: boolean;
}) => {
  const params = new URLSearchParams({
    route: baseParams.route
      .map((v, i) => (i === 0 ? v.name : `${v.relation?.link.label},${v.name}`))
      .join(","),
    ids: baseParams.ids.join(","),
    report: baseParams.report,
    format: baseParams.format,
  });
  if (baseParams.limit) {
    params.set("limit", String(baseParams.limit));
  }
  if (baseParams.compact) {
    params.set("compact", "1");
  }

  return params;
};

export const executeQuery = async (baseParams: {
  route: Route[];
  ids: string[];
  report: string;
  limit?: number;
  compact?: boolean;
}) => {
  return await axios
    .post<{
      ids: string[];
      results: string[][];
      route: string[];
    }>(
      `${process.env.NEXT_PUBLIC_API_ENDOPOINT}/convert`,
      getConvertUrlSearchParams({ ...baseParams, format: "json" }),
    )
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

export const executeAnnotateQuery = async (option: {
  name: string;
  ids: string[];
}) => {
  const res = await axios<{
    data: {
      id: string;
      iri: string;
      label: string;
    }[][];
  }>({
    url: "https://rdfportal.org/grasp-togoid",
    method: "POST",
    data: {
      query: `query {
      ${option.name}(id: ${JSON.stringify([...new Set(option.ids)])}) {
        iri
        id
        label
      }
    }`,
    },
  });

  return Object.values(res.data.data)[0];
};

export const mergePathStyle = (
  fromId: string,
  toId: string,
  isRoute: boolean,
) => {
  const toLabelId = toId.replace(/^to/, "label");
  const toLabelPath = getPathStyle(fromId, toLabelId, {
    head: "none",
    isRoute,
  });
  const fromLabelPath = getPathStyle(toLabelId, toId, {
    head: "default",
    isRoute,
  });
  return [toLabelPath, fromLabelPath];
};

export const getPathStyle = (
  fromId: string,
  toId: string,
  options: {
    head: HeadStyleAlias;
    isResult?: boolean;
    isRoute?: boolean;
  },
): Arrow => {
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
    style: options.isResult
      ? ({
          color: "#1A8091",
          head: options.head,
          arrow: "smooth",
          width: 1.5,
        } as const)
      : options.isRoute
        ? ({
            color: "#1A8091",
            head: options.head,
            arrow: "smooth",
            width: 2,
          } as const)
        : ({
            color: "#dddddd",
            head: options.head,
            arrow: "smooth",
            width: 1.5,
          } as const),
  };
};

export const joinPrefix = (
  id: string,
  mode: string,
  prefix: string,
  isCompact?: boolean,
) => {
  if (mode === "id") {
    return id;
  } else if (mode === "url") {
    return isCompact
      ? id
          .split(" ")
          .map((v) => prefix + v)
          .join(" ")
      : prefix + id;
  } else {
    return isCompact
      ? id
          .split(" ")
          .map((v) => printf(mode, v))
          .join(" ")
      : printf(mode, id);
  }
};
