type DatasetConfig = {
  [key: string]: {
    annotations?: {
      items?: string[];
      label: string;
      numerical?: boolean;
      variable: string;
    }[];
    category: string;
    catalog: string;
    description?: string;
    examples: string[][];
    format?: string[];
    label: string;
    label_resolver?: {
      dictionaries?: {
        dictionary: string;
        label: string;
      }[];
      label_types?: {
        label?: string;
        label_type: string;
        preferred?: boolean;
      }[];
      sparqlist?: string;
      taxonomy?: boolean;
      threshold?: boolean;
    };
    linkTo: any;
    method?: string;
    prefix?: {
      label: string;
      rdf?: boolean;
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
