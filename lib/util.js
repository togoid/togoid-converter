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

export const executeQuery = async (route, ids, report, limit) => {
  route = route.map((v) => v.name).join(",");
  ids = ids.join(",");
  const formData = new FormData();
  formData.append("route", route);
  formData.append("ids", ids);
  formData.append("report", report);
  formData.append("limit", limit);
  formData.append("format", "json");
  return await axios({
    method: "post",
    url: `${process.env.NEXT_PUBLIC_API_ENDOPOINT}/convert`,
    data: formData,
    headers: { "Content-Type": "multipart/form-data" },
  }).then((d) => d.data);
};

export const executeCountQuery = async (path, ids) => {
  const formData = new FormData();
  formData.append("ids", ids);
  return await axios({
    method: "post",
    url: `${process.env.NEXT_PUBLIC_API_ENDOPOINT}/count/${path}`,
    data: formData,
    headers: { "Content-Type": "multipart/form-data" },
  }).then((d) => d.data);
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
