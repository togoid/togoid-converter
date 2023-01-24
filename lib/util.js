// @ts-check
import PaPa from "papaparse";
import { saveAs } from "file-saver";
import axios from "axios";

export const exportCsvTsv = (rows, extension, outputName) => {
  const blob = new Blob([invokeUnparse(rows, extension)], {
    type: `text/${extension}`,
  });
  saveAs(blob, outputName);
};

export const invokeUnparse = (rows, extension) => {
  const delimiterList = {
    csv: ",",
    tsv: "\t",
  };
  return PaPa.unparse(rows, { delimiter: delimiterList[extension] });
};

/**
 * @param {{route: object[], ids: string[], report: string, limit?: number, reduced?: boolean}} baseParams
 */
export const executeQuery = async (baseParams) => {
  const params = new URLSearchParams({
    route: baseParams.route.map((v) => v.name).join(","),
    ids: baseParams.ids.join(","),
    report: baseParams.report,
    format: "json",
  });
  if (baseParams.limit) {
    params.set("limit", String(baseParams.limit));
  }
  if (baseParams.reduced) {
    params.set("reduced", String(Number(baseParams.reduced)));
  }

  return await axios
    .post(`${process.env.NEXT_PUBLIC_API_ENDOPOINT}/convert`, params)
    .then((d) => d.data);
};

export const executeCountQuery = async (path, ids) => {
  return await axios
    .post(
      `${process.env.NEXT_PUBLIC_API_ENDOPOINT}/count/${path}`,
      new URLSearchParams({
        ids: ids,
      })
    )
    .then((d) => d.data);
};

export const mergePathStyle = (fromId, toId, isRoute) => {
  const toLabelId = toId.replace(/^to/, "label");
  const toLabelPath = getPathStyle(fromId, toLabelId, isRoute, "none");
  const fromLabelPath = getPathStyle(toLabelId, toId, isRoute, "default");
  return [toLabelPath, fromLabelPath];
};

export const getPathStyle = (fromId, toId, isRoute, head) => {
  const style = isRoute
    ? {
        color: "#1A8091",
        head: head,
        arrow: "smooth",
        width: 2,
      }
    : {
        color: "#dddddd",
        head: head,
        arrow: "smooth",
        width: 1.5,
      };
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
