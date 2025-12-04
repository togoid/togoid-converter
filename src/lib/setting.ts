export const colorLegendList = [
  {
    color: "#53C666",
    categoryList: ["Gene", "Transcript", "Ortholog", "Probe"],
  },
  {
    color: "#A2C653",
    categoryList: ["Protein", "Domain"],
  },
  {
    color: "#C68753",
    categoryList: ["Structure"],
  },
  {
    color: "#C65381",
    categoryList: ["Interaction", "Pathway", "Reaction"],
  },
  {
    color: "#A853C6",
    categoryList: ["Compound", "Drug", "Lipid"],
  },
  {
    color: "#673AA6",
    categoryList: ["Glycan"],
  },
  {
    color: "#5361C6",
    categoryList: ["Phenotype"],
  },
  {
    color: "#53C3C6",
    categoryList: ["Variant", "Genotype"],
  },
  {
    color: "#006400",
    categoryList: ["Anatomy", "CellLine", "Genome", "Proteome", "Organism"],
  },
  {
    color: "#696969",
    categoryList: [
      "Analysis",
      "Experiment",
      "Project",
      "Sample",
      "SequenceRun",
      "Submission",
      "Literature",
      "AnnotationRule",
      "Classification",
      "Function",
    ],
  },
];

export const categoryColor = colorLegendList.reduce(
  (prev, curr) => {
    curr.categoryList.forEach((v) => {
      prev[v] = curr.color;
    });

    return prev;
  },
  {} as { [key: string]: string },
);
