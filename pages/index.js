import Head from "next/head";
import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Explore from "../components/Explore";
import Databases from "../components/Databases";
import IdInput from "../components/IdInput";
import dbConfig from "../public/config.json";
import dbCatalogue from "../public/dataset.json";

const Home = () => {
  const [ids, setIds] = useState([]);
  const [activeTab, setActiveTab] = useState("EXPLORE");
  const [databaseNodes, setDatabaseNodes] = useState([]);
  const [route, setRoute] = useState([]);

  useEffect(() => {
    if (route.length > 0) {
      const nodes = databaseNodes.slice(0, route.length);
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
                count: 1,
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
                count: 1,
                ids: [],
              });
            }
          }
        }
      });
      // 先端の変換候補を追加
      nodes[route.length] = candidates;
      setDatabaseNodes(nodes);
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
        if (id.match(dbCatalogue[k].regex)) {
          const index = candidates.findIndex(
            (databases) => databases.name === k
          );
          if (index === -1) {
            candidates.push({
              name: k,
              count: 1,
              ids: [id],
            });
          } else {
            candidates[index].count += 1;
            candidates[index].ids.push(id);
          }
        }
      });
    });
    if (candidates.length > 0) {
      candidates.sort((a, b) => {
        if (a.count < b.count) return 1;
        if (a.count > b.count) return -1;
        return 0;
      });
      const databases = candidates.map((v) => {
        v.ids = v.ids.map((id) => ({ to: id }));
        return v;
      });
      setDatabaseNodes([databases]);
      setRoute([]);
    }
  };

  const clearExplore = () => {
    setDatabaseNodes([]);
    setRoute([]);
  };

  const restartExplore = () => {
    setDatabaseNodes(databaseNodes.slice(0, 1));
    setRoute(route.slice(0, 1));
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
              databaseNodes={databaseNodes}
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
