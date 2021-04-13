import Head from "next/head";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Explore from "../components/Explore";
import Databases from "../components/Databases";

const idPatterns = {
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

const q = async (ids, route) =>
  axios
    .get(
      `${process.env.NEXT_PUBLIC_SPARQL_ENDOPOINT}/convert?ids=${ids.join(
        ","
      )}&routes=${route.join(",")}`
    )
    .then((d) => d.data)
    .catch((e) => console.log(e));

const Home = () => {
  const [activeTab, setActiveTab] = useState("EXPLORE");
  const [inputType, setInputType] = useState(0);
  const [idTexts, setIdTexts] = useState("");
  const [ids, setIds] = useState([]);
  const [databases, setDatabases] = useState([]);
  const [selectedDatabase, setSelectedDatabase] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  /**
   * 選択されたdatabaseがstatusにセットされたら、クエリを実行する
   */
  useEffect(() => {
    if (selectedDatabase.length > 0) {
      const database = databases[currentIndex].find(
        (database) => database.name === selectedDatabase[currentIndex]
      );
      executeQuery(database);
    }
  }, [selectedDatabase]);
  /**
   * idsに入力されたIDまたはIDリストをidPatternsから正規表現で検索
   */
  const matchPattern = () => {
    const ids = idTexts.split(/[\s,\n]+/).map((v) => v.trim());
    setIds(ids);
    const convertResults = [];
    ids.forEach((id) => {
      for (const key in idPatterns) {
        if (id.match(idPatterns[key].regexp)) {
          const index = convertResults.findIndex(
            (databases) => databases.name === key
          );
          if (index === -1) {
            convertResults.push({
              name: key,
              count: 1,
              ids: [id],
              hasMenu: false,
            });
          } else {
            convertResults[index].count += 1;
            convertResults[index].ids.push(id);
          }
        }
      }
    });
    if (convertResults && convertResults.length > 0) {
      convertResults.sort((a, b) => {
        if (a.count < b.count) return 1;
        if (a.count > b.count) return -1;
        return 0;
      });
      const databases = convertResults.map((v) => ({
        name: v.name,
        count: v.count,
        hasMenu: false,
        ids: v.ids.map((id) => ({ to: id })),
      }));
      setDatabases([databases]);
      setSelectedDatabase([databases[0].name]);
    }
  };

  const executeQuery = async (databaseInfo) => {
    // TODO クエリ実行中にloading画面を表示させる
    const newDatabases = JSON.parse(JSON.stringify(databases));
    const d = await q(
      databaseInfo.name,
      databaseInfo.ids.map((v) => v.to)
    );
    if (d) {
      const convertResults = [];
      d.result.forEach((v) => {
        const index = convertResults.findIndex((pref) => pref.name === v.tn);
        if (index === -1) {
          convertResults.push({
            name: v.tn,
            count: 1,
            hasMenu: false,
            ids: [{ from: v.f, to: v.t }],
          });
        } else {
          convertResults[index].count += 1;
          convertResults[index].ids.push({ from: v.f, to: v.t });
        }
      });
      convertResults.sort((a, b) => {
        if (a.count < b.count) return 1;
        if (a.count > b.count) return -1;
        return 0;
      });
      newDatabases.push(convertResults);
      setDatabases(newDatabases);
    }
  };
  /**
   * 表示されているリストをクリアする
   */
  const clearList = () => {
    setDatabases([]);
    setSelectedDatabase([]);
    setCurrentIndex(0);
  };
  /**
   * Executeボタン押下
   * @param event
   */
  const handleSubmit = (event) => {
    event.preventDefault();
    clearList();
    matchPattern();
  };

  return (
    <div className="home">
      <Head>
        <title>Togo ID</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />

      <main className="main">
        <div className="input_area">
          <div className="radio_wrapper">
            <div className="radio">
              <input
                type="radio"
                id="textField"
                name="input_type"
                className="radio__input"
                checked={inputType === 0}
                onChange={() => setInputType(0)}
              />
              <label htmlFor="textField" className="radio__label">
                INPUT from text field
              </label>
            </div>

            <div className="radio">
              <input
                type="radio"
                id="csv"
                name="input_type"
                className="radio__input"
                checked={inputType === 1}
                onChange={() => setInputType(1)}
              />
              <label htmlFor="csv" className="radio__label">
                INPUT from CSV
              </label>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="textarea">
            <textarea
              cols="30"
              rows="10"
              placeholder="Enter IDs"
              className="textarea__input"
              value={idTexts}
              onChange={(e) => setIdTexts(e.target.value)}
            />
            <input type="submit" value="EXECUTE" className="button_large" />
          </form>
        </div>

        <div className="drawing_area">
          <div className="tab_wrapper">
            <button
              onClick={() => setActiveTab("EXPLORE")}
              className={
                activeTab === "EXPLORE" ? "button_tab active" : "button_tab"
              }
            >
              EXPLORE
            </button>
            <button
              onClick={() => setActiveTab("DATABASE")}
              className={
                activeTab === "DATABASE" ? "button_tab active" : "button_tab"
              }
            >
              DATABASE
            </button>
          </div>
          {activeTab === "EXPLORE" ? <Explore /> : <Databases />}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
