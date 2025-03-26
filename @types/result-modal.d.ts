type TableHead = {
  index: number;
  name: string;
  lineMode: {
    key: "id" | "url";
    value: string;
  };
  annotateList: {
    checked: boolean;
    label: string;
    variable: string;
  }[];
} & DatasetConfig[number];
