import Head from "next/head";
import React, { useState, useEffect } from "react";
import NProgress from "nprogress";
import axios from "axios";
import Header from "../components/Header";
import Explore from "../components/Explore";
import Databases from "../components/Databases";
import IdInput from "../components/IdInput";
import Documents from "../components/Documents";
import { executeQuery } from "../lib/util";

const Home = () => {
  const [ids, setIds] = useState([]);
  const [activeTab, setActiveTab] = useState("EXPLORE");
  const [databaseNodesList, setDatabaseNodesList] = useState([]);
  const [route, setRoute] = useState([]);
  const [previousRoute, setPreviousRoute] = useState([]);
  const [isUseKeepRoute, setIsUseKeepRoute] = useState(false);
  const [candidatePaths, setCandidatePaths] = useState([]);
  const [idTexts, setIdTexts] = useState("");
  const [dbCatalogue, setDbCatalogue] = useState([]);
  const [dbConfig, setDbConfig] = useState([]);
  const [dbDesc, setDbDesc] = useState([]);

  useEffect(() => {
    const fetchApi = async () => {
      const promises = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_ENDOPOINT}/config/dataset`),
        axios.get(`${process.env.NEXT_PUBLIC_API_ENDOPOINT}/config/database`),
        axios.get(
          `${process.env.NEXT_PUBLIC_API_ENDOPOINT}/config/descriptions`
        ),
      ]);
      setDbCatalogue(promises[0].data);
      setDbConfig(promises[1].data);
      setDbDesc(promises[2].data);
    };
    fetchApi();
  }, []);

  useEffect(() => {
    if (route.length > 0) {
      const convertFunc = async () => {
        const abortController = new AbortController();
        if (isUseKeepRoute) {
          const r = route;
          for (let i = 0; i < previousRoute.length; i++) {
            await createNodesList(r);
            if (i < previousRoute.length - 1) {
              const v = databaseNodesList[i + 1].find(
                (element) => element.name === previousRoute[i + 1].name
              );
              if (v === -1 || v.total === 0) {
                break;
              }
              r.push(previousRoute[i + 1]);
            }
          }
          setRoute(r);
          setIsUseKeepRoute(false);
        } else {
          await createNodesList(route);
        }

        return () => {
          abortController.abort();
        };
      };

      convertFunc();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route]);

  useEffect(() => {
    if (idTexts === "") {
      clearExplore();
    }
  }, [idTexts]);

  const createNodesList = async (routeTemp) => {
    const nodesList = isUseKeepRoute
      ? databaseNodesList
      : databaseNodesList.slice(0, routeTemp.length);
    const r = routeTemp[routeTemp.length - 1];
    const candidates = [];
    Object.keys(dbConfig).forEach((k) => {
      if (!candidates.find((v) => v.name === r.name)) {
        if (k.split("-").shift() === r.name) {
          const name = k.split("-")[1];
          if (
            !candidates.find((v) => v.name === name) &&
            !routeTemp.find((w) => w.name === name)
          ) {
            // 順方向の変換
            candidates.push({
              name,
              category: dbCatalogue[name].category,
              total: 1,
              ids: [],
            });
          }
        } else if (dbConfig[k].link.reverse && k.split("-").pop() === r.name) {
          // ↑configに逆変換が許可されていれば、逆方向の変換を候補に含める
          const name = k.split("-")[0];
          if (
            !candidates.find((v) => v.name === name) &&
            !routeTemp.find((w) => w.name === name)
          ) {
            // 逆方向の変換
            candidates.push({
              name,
              category: dbCatalogue[name].category,
              total: 1,
              ids: [],
            });
          }
        }
      }
    });
    NProgress.start();
    const promises = candidates.map((v) => {
      const r = routeTemp.slice();
      r.push(v);
      return new Promise(function (resolve) {
        // エラーになった変換でもnullを返してresolve
        return executeQuery(r, ids, "target", "only")
          .then((v) => {
            NProgress.inc(1 / candidates.length);
            resolve(v);
          })
          .catch(() => resolve(null));
      });
    });

    await Promise.all(promises).then((values) => {
      NProgress.done();
      // 先端の変換候補を追加
      nodesList[routeTemp.length] = candidates.map((v, i) => {
        const _v = Object.assign({}, v);
        if (!values[i]) {
          _v.total = -1;
        } else if (values[i].total) {
          _v.total = values[i].total;
        } else {
          _v.total = 0;
        }

        return _v;
      });
      setDatabaseNodesList(nodesList);

      const candidatePaths = [];
      nodesList.forEach((nodes, i) => {
        if (i === 0) return;
        nodes.forEach((v) => {
          if (route[i] && route[i].name === v.name) {
            candidatePaths.push({
              from: {
                id: `total${i - 1}-${route[i - 1].name}`,
                posX: "right",
                posY: "middle",
              },
              to: {
                id: `node${i}-${v.name}`,
                posX: "left",
                posY: "middle",
              },
              style: {
                color: "#1A8091",
                head: "none",
                arrow: "smooth",
                width: 2,
              },
            });
          } else {
            candidatePaths.push({
              from: {
                id: `total${i - 1}-${route[i - 1].name}`,
                posX: "right",
                posY: "middle",
              },
              to: {
                id: `node${i}-${v.name}`,
                posX: "left",
                posY: "middle",
              },
              style: {
                color: "#dddddd",
                head: "none",
                arrow: "smooth",
                width: 1.5,
              },
            });
          }
        });
      });
      setCandidatePaths(candidatePaths);

    });
  };

  /**
   * idsに入力されたIDまたはIDリストをidPatternsから正規表現で検索
   */
  const searchDatabase = (ids) => {
    const candidates = [];
    ids.forEach((id) => {
      Object.keys(dbCatalogue).forEach((k) => {
        if (
          dbCatalogue[k].regex &&
          id.match(dbCatalogue[k].regex) &&
          Object.keys(dbConfig).find((d) => {
            return d.split("-").shift() === k || d.split("-").pop() === k;
          })
        ) {
          const index = candidates.findIndex(
            (databases) => databases.name === k
          );
          if (index === -1) {
            candidates.push({
              name: k,
              category: dbCatalogue[k].category,
              total: 1,
              ids: [id],
            });
          } else {
            candidates[index].total += 1;
            candidates[index].ids.push(id);
          }
        }
      });
    });
    if (candidates.length > 0) {
      const databases = candidates.map((v) => {
        v.ids = v.ids.map((id) => ({ to: id }));
        return v;
      });
      setDatabaseNodesList([databases]);
      setRoute([]);
      return databases;
    }
  };

  const clearExplore = () => {
    setDatabaseNodesList([]);
    setRoute([]);
  };

  const restartExplore = () => {
    setDatabaseNodesList(databaseNodesList.slice(0, 1));
    setRoute([]);
  };

  const handleIdTextsSubmit = (t) => {
    const ids = t
      .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) =>
        String.fromCharCode(s.charCodeAt(0) - 0xfee0)
      )
      .split(/[\s,\n,、,,]+/)
      .map((v) => v.trim());
    clearExplore();
    setIds(ids);
    return searchDatabase(ids);
  };

  const handleTopExamples = (key) => {
    const examples = {
      refseq_rna: [
        "NM_001354870",
        "NM_002467",
        "NM_001173531",
        "NM_001285986",
        "NM_001285987",
        "NM_002701",
        "NM_203289",
        "NM_003106",
        "NM_001314052",
        "NM_004235",
      ],
      ensembl_gene: [
        "ENSG00000136997",
        "ENSG00000204531",
        "ENSG00000181449",
        "ENSG00000136826",
      ],
      uniprot: [
        "P01106",
        "Q01860",
        "M1S623",
        "D2IYK3",
        "F2Z381",
        "P48431",
        "A0A0U3FYV6",
        "O43474",
      ],
    };
    executeExamples(examples[key].join("\n"), key);
  };
  const executeExamples = (idTexts, key) => {
    setActiveTab("EXPLORE");
    setIdTexts(idTexts);
    const startRoute = handleIdTextsSubmit(idTexts).find(
      (ele) => ele.name === key
    );
    setRoute([startRoute]);
  };

  const tryKeepRoute = (idTexts) => {
    const checkIndex = handleIdTextsSubmit(idTexts).findIndex(
      (element) => element.name === previousRoute[0].name
    );
    if (checkIndex !== -1) {
      setRoute([previousRoute[0]]);
      setIsUseKeepRoute(true);
    }
  };

  return (
    <div className="home">
      <Head>
        <title>TogoID</title>
        <link rel="icon" href="/favicon.ico" />
        <meta
          property="og:image"
          content="https://togoid.dbcls.jp/images/ogp.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="57x57"
          href="/apple-icon-57x57.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="60x60"
          href="/apple-icon-60x60.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="72x72"
          href="/apple-icon-72x72.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="76x76"
          href="/apple-icon-76x76.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="114x114"
          href="/apple-icon-114x114.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="120x120"
          href="/apple-icon-120x120.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="144x144"
          href="/apple-icon-144x144.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="152x152"
          href="/apple-icon-152x152.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-icon-180x180.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/android-icon-192x192.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="96x96"
          href="/favicon-96x96.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="msapplication-TileImage" content="/ms-icon-144x144.png" />
        <meta name="theme-color" content="#ffffff" />
        <script
          type="text/javascript"
          src="https://dbcls.rois.ac.jp/DBCLS-common-header-footer/v2/script/common-header-and-footer.js"
          id="common-header-and-footer__script"
          data-show-footer="true"
          data-show-footer-license="true"
          data-show-footer-links="true"
          data-width="auto"
          data-color="mono"
          data-license-type="none"
        ></script>
      </Head>
      <Header />
      <main className="main">
        <IdInput
          handleSubmit={handleIdTextsSubmit}
          setIdTexts={setIdTexts}
          idTexts={idTexts}
          handleTopExamples={handleTopExamples}
          route={route}
          setPreviousRoute={setPreviousRoute}
          dbCatalogue={dbCatalogue}
          tryKeepRoute={tryKeepRoute}
        />
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
              DATABASES
            </button>
            <button
              onClick={() => setActiveTab("DOCUMENTS")}
              className={
                activeTab === "DOCUMENTS" ? "button_tab active" : "button_tab"
              }
            >
              DOCUMENTS
            </button>
          </div>
          {activeTab === "EXPLORE" && (
            <Explore
              databaseNodesList={databaseNodesList}
              candidatePaths={candidatePaths}
              route={route}
              setRoute={setRoute}
              restartExplore={restartExplore}
              ids={ids}
              dbCatalogue={dbCatalogue}
              dbConfig={dbConfig}
              dbDesc={dbDesc}
            />
          )}
          {activeTab === "DATABASE" && (
            <Databases
              executeExamples={executeExamples}
              dbCatalogue={dbCatalogue}
              dbConfig={dbConfig}
              dbDesc={dbDesc}
            />
          )}
          {activeTab === "DOCUMENTS" && <Documents />}
        </div>
      </main>
    </div>
  );
};

export default Home;
