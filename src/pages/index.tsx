import { useRouter } from "next/router";
import NProgress from "nprogress";
import { useUpdateEffect } from "react-use";

const Home = () => {
  const router = useRouter();

  const [ids, setIds] = useState(
    router.asPath
      .match(new RegExp(`[&?]ids=(.*?)(&|$|#)`))?.[1]
      .split("%2C")
      .filter((v) => v) ?? [],
  );

  const [routerRoute, setRouterRoute] = useState(
    router.asPath
      .match(new RegExp(`[&?]route=(.*?)(&|$|#)`))?.[1]
      .split("%2C")
      .filter((v) => v) ?? [],
  );
  const [activeTab, setActiveTab] = useState("EXPLORE");
  const [databaseNodesList, setDatabaseNodesList] = useState<any[][]>([]);
  const [route, setRoute] = useState<Route[]>([]);
  const [isUseKeepRoute, setIsUseKeepRoute] = useState(false);
  const [previousSearchTab, setPreviousSearchTab] = useState("EXPLORE");

  const { datasetConfig, relationConfig } = useConfig(true);

  useUpdateEffect(() => {
    router.replace({
      query: {
        route: routerRoute.length ? routerRoute.join(",") : undefined,
        ids: ids.length ? ids.join(",") : undefined,
      },
    });
  }, [routerRoute, ids]);

  useEffect(() => {
    if (route.length > 0) {
      const convertFunc = async () => {
        const abortController = new AbortController();
        if (activeTab === "NAVIGATE") {
          if (route.length === 1) {
            setDatabaseNodesList([databaseNodesList[0]]);
          }
          // eslint-disable-next-line no-empty
        } else if (activeTab === "ANNOTATE") {
        } else if (isUseKeepRoute) {
          const r = route;
          const nodesList = databaseNodesList.slice();
          for (let i = 0; i < routerRoute.length; i++) {
            const result = await createNodesList(r);
            nodesList.push(result);
            if (i < routerRoute.length - 1) {
              const v = nodesList[i + 1].find(
                (element) => element.name === routerRoute[i + 1],
              );
              if (v === undefined || v.target === 0) {
                break;
              }
              r.push(v);
            }
          }

          setDatabaseNodesList(nodesList);
          setRoute(r);
          setRouterRoute(r.map((v) => v.name));
          setIsUseKeepRoute(false);
        } else {
          const nodesList = databaseNodesList.slice(0, route.length);
          const result = await createNodesList(route);
          nodesList.push(result);

          setDatabaseNodesList(nodesList);
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
    if (ids.length && Object.keys(datasetConfig).length) {
      searchDatabase(ids);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datasetConfig]);

  const createNodesList = async (routeTemp: Route[]) => {
    const beforeRouteName = routeTemp[routeTemp.length - 1].name;
    const candidateList: Route[] = [];
    Object.entries(relationConfig).forEach(([key, valueList]) => {
      const keySplit = key.split("-");
      if (keySplit[0] === beforeRouteName) {
        // 順方向の変換
        valueList.forEach((value) => {
          candidateList.push({
            name: keySplit[1],
            source: 0,
            target: 0,
            results: [],
            relation: {
              link: value.forward,
              description: value.description,
            },
          });
        });
      } else if (
        keySplit[1] === beforeRouteName &&
        !relationConfig[`${keySplit[1]}-${keySplit[0]}`]
      ) {
        // configに逆変換が許可されていて順方向の定義が無ければ、逆方向の変換を候補に含める
        valueList.forEach((value) => {
          if (value.reverse) {
            candidateList.push({
              name: keySplit[0],
              source: 0,
              target: 0,
              results: [],
              relation: {
                link: value.reverse,
                description: value.description,
              },
            });
          }
        });
      }
    });

    NProgress.start();
    const result = await Promise.all(
      candidateList.map(async (v) => {
        const r = [routeTemp[routeTemp.length - 1], v];
        const ids = routeTemp[routeTemp.length - 1].results;
        const _v = structuredClone(v);

        // 変換結果を取得
        const convert = await executeQuery({
          route: r,
          ids: ids,
          report: "target",
          limit: 10000,
        }).catch(() => null);
        NProgress.inc(1 / candidateList.length);

        if (convert === null) {
          _v.message = "ERROR";
          return _v;
        }

        _v.results = convert.results;
        if (_v.results.length) {
          if (_v.results.length < 10000) {
            // 変換結果が0より多く10000未満の時は個数を取得する
            const count = await executeCountQuery({
              relation: `${r[0].name}-${r[1].name}`,
              ids: ids,
              link: r[1].relation?.link.label,
            }).catch(() => null);
            if (count === null) {
              _v.message = "ERROR";
            } else {
              _v.source = count.source;
              _v.target = count.target;
            }
          } else {
            // targetが0のままでは変換が0個と同じ扱いになってしまうため1以上にしておく
            _v.target = 1;
            _v.message = `${_v.results.length}+`;
          }
        } else {
          _v.source = 0;
          _v.target = 0;
        }
        return _v;
      }),
    );
    NProgress.done();

    return result;
  };

  /**
   * idsに入力されたIDまたはIDリストをidPatternsから正規表現で検索
   */
  const searchDatabase = (ids: string[], exampleTarget?: string) => {
    setIds(ids);

    const candidateList: Route[] = [];
    ids.forEach((id) => {
      Object.entries(datasetConfig).forEach(([key, value]) => {
        if (
          value.regex &&
          id.match(value.regex) &&
          Object.keys(relationConfig).some((d) => d.split("-").includes(key))
        ) {
          const candidate = candidateList.find(
            (databases) => databases.name === key,
          );
          if (candidate) {
            candidate.target += 1;
            candidate.results.push(id);
          } else {
            candidateList.push({
              name: key,
              target: 1,
              results: [id],
            });
          }
        }
      });
    });

    if (candidateList.length) {
      setDatabaseNodesList([candidateList]);
    } else {
      setDatabaseNodesList([]);
    }

    if (exampleTarget) {
      // Examplesで選択したものは必ず見つかる前提
      setRoute([candidateList.find((v) => v.name === exampleTarget)!]);
      setRouterRoute([
        candidateList.find((v) => v.name === exampleTarget)!.name,
      ]);
    } else if (
      routerRoute.length &&
      candidateList.some((v) => v.name === routerRoute[0])
    ) {
      // keepRouteを使用する
      setRoute([candidateList.find((v) => v.name === routerRoute[0])!]);
      setIsUseKeepRoute(true);
    } else if (candidateList.length === 1) {
      // listが1件の時は自動で選択する
      setRoute(candidateList);
      setRouterRoute([candidateList[0].name]);
    } else {
      setRoute([]);
      setRouterRoute([]);
    }
  };

  const restartExplore = () => {
    setDatabaseNodesList(databaseNodesList.slice(0, 1));

    if (activeTab === "NAVIGATE") {
      setRoute(route.slice(0, 1));
      setRouterRoute([route.slice(0, 1)[0].name]);
    } else {
      setRoute([]);
      setRouterRoute([]);
    }
  };

  // Examplesをクリックした際の検索
  const executeExamples = (idList: string[], exampleTarget: string) => {
    changeIndexTab("EXPLORE");

    searchDatabase(idList, exampleTarget);
  };

  const lookupRoute = async (target: string) => {
    const r = route[route.length - 1];
    const candidateList: NavigateRoute[][] = [];
    const candidateTempList: NavigateRoute[][][] = [[], [], []];

    Object.entries(relationConfig).forEach(([key, valueList]) => {
      const keySplit = key.split("-");
      if (keySplit[0] === r.name) {
        const name = keySplit[1];
        if (!route.some((w) => w.name === name)) {
          if (name === target) {
            valueList.forEach((value) => {
              candidateList.push([
                {
                  name,
                  relation: {
                    link: value.forward,
                    description: value.description,
                  },
                },
              ]);
            });
          } else {
            valueList.forEach((value) => {
              candidateTempList[0].push([
                {
                  name,
                  relation: {
                    link: value.forward,
                    description: value.description,
                  },
                },
              ]);
            });
          }
        }
      } else if (
        keySplit[1] === r.name &&
        !relationConfig[`${keySplit[1]}-${keySplit[0]}`]
      ) {
        // configに逆変換が許可されていて順方向の定義が無ければ、逆方向の変換を候補に含める
        const name = keySplit[0];
        if (!route.some((w) => w.name === name)) {
          if (name === target) {
            valueList.forEach((value) => {
              if (value.reverse) {
                candidateList.push([
                  {
                    name,
                    relation: {
                      link: value.reverse,
                      description: value.description,
                    },
                  },
                ]);
              }
            });
          } else {
            valueList.forEach((value) => {
              candidateTempList[0].push([
                {
                  name,
                  relation: {
                    link: value.reverse,
                    description: value.description,
                  },
                },
              ]);
            });
          }
        }
      }
    });

    candidateTempList[0].forEach((r) => {
      Object.entries(relationConfig).forEach(([key, valueList]) => {
        const keySplit = key.split("-");
        if (keySplit[0] === r[0].name) {
          const name = keySplit[1];
          if (!route.some((w) => w.name === name)) {
            if (name === target) {
              valueList.forEach((value) => {
                candidateList.push([
                  r[0],
                  {
                    name,
                    relation: {
                      link: value.forward,
                      description: value.description,
                    },
                  },
                ]);
              });
            } else {
              valueList.forEach((value) => {
                candidateTempList[1].push([
                  r[0],
                  {
                    name,
                    relation: {
                      link: value.forward,
                      description: value.description,
                    },
                  },
                ]);
              });
            }
          }
        } else if (
          keySplit[1] === r[0].name &&
          !relationConfig[`${keySplit[1]}-${keySplit[0]}`]
        ) {
          const name = keySplit[0];
          if (!route.some((w) => w.name === name)) {
            if (name === target) {
              valueList.forEach((value) => {
                if (value.reverse) {
                  candidateList.push([
                    r[0],
                    {
                      name,
                      relation: {
                        link: value.reverse,
                        description: value.description,
                      },
                    },
                  ]);
                }
              });
            } else {
              valueList.forEach((value) => {
                if (value.reverse) {
                  candidateTempList[1].push([
                    r[0],
                    {
                      name,
                      relation: {
                        link: value.reverse,
                        description: value.description,
                      },
                    },
                  ]);
                }
              });
            }
          }
        }
      });
    });

    if (!candidateList.length && !candidateTempList[1].length) {
      return;
    }

    candidateTempList[1].forEach((r) => {
      Object.entries(relationConfig).forEach(([key, valueList]) => {
        const keySplit = key.split("-");
        if (keySplit[0] === r[1].name) {
          const name = keySplit[1];
          if (!route.some((w) => w.name === name)) {
            if (name === target) {
              valueList.forEach((value) => {
                candidateList.push([
                  r[0],
                  r[1],
                  {
                    name,
                    relation: {
                      link: value.forward,
                      description: value.description,
                    },
                  },
                ]);
              });
            }
          }
        } else if (
          keySplit[1] === r[1].name &&
          !relationConfig[`${keySplit[1]}-${keySplit[0]}`]
        ) {
          const name = keySplit[0];
          if (!route.some((w) => w.name === name)) {
            if (name === target) {
              valueList.forEach((value) => {
                if (value.reverse) {
                  candidateList.push([
                    r[0],
                    r[1],
                    {
                      name,
                      relation: {
                        link: value.reverse,
                        description: value.description,
                      },
                    },
                  ]);
                }
              });
            }
          }
        }
      });
    });

    NProgress.start();
    const result = (
      await Promise.all(
        candidateList.map(async (v) => {
          // 変換結果を取得
          const convert = await executeQuery({
            // @ts-expect-error
            route: route.concat(v),
            ids: ids,
            report: "target",
            limit: 10000,
          }).catch(() => null);
          NProgress.inc(1 / candidateList.length);

          if (convert === null) {
            // 変換に失敗したとき
            v[v.length - 1].message = "ERROR";
            return v;
          } else if (convert.results.length) {
            // 変換に成功して結果が存在するとき 10000未満かどうかで分ける
            if (convert.results.length < 10000) {
              v[v.length - 1].target = convert.results.length;
            } else {
              v[v.length - 1].message = `${convert.results.length}+`;
            }
            return v;
          } else {
            // 変換結果が空のとき
            return null;
          }
        }),
      )
    ).filter((v): v is NonNullable<typeof v> => v !== null);
    NProgress.done();

    const nodesList: any[][] = [databaseNodesList[0], [], [], []];
    result.forEach((v) => {
      if (v.length === 1) {
        nodesList[1].push(null);
        nodesList[2].push(null);
        nodesList[3].push(v[0]);
      } else if (v.length === 2) {
        nodesList[1].push(v[0]);
        nodesList[2].push(null);
        nodesList[3].push(v[1]);
      } else {
        nodesList[1].push(v[0]);
        nodesList[2].push(v[1]);
        nodesList[3].push(v[2]);
      }
    });

    setDatabaseNodesList(nodesList);
  };

  const changeIndexTab = (name) => {
    if (
      (previousSearchTab === "NAVIGATE" && name === "EXPLORE") ||
      (previousSearchTab === "EXPLORE" && name === "NAVIGATE")
    ) {
      setRoute(route.slice(0, 1));
      setRouterRoute(route.slice(0, 1).map((v) => v.name));
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
          ids={ids}
          restartExplore={restartExplore}
          executeExamples={executeExamples}
          searchDatabase={searchDatabase}
        />
        <div className="drawing_area">
          <TabWrapper activeTab={activeTab} changeIndexTab={changeIndexTab} />
          {activeTab === "EXPLORE" && (
            <Explore
              databaseNodesList={databaseNodesList}
              route={route}
              setRoute={setRoute}
              ids={ids}
              setRouterRoute={setRouterRoute}
            />
          )}
          {activeTab === "NAVIGATE" && (
            <Navigate
              databaseNodesList={databaseNodesList}
              route={route}
              setRoute={setRoute}
              ids={ids}
              lookupRoute={lookupRoute}
            />
          )}
          {activeTab === "ANNOTATE" && (
            <Annotate
              databaseNodesList={databaseNodesList}
              route={route}
              setRoute={setRoute}
            />
          )}
          {activeTab === "LABEL2LD" && <LabelToId />}
          {activeTab === "DATASETS" && (
            <Datasets executeExamples={executeExamples} />
          )}
          {activeTab === "DOCUMENTS" && <Documents />}
        </div>
      </main>
    </div>
  );
};

export default Home;
