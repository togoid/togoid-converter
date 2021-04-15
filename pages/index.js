import Head from "next/head";
import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Explore from "../components/Explore";
import Databases from "../components/Databases";
import IdInput from "../components/IdInput";
import { idPatterns, q } from "../lib/util";

const Home = () => {
  const [ids, setIds] = useState([]);
  const [activeTab, setActiveTab] = useState("EXPLORE");
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
      // executeQuery(database);
    }
  }, [selectedDatabase]);
  /**
   * idsに入力されたIDまたはIDリストをidPatternsから正規表現で検索
   */
  const searchDatabase = () => {
    const candidates = [];
    ids.forEach((id) => {
      for (const key in idPatterns) {
        if (id.match(idPatterns[key].regexp)) {
          const index = candidates.findIndex(
            (databases) => databases.name === key
          );
          if (index === -1) {
            candidates.push({
              name: key,
              count: 1,
              ids: [id],
              hasMenu: false,
            });
          } else {
            candidates[index].count += 1;
            candidates[index].ids.push(id);
          }
        }
      }
    });
    if (candidates.length > 0) {
      candidates.sort((a, b) => {
        if (a.count < b.count) return 1;
        if (a.count > b.count) return -1;
        return 0;
      });
      const databases = candidates.map((v) => ({
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
      const candidates = [];
      d.result.forEach((v) => {
        const index = candidates.findIndex((pref) => pref.name === v.tn);
        if (index === -1) {
          candidates.push({
            name: v.tn,
            count: 1,
            hasMenu: false,
            ids: [{ from: v.f, to: v.t }],
          });
        } else {
          candidates[index].count += 1;
          candidates[index].ids.push({ from: v.f, to: v.t });
        }
      });
      candidates.sort((a, b) => {
        if (a.count < b.count) return 1;
        if (a.count > b.count) return -1;
        return 0;
      });
      newDatabases.push(candidates);
      setDatabases(newDatabases);
    }
  };
  /**
   * 表示されているリストをクリアする
   */
  const clearExplore = () => {
    setDatabases([]);
    setSelectedDatabase([]);
    setCurrentIndex(0);
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
              DATABASE
            </button>
          </div>
          {activeTab === "EXPLORE" ? <Explore ids={ids} /> : <Databases />}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
