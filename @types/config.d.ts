type Datasetconfig = {
  [key: string]: { [key: string]: any };
};

type RelationConfig = {
  [key: string]: { forward: any; reverse?: any; description?: string }[];
};

type DescriptionConfig = {
  [key: string]: { [key: string]: any };
};
