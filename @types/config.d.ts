type DatasetConfig = {
  [key: string]: {
    annotations?: {
      items?: string[];
      label: string;
      variable: string;
    }[];
    catalog: string;
    category: string;
    description?: string;
    examples: string[];
    format?: string[];
    label: string;
    label_resolver?: any;
    linkTo: any;
    prefix: {
      label: string;
      uri: string;
    }[];
    regex: string;
  };
};

type RelationConfig = {
  [key: string]: {
    forward: { id: string; display_label: string };
    reverse?: { id: string; display_label: string };
    description?: string;
  }[];
};

type DescriptionConfig = {
  [key: string]: { [key: string]: any };
};
