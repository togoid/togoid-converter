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
import { executeQuery, getPathStyle } from "../lib/util";
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
  const [selectedDropDown, setSelectedDropDown] = useState(null);
  const [offsetRoute, setOffsetRoute] = useState([]);

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
        if (activeTab === "NAVIGATE") {
          if (route.length === 1) {
            setDatabaseNodesList([databaseNodesList[0]]);
            setCandidatePaths([
              getPathStyle(`total${0}-${route[0].name}`, `nodeOther`, false),
            ]);
          } else {
            createSpecificModePath();
          }
        } else if (isUseKeepRoute) {
          const r = route;
          for (let i = 0; i < previousRoute.length; i++) {
            await createNodesList(r);
            if (i < previousRoute.length - 1) {
              const v = databaseNodesList[i + 1].find(
                (element) => element.name === previousRoute[i + 1].name
              );
              if (v === undefined || v.total === 0) {
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
      setSelectedDropDown(null);
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
        return executeQuery(r, ids, "target", 10000, "only")
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
          candidatePaths.push(
            getPathStyle(
              `total${i - 1}-${route[i - 1].name}`,
              `node${i}-${v.name}`,
              route[i] && route[i].name === v.name
            )
          );
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
      .filter((v) => v)
      .map((v) => v.trim());
    clearExplore();
    setIds(ids);
    return searchDatabase(ids);
  };

  const handleTopExamples = (key) => {
    executeExamples(topExamples[key].join("\n"), key);
  };

  const executeExamples = (idTexts, key) => {
    setActiveTab("EXPLORE");
    setIdTexts(idTexts);

    // previousRouteがある時はtryKeepRouteを実行し、falseの時は残りの処理を実行
    if (!previousRoute.length || !tryKeepRoute(idTexts)) {
      const startRoute = handleIdTextsSubmit(idTexts).find(
        (ele) => ele.name === key
      );
      setRoute([startRoute]);
    }
  };

  const tryKeepRoute = (idTexts) => {
    const checkIndex = handleIdTextsSubmit(idTexts).findIndex(
      (element) => element.name === previousRoute[0].name
    );
    if (checkIndex !== -1) {
      setRoute([previousRoute[0]]);
      setIsUseKeepRoute(true);
      return true;
    }
    return false;
  };

  const lookupRoute = async (target) => {
    const r = route[route.length - 1];
    const firstCandidatesTemp = [];

    // tergetと一致しない変換可能なものを取得
    Object.keys(dbConfig).forEach((k) => {
      if (!firstCandidatesTemp.find((v) => v.name === r.name)) {
        const keySplit = k.split("-");
        if (keySplit[0] === r.name) {
          const name = keySplit[1];
          if (
            name !== target &&
            !route.find((w) => w.name === name) &&
            !firstCandidatesTemp.find((v) => v.name === name)
          ) {
            // 順方向の変換
            firstCandidatesTemp.push({
              name,
              category: dbCatalogue[name].category,
              total: 1,
              ids: [],
            });
          }
        } else if (dbConfig[k].link.reverse && keySplit[1] === r.name) {
          // ↑configに逆変換が許可されていれば、逆方向の変換を候補に含める
          const name = keySplit[0];
          if (
            name !== target &&
            !route.find((w) => w.name === name) &&
            !firstCandidatesTemp.find((v) => v.name === name)
          ) {
            firstCandidatesTemp.push({
              name,
              category: dbCatalogue[name].category,
              total: 1,
              ids: [],
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
                    total: 1,
                    ids: [],
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
                  total: 1,
                  ids: [],
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
                    total: 1,
                    ids: [],
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
                  total: 1,
                  ids: [],
                },
              ]);
            }
          }
        }
      });
    });

    if (!secondCandidates.length && !secondCandidatesTemp.length) {
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
                    total: 1,
                    ids: [],
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
                    total: 1,
                    ids: [],
                  },
                ]);
              }
            }
          }
        }
      });
    });

    const candidatesSecond = [
      secondCandidates.map((v) => v[0]),
      secondCandidates.map((v) => v[1]),
    ];

    const candidatesThird = [
      thirdCandidates.map((v) => v[0]),
      thirdCandidates.map((v) => v[1]),
      thirdCandidates.map((v) => v[2]),
    ];

    // 変換が途中で失敗したものを消す（too manyも消してしまっている）
    const [nodesList1, nodesList2] = removeZeroNode(
      await getTotal(candidatesSecond),
      await getTotal(candidatesThird)
    );

    const nodesList = [
      nodesList1[0],
      nodesList1[1].concat(nodesList2[1]),
      Array(nodesList1[1].length).fill(null).concat(nodesList2[2]),
      nodesList1[2].concat(nodesList2[3]),
    ];
    await setDatabaseNodesList(nodesList);

    const candidatePaths = [];
    nodesList.forEach((nodes, i) => {
      if (i === 0) return;
      else if (i === 1) {
        nodes.forEach((v, j) => {
          candidatePaths.push(
            getPathStyle(
              `total${i - 1}-${route[i - 1].name}`,
              `node${i}-${v.name}-${j}`,
              false
            )
          );
        });
      } else if (i === nodesList.length - 1) {
        nodes.forEach((v, j) => {
          if (nodesList[i - 1][j] === null) {
            candidatePaths.push(
              getPathStyle(
                `total${i - 2}-${nodesList[i - 2][j].name}-${j}`,
                `node${i}-${v.name}-0`,
                false
              )
            );
          } else {
            candidatePaths.push(
              getPathStyle(
                `total${i - 1}-${nodesList[i - 1][j].name}-${j}`,
                `node${i}-${v.name}-0`,
                false
              )
            );
          }
        });
      } else {
        nodes.forEach((v, j) => {
          if (v === null) return;
          candidatePaths.push(
            getPathStyle(
              `total${i - 1}-${nodesList[i - 1][j].name}-${j}`,
              `node${i}-${v.name}-${j}`,
              false
            )
          );
        });
      }
    });
    setCandidatePaths(candidatePaths);
  };

  const getTotal = async (candidates) => {
    const nodesList = databaseNodesList.slice(0, route.length);
    for (const [i, candidate] of candidates.entries()) {
      NProgress.start();
      const promises = candidate.map((v, j) => {
        const r = route.slice();
        if (i === 1) {
          r.push(candidates[i - 1][j]);
        } else if (i === 2) {
          r.push(candidates[i - 2][j]);
          r.push(candidates[i - 1][j]);
        }
        r.push(v);
        return new Promise(function (resolve) {
          // エラーになった変換でもnullを返してresolve
          return executeQuery(r, ids, "target", 10000, "only")
            .then((v) => {
              NProgress.inc(1 / candidate.length);
              resolve(v);
            })
            .catch(() => resolve(null));
        });
      });

      await Promise.all(promises).then((values) => {
        NProgress.done();
        // 先端の変換候補を追加
        nodesList[nodesList.length] = candidate.map((v, i) => {
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
      });
    }
    return nodesList;
  };

  const removeZeroNode = (nodesList1, nodesList2) => {
    // let 及び 破壊的処理あり
    let i = 0;
    while (i < nodesList1[1].length) {
      if (nodesList1[1][i].total < 1 || nodesList1[2][i].total < 1) {
        nodesList1[1].splice(i, 1);
        nodesList1[2].splice(i, 1);
      } else {
        i++;
      }
    }

    i = 0;
    while (i < nodesList2[1].length) {
      if (
        nodesList2[1][i].total < 1 ||
        nodesList2[2][i].total < 1 ||
        nodesList2[3][i].total < 1
      ) {
        nodesList2[1].splice(i, 1);
        nodesList2[2].splice(i, 1);
        nodesList2[3].splice(i, 1);
      } else {
        i++;
      }
    }

    return [nodesList1, nodesList2];
  };

  const createSpecificModePath = () => {
    const candidatePaths = [];
    databaseNodesList.forEach((nodes, i) => {
      if (i === 0) return;
      else if (i === 1) {
        nodes.forEach((v, j) => {
          candidatePaths.push(
            getPathStyle(
              `total${i - 1}-${route[i - 1].name}`,
              `node${i}-${v.name}-${j}`,
              j === offsetRoute[i]
            )
          );
        });
      } else if (i === databaseNodesList.length - 1) {
        nodes.forEach((v, j) => {
          if (databaseNodesList[i - 1][j] === null) {
            candidatePaths.push(
              getPathStyle(
                `total${i - 2}-${databaseNodesList[i - 2][j].name}-${j}`,
                `node${i}-${v.name}-0`,
                j === offsetRoute[i - 2]
              )
            );
          } else {
            candidatePaths.push(
              getPathStyle(
                `total${i - 1}-${databaseNodesList[i - 1][j].name}-${j}`,
                `node${i}-${v.name}-0`,
                j === offsetRoute[i - 2]
              )
            );
          }
        });
      } else {
        nodes.forEach((v, j) => {
          if (v === null) return;
          else {
            candidatePaths.push(
              getPathStyle(
                `total${i - 1}-${databaseNodesList[i - 1][j].name}-${j}`,
                `node${i}-${v.name}-${j}`,
                j === offsetRoute[i - 1]
              )
            );
          }
        });
      }
    });
    setCandidatePaths(candidatePaths);
  };

  return (
    <div className="home">
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
          <TabWrapper activeTab={activeTab} setActiveTab={setActiveTab} />
          {activeTab === "NAVIGATE" && (
            <Navigate
              databaseNodesList={databaseNodesList}
              candidatePaths={candidatePaths}
              route={route}
              setRoute={setRoute}
              restartExplore={restartExplore}
              ids={ids}
              dbCatalogue={dbCatalogue}
              dbConfig={dbConfig}
              dbDesc={dbDesc}
              selectedDropDown={selectedDropDown}
              setSelectedDropDown={setSelectedDropDown}
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
