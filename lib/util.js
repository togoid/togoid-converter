import PaPa from "papaparse";
import { saveAs } from "file-saver";

export const exportCSV = (rows) => {
  const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
  const blob = new Blob([bom, PaPa.unparse(rows)], { type: "text/csv" });
  saveAs(blob, "result.csv");
};
