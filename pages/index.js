import React, { useState, useEffect } from "react";
import NProgress from "nprogress";
import axios from "axios";
import Header from "../components/Header";
import Explore from "../components/Explore";
import Databases from "../components/Databases";
import IdInput from "../components/IdInput";
import Documents from "../components/Documents";
import TabWrapper from "../components/TabWrapper";
import Navigate from "../components/Navigate";
import {
  executeQuery,
  executeCountQuery,
  getPathStyle,
  mergePathStyle,
} from "../lib/util";
import { topExamples } from "../lib/examples";

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
  const [offsetRoute, setOffsetRoute] = useState(null);
  const [previousSearchTab, setPreviousSearchTab] = useState("EXPLORE");

  useEffect(() => {
    const fetchApi = async () => {
      const promises = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_ENDOPOINT}/config/dataset`),
        axios.get(`${process.env.NEXT_PUBLIC_API_ENDOPOINT}/config/relation`),
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
        if (activeTab === "NAVIGATE") {
          if (route.length === 1) {
            setDatabaseNodesList([databaseNodesList[0]]);
            setCandidatePaths([
              getPathStyle(
                `from${0}-${route[0].name}`,
                `nodeOther`,
                false,
                "default"
              ),
            ]);
          } else {
            createNavigatePath(databaseNodesList);
          }
        } else if (isUseKeepRoute) {
          const r = route;
          for (let i = 0; i < previousRoute.length; i++) {
            await createNodesList(r);
            if (i < previousRoute.length - 1) {
              const v = databaseNodesList[i + 1].find(
                (element) => element.name === previousRoute[i + 1].name
              );
              if (v === undefined || v.target === 0) {
                break;
              }
              r.push(v);
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
              source: 1,
              target: 1,
              link: dbConfig[`${r.name}-${name}`].link.forward.label,
              results: [],
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
              source: 1,
              target: 1,
              link: dbConfig[`${name}-${r.name}`].link.reverse.label,
              results: [],
            });
          }
        }
      }
    });

    NProgress.start();
    nodesList[routeTemp.length] = await Promise.all(
      candidates.map(async (v) => {
        const r = [routeTemp[routeTemp.length - 1], v];
        const ids = routeTemp[routeTemp.length - 1].results;
        const _v = Object.assign({}, v);

        // 変換結果を取得
        const convert = await executeQuery(r, ids, "target", 10000).catch(
          () => null
        );
        NProgress.inc(1 / candidates.length);
        if (convert === null) {
          _v.source = -1;
          _v.target = -1;
          return _v;
        }

        _v.results = Array.from(new Set(convert.results));
        const uniqueCount = _v.results.length;
        if (uniqueCount === 0) {
          _v.source = 0;
          _v.target = 0;
        } else if (uniqueCount < 10000) {
          const path = `${r[0].name}-${r[1].name}`;
          // 変換結果が0より多く10000未満の時は個数を取得する
          const count = await executeCountQuery(path, ids).catch(() => null);
          if (count !== null) {
            _v.source = count.source;
            _v.target = count.target;
          }
        } else {
          _v.source = -2;
          _v.target = -2;
        }
        return _v;
      })
    );
    NProgress.done();
    setDatabaseNodesList(nodesList);

    const candidatePaths = [];
    nodesList.forEach((nodes, i) => {
      if (i === 0) return;
      nodes.forEach((v) => {
        candidatePaths.push(
          ...mergePathStyle(
            `from${i - 1}-${route[i - 1].name}`,
            `to${i}-${v.name}`,
            route[i] && route[i].name === v.name
          )
        );
      });
    });
    setCandidatePaths(candidatePaths);
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
              target: 1,
              results: [id],
            });
          } else {
            candidates[index].target += 1;
            candidates[index].results.push(id);
          }
        }
      });
    });
    if (candidates.length > 0) {
      setDatabaseNodesList([candidates]);
      setRoute([]);
    }
    return candidates;
  };

  const clearExplore = () => {
    setDatabaseNodesList([]);
    setRoute([]);
  };

  const restartExplore = () => {
    setDatabaseNodesList(databaseNodesList.slice(0, 1));

    if (activeTab === "NAVIGATE") {
      setRoute(route.slice(0, 1));
      setCandidatePaths([
        getPathStyle(
          `from${0}-${route[0].name}`,
          `nodeOther`,
          false,
          "default"
        ),
      ]);
    } else {
      setRoute([]);
    }
  };

  const handleIdTextsSubmit = (t) => {
    const ids = t
      .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) =>
        String.fromCharCode(s.charCodeAt(0) - 0xfee0)
      )
      .split(/[\s,\n,、,,]+/)
      .filter((v) => v)
      .map((v) => v.trim());
    clearExplore();
    setIds(ids);
    return searchDatabase(ids);
  };

  const handleTopExamples = (key) => {
    executeExamples(topExamples[key].join("\n"), key);
  };

  // Examplesをクリックした際の検索
  const executeExamples = (idTexts, key) => {
    changeIndexTab("EXPLORE");
    setIdTexts(idTexts);

    const findDatabaseList = handleIdTextsSubmit(idTexts);
    if (
      previousRoute.length &&
      findDatabaseList.find((v) => v.name === previousRoute[0].name)
    ) {
      // keepRouteを使用する
      setRoute([previousRoute[0]]);
      setIsUseKeepRoute(true);
    } else {
      // Examplesで選択したものは必ず見つかる前提
      setRoute([findDatabaseList.find((v) => v.name === key)]);
    }
  };

  const lookupRoute = async (target) => {
    const r = route[route.length - 1];
    const firstCandidates = [];
    const firstCandidatesTemp = [];

    Object.keys(dbConfig).forEach((k) => {
      const keySplit = k.split("-");
      if (keySplit[0] === r.name) {
        const name = keySplit[1];
        if (!route.find((w) => w.name === name)) {
          if (name === target) {
            if (!firstCandidates.length) {
              firstCandidates.push({
                name,
                category: dbCatalogue[name].category,
                source: -3,
                target: -3,
                link: dbConfig[k].link.forward.label,
              });
            }
          } else if (!firstCandidatesTemp.find((v) => v.name === name)) {
            firstCandidatesTemp.push({
              name,
              category: dbCatalogue[name].category,
              source: -3,
              target: -3,
              link: dbConfig[k].link.forward.label,
            });
          }
        }
      } else if (dbConfig[k].link.reverse && keySplit[1] === r.name) {
        // ↑configに逆変換が許可されていれば、逆方向の変換を候補に含める
        const name = keySplit[0];
        if (!route.find((w) => w.name === name)) {
          if (name === target) {
            if (!firstCandidates.length) {
              firstCandidates.push({
                name,
                category: dbCatalogue[name].category,
                source: -3,
                target: -3,
                link: dbConfig[k].link.reverse.label,
              });
            }
          } else if (!firstCandidatesTemp.find((v) => v.name === name)) {
            firstCandidatesTemp.push({
              name,
              category: dbCatalogue[name].category,
              source: -3,
              target: -3,
              link: dbConfig[k].link.reverse.label,
            });
          }
        }
      }
    });

    const secondCandidates = [];
    const secondCandidatesTemp = [];

    firstCandidatesTemp.forEach((r) => {
      Object.keys(dbConfig).forEach((k) => {
        const keySplit = k.split("-");
        if (keySplit[0] === r.name) {
          const name = keySplit[1];
          if (!route.find((w) => w.name === name)) {
            if (name === target) {
              if (
                !secondCandidates.find(
                  (v) => v[0].name === r.name && v[1].name === name
                )
              ) {
                secondCandidates.push([
                  r,
                  {
                    name,
                    category: dbCatalogue[name].category,
                    source: -3,
                    target: -3,
                    link: dbConfig[k].link.forward.label,
                  },
                ]);
              }
            } else if (
              !secondCandidatesTemp.find(
                (v) => v[0].name === r.name && v[1].name === name
              )
            ) {
              secondCandidatesTemp.push([
                r,
                {
                  name,
                  category: dbCatalogue[name].category,
                  source: -3,
                  target: -3,
                  link: dbConfig[k].link.forward.label,
                },
              ]);
            }
          }
        } else if (dbConfig[k].link.reverse && keySplit[1] === r.name) {
          // ↑configに逆変換が許可されていれば、逆方向の変換を候補に含める
          const name = keySplit[0];
          if (!route.find((w) => w.name === name)) {
            if (name === target) {
              if (
                !secondCandidates.find(
                  (v) => v[0].name === r.name && v[1].name === name
                )
              ) {
                secondCandidates.push([
                  r,
                  {
                    name,
                    category: dbCatalogue[name].category,
                    source: -3,
                    target: -3,
                    link: dbConfig[k].link.reverse.label,
                  },
                ]);
              }
            } else if (
              !secondCandidatesTemp.find(
                (v) => v[0].name === r.name && v[1].name === name
              )
            ) {
              secondCandidatesTemp.push([
                r,
                {
                  name,
                  category: dbCatalogue[name].category,
                  source: -3,
                  target: -3,
                  link: dbConfig[k].link.reverse.label,
                },
              ]);
            }
          }
        }
      });
    });

    if (
      !firstCandidates.length &&
      !secondCandidates.length &&
      !secondCandidatesTemp.length
    ) {
      return;
    }

    const thirdCandidates = [];
    secondCandidatesTemp.forEach((r) => {
      Object.keys(dbConfig).forEach((k) => {
        const keySplit = k.split("-");
        if (keySplit[0] === r[1].name) {
          const name = keySplit[1];
          if (!route.find((w) => w.name === name)) {
            if (name === target) {
              if (
                !thirdCandidates.find(
                  (v) =>
                    v[0].name === r[0].name &&
                    v[1].name === r[1].name &&
                    v[2].name === name
                )
              ) {
                thirdCandidates.push([
                  r[0],
                  r[1],
                  {
                    name,
                    category: dbCatalogue[name].category,
                    source: -3,
                    target: -3,
                    link: dbConfig[k].link.forward.label,
                  },
                ]);
              }
            }
          }
        } else if (dbConfig[k].link.reverse && keySplit[1] === r[1].name) {
          // ↑configに逆変換が許可されていれば、逆方向の変換を候補に含める
          const name = keySplit[0];
          if (!route.find((w) => w.name === name)) {
            if (name === target) {
              if (
                !thirdCandidates.find(
                  (v) =>
                    v[0].name === r[0].name &&
                    v[1].name === r[1].name &&
                    v[2].name === name
                )
              ) {
                thirdCandidates.push([
                  r[0],
                  r[1],
                  {
                    name,
                    category: dbCatalogue[name].category,
                    source: -3,
                    target: -3,
                    link: dbConfig[k].link.reverse.label,
                  },
                ]);
              }
            }
          }
        }
      });
    });

    const candidates = firstCandidates.length
      ? [...[firstCandidates], ...secondCandidates, ...thirdCandidates]
      : [...secondCandidates, ...thirdCandidates];

    const t = await getTotal(candidates);

    const u = t.map((v) => {
      if (v.length === 1) {
        return [null, null, v[0]];
      } else if (v.length === 2) {
        return [v[0], null, v[1]];
      } else {
        return v;
      }
    });

    const nodesList = [
      databaseNodesList[0],
      u.map((v) => v[0]),
      u.map((v) => v[1]),
      u.map((v) => v[2]),
    ].filter((v) => v.length);

    await setDatabaseNodesList(nodesList);

    createNavigatePath(nodesList);
  };

  const getTotal = async (candidates) => {
    NProgress.start();
    const result = await Promise.all(
      candidates.map(async (v) => {
        const r = route.slice().concat(v);

        // 変換結果を取得
        const convert = await executeQuery(r, ids, "target", 10000).catch(
          () => null
        );
        NProgress.inc(1 / candidates.length);
        if (convert === null) {
          v[v.length - 1].target = -1;
          return v;
        }

        const uniqueCount = Array.from(new Set(convert.results)).length;
        if (uniqueCount === 0) {
          v[v.length - 1].target = 0;
        } else if (uniqueCount < 10000) {
          v[v.length - 1].target = uniqueCount;
        } else {
          v[v.length - 1].target = -2;
        }
        return v;
      })
    );
    const nodesList = result.filter(
      (v) => v[v.length - 1].target !== -1 && v[v.length - 1].target !== 0
    );
    NProgress.done();
    return nodesList;
  };

  const createNavigatePath = (nodesList) => {
    const candidatePaths = [];
    nodesList.forEach((nodes, i) => {
      if (i === 0) {
        if (nodesList.length === 1) {
          candidatePaths.push(
            getPathStyle(
              `from${0}-${route[0].name}`,
              `nodeOther`,
              false,
              "default"
            )
          );
        }
      } else if (i === 1) {
        nodes.forEach((v, j) => {
          if (v === null) {
            candidatePaths.push(
              getPathStyle(
                `from${0}-${route[0].name}`,
                `to${i}-${j}`,
                j === offsetRoute,
                "none"
              )
            );
          } else {
            candidatePaths.push(
              ...mergePathStyle(
                `from${0}-${route[0].name}`,
                `to${i}-${j}`,
                j === offsetRoute
              )
            );
          }
        });
      } else if (i === nodesList.length - 1) {
        nodes.forEach((v, j) => {
          if (nodesList[i - 2][j] === null) {
            candidatePaths.push(
              {
                from: {
                  id: `to${i - 2}-${j}`,
                  posX: "left",
                  posY: "middle",
                },
                to: {
                  id: `label${i}-${j}`,
                  posX: "left",
                  posY: "middle",
                },
                style:
                  j === offsetRoute
                    ? {
                        color: "#1A8091",
                        head: "none",
                        arrow: "smooth",
                        width: 2,
                      }
                    : {
                        color: "#dddddd",
                        head: "none",
                        arrow: "smooth",
                        width: 1.5,
                      },
              },
              getPathStyle(
                `label${i}-${j}`,
                `to${i}-${j}`,
                j === offsetRoute,
                "default"
              )
            );
          } else if (nodesList[i - 1][j] === null) {
            candidatePaths.push(
              ...mergePathStyle(
                `to${i - 2}-${j}`,
                `to${i}-${j}`,
                j === offsetRoute
              )
            );
          } else {
            candidatePaths.push(
              ...mergePathStyle(
                `to${i - 1}-${j}`,
                `to${i}-${j}`,
                j === offsetRoute
              )
            );
          }
        });
      } else {
        nodes.forEach((v, j) => {
          if (v === null) return;
          else {
            candidatePaths.push(
              ...mergePathStyle(
                `to${i - 1}-${j}`,
                `to${i}-${j}`,
                j === offsetRoute
              )
            );
          }
        });
      }
    });
    setCandidatePaths(candidatePaths);
  };

  const changeIndexTab = (name) => {
    if (
      (previousSearchTab === "NAVIGATE" && name === "EXPLORE") ||
      (previousSearchTab === "EXPLORE" && name === "NAVIGATE")
    ) {
      setRoute(route.slice(0, 1));
      setDatabaseNodesList(databaseNodesList.slice(0, 1));
      setPreviousSearchTab(name);
    }
    setActiveTab(name);
  };

  return (
    <div className="home">
      <Header />
      <main className="main">
        <IdInput
          handleIdTextsSubmit={handleIdTextsSubmit}
          setIdTexts={setIdTexts}
          idTexts={idTexts}
          handleTopExamples={handleTopExamples}
          route={route}
          setRoute={setRoute}
          previousRoute={previousRoute}
          setPreviousRoute={setPreviousRoute}
          dbCatalogue={dbCatalogue}
          restartExplore={restartExplore}
          setIsUseKeepRoute={setIsUseKeepRoute}
        />
        <div className="drawing_area">
          <TabWrapper activeTab={activeTab} changeIndexTab={changeIndexTab} />
          {activeTab === "NAVIGATE" && (
            <Navigate
              databaseNodesList={databaseNodesList}
              candidatePaths={candidatePaths}
              route={route}
              setRoute={setRoute}
              ids={ids}
              dbCatalogue={dbCatalogue}
              dbConfig={dbConfig}
              dbDesc={dbDesc}
              lookupRoute={lookupRoute}
              offsetRoute={offsetRoute}
              setOffsetRoute={setOffsetRoute}
            />
          )}
          {activeTab === "EXPLORE" && (
            <Explore
              databaseNodesList={databaseNodesList}
              candidatePaths={candidatePaths}
              route={route}
              setRoute={setRoute}
              ids={ids}
              dbCatalogue={dbCatalogue}
              dbConfig={dbConfig}
              dbDesc={dbDesc}
              setPreviousRoute={setPreviousRoute}
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
