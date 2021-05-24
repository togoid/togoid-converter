import Head from "next/head";
import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
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
                category: dbConfig[k].category,
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
                category: dbConfig[k].category,
                total: 1,
                ids: [],
              });
            }
          }
        }
      });

      const promises = candidates.map((v) => {
        const r = route.slice();
        r.push(v);
        return new Promise(function (resolve) {
          // エラーになった変換でもnullを返してresolve
          return executeQuery(r, ids, "target")
            .then((v) => resolve(v))
            .catch(() => resolve(null));
        });
      });

      Promise.all(promises).then((values) => {
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
              style: { color: "#cccccc", head: "none", arrow: "smooth" },
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

  /**
   * idsに入力されたIDまたはIDリストをidPatternsから正規表現で検索
   */
  const searchDatabase = (ids) => {
    const candidates = [];
    ids.forEach((id) => {
      Object.keys(dbCatalogue).forEach((k) => {
        if (dbCatalogue[k].regex && id.match(dbCatalogue[k].regex)) {
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
      candidates.sort((a, b) => {
        if (a.total < b.total) return 1;
        if (a.total > b.total) return -1;
        return 0;
      });
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

  const handleIdTextsSubmit = (ids) => {
    clearExplore();
    setIds(ids);
    searchDatabase(ids);
  };

  return (
    <div className="home">
      <Head>
        <title>Togo ID</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <main className="main">
        <IdInput handleSubmit={handleIdTextsSubmit} />
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
            <Databases />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
