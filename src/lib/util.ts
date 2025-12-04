import PaPa from "papaparse";
import { saveAs } from "file-saver";
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
  id: string | undefined,
  mode: {
    key: "id" | "url";
    value: string;
  },
  isCompact?: boolean,
) => {
  if (!id) {
    return "";
  }

  if (mode.key === "id") {
    if (!mode.value) {
      return id;
    }
    return isCompact
      ? id
          .split(" ")
          .map((v) => printf(mode.value, v))
          .join(" ")
      : printf(mode.value, id);
  } else if (mode.key === "url") {
    return isCompact
      ? id
          .split(" ")
          .map((v) => mode.value + v)
          .join(" ")
      : mode.value + id;
  }

  return "";
};

export const sscanf = (str: string, format: string) => {
  const formatPatterns = {
    "%s": "(.*?)",
    "%d": "(\\d+)",
    "%f": "([+-]?\\d+(?:\\.\\d+)?)",
    "%u": "(\\d+)",
    "%x": "([0-9a-f]+)",
    "%X": "([0-9A-F]+)",
    "%o": "([0-7]+)",
    "%c": "(.)",
    "%w": "(\\w+)",
    "%a": "([a-zA-Z]+)",
    "%e": "([+-]?\\d+(?:\\.\\d+)?(?:[eE][+-]?\\d+)?)",
  };

  // 特殊文字をエスケープ
  let regexStr = format.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");

  // 一致するフォーマットを1つだけ見つけて置換
  let foundKey = null;
  for (const [key, pattern] of Object.entries(formatPatterns)) {
    if (regexStr.includes(key)) {
      regexStr = regexStr.replace(key, pattern);
      foundKey = key;
      break; // 1つだけの前提なのでbreak
    }
  }

  if (!foundKey) return null;

  const regex = new RegExp("^" + regexStr + "$");
  const match = str.match(regex);
  return match ? match[1] : null;
};
