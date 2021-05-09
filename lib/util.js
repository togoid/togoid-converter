import PaPa from "papaparse";
import { saveAs } from "file-saver";
import axios from "axios";

export const exportCSV = (rows) => {
  const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
  const blob = new Blob([bom, PaPa.unparse(rows)], { type: "text/csv" });
  saveAs(blob, "result.csv");
};

export const executeQuery = async (route, ids, include) => {
  if (!include) {
    include = "all";
  }
  route = route.map((v) => v.name).join(",");
  ids = ids.join(",");
  const formData = new FormData();
  formData.append("route", route);
  formData.append("ids", ids);
  formData.append("include", include);
  formData.append("format", "json");
  return await axios({
    method: "post",
    url: `${process.env.NEXT_PUBLIC_SPARQL_ENDOPOINT}/convert`,
    data: formData,
    headers: { "Content-Type": "multipart/form-data" },
  }).then((d) => d.data);
};
