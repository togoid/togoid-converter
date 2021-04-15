import axios from "axios";

export const idPatterns = {
  // 'ncbigene': {
  //   label: "NCBI Gene",
  //   regexp: "^\\d+$",
  // },
  // 'RefSeq(未)': {
  //   label: "RefSeq",
  //   regexp: "^(((AC|AP|NC|NG|NM|NP|NR|NT|NW|XM|XP|XR|YP|ZP)_\d+)|(NZ\_[A-Z]{2,4}\d+))(\.\d+)?$"
  // },
  "ensembl.gene": {
    label: "Ensembl (ENSG)",
    regexp:
      "^((ENSG\\d{11}(\\.\\d+)?)|(FB\\w{2}\\d{7})|(Y[A-Z]{2}\\d{3}[a-zA-Z](\\-[A-Z])?)|([A-Z_a-z0-9]+(\\.)?(t)?(\\d+)?([a-z])?))$",
  },
  "ensembl.transcript": {
    label: "Ensembl (ENST)",
    regexp:
      "^((ENST\\d{11}(\\.\\d+)?)|(FB\\w{2}\\d{7})|(Y[A-Z]{2}\\d{3}[a-zA-Z](\\-[A-Z])?)|([A-Z_a-z0-9]+(\\.)?(t)?(\\d+)?([a-z])?))$",
  },
  "kegg.genes": {
    label: "KEGG Genes",
    regexp: "^w+:[wd.-]*$",
  },
  hgnc: {
    label: "HGNC",
    regexp: "^((HGNC|hgnc):)?\\d{1,5}$",
  },
  // 'Gene Ontology(未)': {
  //   label: "Gene Ontology",
  //   regexp: "^GO:\d{7}$"
  // },
  // 'TogoVar(未)': {
  //   label: "TogoVar",
  //   regexp: "^tgv\d+$"
  // },
  dbsnp: {
    label: "dbSNP",
    regexp: "^rsd+$",
  },
  // 'dbVar(未)': {
  //   label: "dbVar",
  //   regexp: "^nstd\d+$"
  // },
  // 'gnomAD(未)': {
  //   label: "gnomAD",
  //   regexp: "^(\d+|X|Y)-\d+-[ATGC]+-[ATGC]+$"
  // },
  clinvar: {
    label: "\tClinVar Variant",
    regexp: "^d+$",
  },
  uniprot: {
    label: "UniProt Knowledgebase",
    regexp:
      "^([A-N,R-Z][0-9]([A-Z][A-Z, 0-9][A-Z, 0-9][0-9]){1,2})|([O,P,Q][0-9][A-Z, 0-9][A-Z, 0-9][A-Z, 0-9][0-9])(.d+)?$",
  },
  "ensembl.protein": {
    label: "Ensembl (ENSP)",
    regexp:
      "^((ENSP\\d{11}(\\.\\d+)?)|(FB\\w{2}\\d{7})|(Y[A-Z]{2}\\d{3}[a-zA-Z](\\-[A-Z])?)|([A-Z_a-z0-9]+(\\.)?(t)?(\\d+)?([a-z])?))$",
  },
  ncbiprotein: {
    label: "NCBI Protein",
    regexp: "^(w+d+(.d+)?)|(NP_d+)$",
  },
  pdb: {
    label: "Protein Data Bank",
    regexp: "^[0-9][A-Za-z0-9]{3}$",
  },
  interpro: {
    label: "InterPro",
    regexp: "^IPRd{6}$",
  },
  pfam: {
    label: "Pfam",
    regexp: "^PFd{5}$",
  },
  intact: {
    label: "IntAct",
    regexp: "^EBI-[0-9]+$",
    // },
    // 'HINT(未)': {
    //   label: "HINT",
    //   regexp: "^([A-N,R-Z][0-9]([A-Z][A-Z, 0-9][A-Z, 0-9][0-9]){1,2})|([O,P,Q][0-9][A-Z, 0-9][A-Z, 0-9][A-Z, 0-9][0-9])(\.\d+)?\-([A-N,R-Z][0-9]([A-Z][A-Z, 0-9][A-Z, 0-9][0-9]){1,2})|([O,P,Q][0-9][A-Z, 0-9][A-Z, 0-9][A-Z, 0-9][0-9])(\.\d+)?$"
    // },
    // 'Instruct(未)': {
    //   label: "Instruct",
    //   regexp: "^([A-N,R-Z][0-9]([A-Z][A-Z, 0-9][A-Z, 0-9][0-9]){1,2})|([O,P,Q][0-9][A-Z, 0-9][A-Z, 0-9][A-Z, 0-9][0-9])(\.\d+)?\-([A-N,R-Z][0-9]([A-Z][A-Z, 0-9][A-Z, 0-9][0-9]){1,2})|([O,P,Q][0-9][A-Z, 0-9][A-Z, 0-9][A-Z, 0-9][0-9])(\.\d+)?$"
  },
};

export const q = async (ids, route) =>
  axios
    .get(
      `${process.env.NEXT_PUBLIC_SPARQL_ENDOPOINT}/convert?ids=${ids.join(
        ","
      )}&routes=${route.join(",")}`
    )
    .then((d) => d.data)
    .catch((e) => console.log(e));
