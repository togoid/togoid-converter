type TableHead = {
  index: number;
  name: string;
  lineMode: {
    key: "id" | "url";
    value: string;
  };
  annotateList: {
    index: number;
    checked: boolean;
    label: string;
    variable: string;
    isList: boolean;
    isCompact: boolean;
    items?: {
      checked: boolean;
      label: string;
    }[];
  }[];
} & DatasetConfig[number];
