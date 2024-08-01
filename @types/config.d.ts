type DatasetConfig = {
  [key: string]: {
    catalog: string;
    category: string;
    description?: string;
    examples: string[];
    format?: string[];
    label: string;
    label_resolver?: any;
    linkTo: any;
    prefix: string;
    regex: string;
  };
};

type RelationConfig = {
  [key: string]: { forward: any; reverse?: any; description?: string }[];
};

type DescriptionConfig = {
  [key: string]: { [key: string]: any };
};
