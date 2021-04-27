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

  useEffect(async () => {
    if (route.length > 0) {
      const nodes = databaseNodes.slice(0, route.length);
      const r = route[route.length - 1];
      const candidates = [];
      Object.keys(dbConfig).forEach((k) => {
        if (k.indexOf(r.name.split("-").pop()) === 0) {
          candidates.push({
            name: k,
            label: k.split("-")[1],
            count: 1,
            ids: [],
          });
        }
      });
      // 先端の変換候補を追加
      nodes[route.length] = candidates;
      setDatabaseNodes(nodes);
    }
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
              label: k,
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
      setRoute([databases[0]]);
    }
  };

  /**
   * 表示されているノードをクリアする
   */
  const clearExplore = () => {
    setDatabaseNodes([]);
    setRoute([]);
  };

  /**
   * 表示されているノードを一列目のみにする
   */
  const restartExplore = () => {
    setDatabaseNodes(databaseNodes.slice(0, 1));
    setRoute(route.slice(0, 1));
  };

  /**
   * Executeボタン押下
   * @param ids
   */
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
