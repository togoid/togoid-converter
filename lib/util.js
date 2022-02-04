import PaPa from "papaparse";
import { saveAs } from "file-saver";
import axios from "axios";

export const exportCSV = (rows) => {
  const blob = new Blob([PaPa.unparse(rows)], { type: "text/csv" });
  saveAs(blob, "result.csv");
};

export const executeQuery = async (
  route,
  ids,
  include,
  limit,
  total,
  converted
) => {
  route = route.map((v) => v.name).join(",");
  ids = ids.join(",");
  const formData = new FormData();
  formData.append("route", route);
  formData.append("ids", ids);
  formData.append("include", include);
  formData.append("limit", limit);
  formData.append("total", total);
  formData.append("converted", converted);
  formData.append("format", "json");
  return await axios({
    method: "post",
    url: `${process.env.NEXT_PUBLIC_API_ENDOPOINT}/convert`,
    data: formData,
    headers: { "Content-Type": "multipart/form-data" },
  }).then((d) => d.data);
};

export const mergePathStyle = (fromId, toId, isRoute) => {
  // todo refactoring
  const toLabelId = toId.replace(/^to/, "label");
  const toLabelPath = getPathStyle(fromId, toLabelId, isRoute);
  const fromLabelPath = getPathStyle(toLabelId, toId, isRoute);
  return [toLabelPath, fromLabelPath];
};

export const getPathStyle = (fromId, toId, isRoute) => {
  const style = isRoute
    ? {
        color: "#1A8091",
        head: "none",
        arrow: "smooth",
        width: 2,
      }
    : {
        color: "#dddddd",
        head: "none",
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
