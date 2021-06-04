import Head from "next/head";
import React, { useState, useEffect } from "react";
import NProgress from "nprogress";
import Header from "../components/Header";
import Explore from "../components/Explore";
import Databases from "../components/Databases";
import IdInput from "../components/IdInput";
import dbConfig from "../public/config.json";
import dbCatalogue from "../public/dataset.json";
import { executeQuery } from "../lib/util";

const Home = () => {
  const [ids, setIds] = useState([]);
  const [activeTab, setActiveTab] = useState("EXPLORE");
  const [databaseNodesList, setDatabaseNodesList] = useState([]);
  const [route, setRoute] = useState([]);
  const [routePaths, setRoutePaths] = useState([]);
  const [candidatePaths, setCandidatePaths] = useState([]);
  const [idTexts, setIdTexts] = useState("");

  useEffect(() => {
    if (route.length > 0) {
      const abortController = new AbortController();
      const nodesList = databaseNodesList.slice(0, route.length);
      const r = route[route.length - 1];
      const candidates = [];
      let previousDatabaseName = null;
      if (route.length > 1) {
        previousDatabaseName = route[route.length - 2].name;
      }
      Object.keys(dbConfig).forEach((k) => {
        if (!candidates.find((v) => v.name === r.name)) {
          if (k.split("-").shift() === r.name) {
            const name = k.split("-")[1];
            if (
              previousDatabaseName !== name &&
              !candidates.find((v) => v.name === name)
            ) {
              // 順方向の変換、ただし変換経路を逆行させない
              candidates.push({
                name,
                category: dbCatalogue[name].category,
                total: 1,
                ids: [],
              });
            }
          } else if (k.split("-").pop() === r.name) {
            const name = k.split("-")[0];
            if (
              previousDatabaseName !== name &&
              !candidates.find((v) => v.name === name)
            ) {
              // 逆方向の変換、ただし変換経路を逆行させない
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
        const r = route.slice();
        r.push(v);
        return new Promise(function (resolve) {
          // エラーになった変換でもnullを返してresolve
          return executeQuery(r, ids, "target")
            .then((v) => {
              NProgress.inc(1 / candidates.length);
              resolve(v);
            })
            .catch(() => resolve(null));
        });
      });

      Promise.all(promises).then((values) => {
        NProgress.done();
        // 先端の変換候補を追加
        nodesList[route.length] = candidates.map((v, i) => {
          const _v = Object.assign({}, v);
          _v.total = values[i] && values[i].total ? values[i].total : 0;
          return _v;
        });
        setDatabaseNodesList(nodesList);

        const candidatePaths = [];
        nodesList.forEach((nodes, i) => {
          if (i === 0) return;
          nodes.forEach((v) => {
            if (route[i] && route[i].name === v.name) return;
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
              style: { color: "#dddddd", head: "none", arrow: "smooth" },
            });
          });
        });
        setCandidatePaths(candidatePaths);

        const routePaths = [];
        route.forEach((v, i) => {
          if (route[i + 1]) {
            routePaths.push({
              from: {
                id: `total${i}-${v.name}`,
                posX: "right",
                posY: "middle",
              },
              to: {
                id: `node${i + 1}-${route[i + 1].name}`,
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
          }
        });
        setRoutePaths(routePaths);
      });

      return () => {
        abortController.abort();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route]);

  useEffect(() => {
    if (idTexts === "") {
      clearExplore();
    }
  }, [idTexts]);

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
    searchDatabase(ids);
  };

  const exploreExamplesExecute = (examples) => {
    setActiveTab("EXPLORE");
    setIdTexts(examples);
    handleIdTextsSubmit(examples);
  };

  return (
    <div className="home">
      <Head>
        <title>Togo ID</title>
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
          data-year="2019"
        ></script>
      </Head>
      <Header />
      <main className="main">
        <IdInput
          handleSubmit={handleIdTextsSubmit}
          setIdTexts={setIdTexts}
          idTexts={idTexts}
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
          </div>
          {activeTab === "EXPLORE" ? (
            <Explore
              databaseNodesList={databaseNodesList}
              routePaths={routePaths}
              candidatePaths={candidatePaths}
              route={route}
              setRoute={setRoute}
              restartExplore={restartExplore}
              ids={ids}
            />
          ) : (
            <Databases exploreExamplesExecute={exploreExamplesExecute} />
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;
