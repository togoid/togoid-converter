import Head from "next/head";
import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Explore from "../components/Explore";
import Databases from "../components/Databases";
import IdInput from "../components/IdInput";
import axios from "axios";
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
            hasMenu: false,
          });
        }
      });
      // 先端の変換候補を追加
      nodes[route.length] = candidates;
      setDatabaseNodes(nodes);
    }
    // if (route.length > 1) {
    //   // TODO クエリ実行中にloading画面を表示させる
    //   const r = [
    //     route[route.length - 2].name.split("-").pop(),
    //     route[route.length - 1].name.split("-").pop(),
    //   ].join(",");
    //   const ids = route[route.length - 2].ids.map((v) => v.to).join(",");
    //   const d = await axios
    //     .get(
    //       `${process.env.NEXT_PUBLIC_SPARQL_ENDOPOINT}/convert?ids=${ids}&route=${r}`
    //     )
    //     .then((d) => d.data)
    //     .catch((e) => console.log(e));
    //
    //   console.log(d);
    //
    //   const nodes = [...databaseNodes];
    //   if (d) {
    //     const candidates = [];
    //     d.result.forEach((v) => {
    //       const index = candidates.findIndex((pref) => pref.name === v.tn);
    //       if (index === -1) {
    //         candidates.push({
    //           name: v.tn,
    //           label: v.tn,
    //           count: 1,
    //           hasMenu: false,
    //           ids: [{ from: v.f, to: v.t }],
    //         });
    //       } else {
    //         candidates[index].count += 1;
    //         candidates[index].ids.push({ from: v.f, to: v.t });
    //       }
    //     });
    //     candidates.sort((a, b) => {
    //       if (a.count < b.count) return 1;
    //       if (a.count > b.count) return -1;
    //       return 0;
    //     });
    //     nodes.push(candidates);
    //     setDatabaseNodes(nodes);
    //   }
    // }
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
              hasMenu: false,
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

  const executeQuery = async () => {
    // TODO クエリ実行中にloading画面を表示させる
    const route = [route[route.length - 2].name, route[route.length - 1].name];
    const ids = route[route.length - 2].ids.join(",");
    const d = await axios
      .get(
        `${process.env.NEXT_PUBLIC_SPARQL_ENDOPOINT}/convert?ids=${ids}&routes=${route}`
      )
      .then((d) => d.data)
      .catch((e) => console.log(e));

    console.log(d);

    const nodes = [...databaseNodes];
    if (d) {
      const candidates = [];
      d.result.forEach((v) => {
        const index = candidates.findIndex((pref) => pref.name === v.tn);
        if (index === -1) {
          candidates.push({
            name: v.tn,
            label: v.tn,
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
      nodes.push(candidates);
      setDatabaseNodes(nodes);
    }
  };
  /**
   * 表示されているリストをクリアする
   */
  const clearExplore = () => {
    setDatabaseNodes([]);
    setRoute([]);
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
          {activeTab === "EXPLORE" ? (
            <Explore
              databaseNodes={databaseNodes}
              route={route}
              setRoute={setRoute}
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
