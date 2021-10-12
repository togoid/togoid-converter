import React, { useState, useEffect } from "react";
import NProgress from "nprogress";
import axios from "axios";
import Header from "../components/Header";
import Explore from "../components/Explore";
import Databases from "../components/Databases";
import IdInput from "../components/IdInput";
import Documents from "../components/Documents";
import TabWrapper from "../components/TabWrapper";
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
  const [isSpecific, setIsSpecific] = useState(false);

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
        if (isSpecific && route.length >= databaseNodesList.length - 1) {
          createSpecificModePath();
        } else if (isUseKeepRoute) {
          setIsSpecific(false);
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
          setIsSpecific(false);
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
          if (route[i] && route[i].name === v.name) {
            candidatePaths.push(
              getPathStyle(
                `total${i - 1}-${route[i - 1].name}`,
                `node${i}-${v.name}`,
                true
              )
            );
          } else {
            candidatePaths.push(
              getPathStyle(
                `total${i - 1}-${route[i - 1].name}`,
                `node${i}-${v.name}`,
                false
              )
            );
          }
        });

        // 逆引き用のpath
        if (i === nodesList.length - 1) {
          candidatePaths.push(
            getPathStyle(
              `total${i - 1}-${routeTemp[i - 1].name}`,
              `nodeOther`,
              false
            )
          );
        }
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
            }
          }
        }
      });
    });

    if (!secondCandidates.length) {
      setIsSpecific(false);
      return;
    }
    const candidates = [
      secondCandidates.map((v) => v[0]),
      secondCandidates.map((v) => v[1]),
    ];

    const nodesList = await getTotal(candidates);

    await setDatabaseNodesList(nodesList);

    const candidatePaths = [];
    nodesList.forEach((nodes, i) => {
      if (i === 0) return;
      else if (i <= route.length) {
        nodes.forEach((v) => {
          candidatePaths.push(
            getPathStyle(
              `total${i - 1}-${route[i - 1].name}`,
              `node${i}-${v.name}`,
              false
            )
          );
        });
      } else {
        nodes.forEach((v, j) => {
          candidatePaths.push(
            getPathStyle(
              `total${i - 1}-${nodesList[i - 1][j].name}`,
              `node${i}-${v.name}`,
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
        if (i !== 0) {
          r.push(candidates[0][j]);
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
        nodesList[nodesList.length] = candidate
          .map((v, i) => {
            const _v = Object.assign({}, v);
            if (!values[i]) {
              _v.total = -1;
            } else if (values[i].total) {
              _v.total = values[i].total;
            } else {
              return null;
            }

            return _v;
          })
          .filter((v) => v);
      });
    }
    return nodesList;
  };

  const createSpecificModePath = () => {
    const candidatePaths = [];
    let num;
    databaseNodesList.forEach((nodes, i) => {
      if (i === 0) return;
      else if (
        i < route.length &&
        (databaseNodesList.length !== route.length ||
          i !== databaseNodesList.length - 1)
      ) {
        nodes.forEach((v, j) => {
          if (route[i] && route[i].name === v.name) {
            num = j;
            candidatePaths.push(
              getPathStyle(
                `total${i - 1}-${route[i - 1].name}`,
                `node${i}-${v.name}`,
                true
              )
            );
          } else {
            candidatePaths.push(
              getPathStyle(
                `total${i - 1}-${route[i - 1].name}`,
                `node${i}-${v.name}`,
                false
              )
            );
          }
        });
      } else {
        nodes.forEach((v, j) => {
          if (j === num) {
            candidatePaths.push(
              getPathStyle(
                `total${i - 1}-${databaseNodesList[i - 1][j].name}`,
                `node${i}-${v.name}`,
                true
              )
            );
          } else {
            candidatePaths.push(
              getPathStyle(
                `total${i - 1}-${databaseNodesList[i - 1][j].name}`,
                `node${i}-${v.name}`,
                false
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
              selectedDropDown={selectedDropDown}
              setSelectedDropDown={setSelectedDropDown}
              isSpecific={isSpecific}
              setIsSpecific={setIsSpecific}
              lookupRoute={lookupRoute}
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
