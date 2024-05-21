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
          let nodesList: any[][] = [];
          for (let i = 0; i < routerRoute.length; i++) {
            nodesList = await createNodesList(r, databaseNodesList);
            if (i < routerRoute.length - 1) {
              const v = databaseNodesList[i + 1].find(
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
          const nodesList = await createNodesList(
            route,
            databaseNodesList.slice(0, route.length),
          );

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

  const createNodesList = async (routeTemp: Route[], nodesList: any[][]) => {
    const r = routeTemp[routeTemp.length - 1];
    const candidateMap = new Map();
    Object.entries(relationConfig).forEach(([key, value]) => {
      const keySplit = key.split("-");
      if (keySplit[0] === r.name) {
        const name = keySplit[1];
        if (!routeTemp.find((w) => w.name === name)) {
          // 順方向の変換
          candidateMap.set(name, {
            name,
            category: datasetConfig[name].category,
            source: 0,
            target: 0,
            link: value.link.forward.label,
            results: [],
          });
        }
      } else if (value.link.reverse && keySplit[1] === r.name) {
        // ↑configに逆変換が許可されていれば、逆方向の変換を候補に含める
        const name = keySplit[0];
        if (
          !candidateMap.has(name) &&
          !routeTemp.find((w) => w.name === name)
        ) {
          // 逆方向の変換
          candidateMap.set(name, {
            name,
            category: datasetConfig[name].category,
            source: 0,
            target: 0,
            link: value.link.reverse.label,
            results: [],
          });
        }
      }
    });

    NProgress.start();
    nodesList[routeTemp.length] = await Promise.all(
      Array.from(candidateMap.values(), async (v) => {
        const r = [routeTemp[routeTemp.length - 1], v];
        const ids = routeTemp[routeTemp.length - 1].results;
        const _v = Object.assign({}, v);

        // 変換結果を取得
        const convert = await executeQuery({
          route: r,
          ids: ids,
          report: "target",
          limit: 10000,
        }).catch(() => null);
        NProgress.inc(1 / candidateMap.size);

        if (convert === null) {
          _v.message = "ERROR";
          return _v;
        }

        _v.results = convert.results;
        if (_v.results.length) {
          if (_v.results.length < 10000) {
            const path = `${r[0].name}-${r[1].name}`;
            // 変換結果が0より多く10000未満の時は個数を取得する
            const count = await executeCountQuery(path, ids).catch(() => null);
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

    return nodesList.slice();
  };

  /**
   * idsに入力されたIDまたはIDリストをidPatternsから正規表現で検索
   */
  const searchDatabase = (ids: string[], exampleTarget?: string) => {
    setIds(ids);

    const candidates: any[] = [];
    ids.forEach((id) => {
      Object.entries(datasetConfig).forEach(([key, value]) => {
        if (
          value.regex &&
          id.match(value.regex) &&
          Object.keys(relationConfig).some((d) => d.split("-").includes(key))
        ) {
          const index = candidates.findIndex(
            (databases) => databases.name === key,
          );
          if (index === -1) {
            candidates.push({
              name: key,
              category: value.category,
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
    } else {
      setDatabaseNodesList([]);
    }

    if (exampleTarget) {
      // Examplesで選択したものは必ず見つかる前提
      setRoute([candidates.find((v) => v.name === exampleTarget)]);
      setRouterRoute([candidates.find((v) => v.name === exampleTarget).name]);
    } else if (
      routerRoute.length &&
      candidates.some((v) => v.name === routerRoute[0])
    ) {
      // keepRouteを使用する
      setRoute([candidates.find((v) => v.name === routerRoute[0])]);
      setIsUseKeepRoute(true);
    } else if (candidates.length === 1) {
      // listが1件の時は自動で選択する
      setRoute(candidates);
      setRouterRoute([candidates[0].name]);
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
    const candidateMap = new Map<string, any[]>();
    const candidateTempMapList = [
      new Map<string, any[]>(),
      new Map<string, any[]>(),
    ];

    Object.entries(relationConfig).forEach(([key, value]) => {
      const keySplit = key.split("-");
      if (keySplit[0] === r.name) {
        const name = keySplit[1];
        if (!route.some((w) => w.name === name)) {
          if (name === target) {
            candidateMap.set(name, [
              {
                name,
                category: datasetConfig[name].category,
                link: value.link.forward.label,
              },
            ]);
          } else {
            candidateTempMapList[0].set(name, [
              {
                name,
                category: datasetConfig[name].category,
                link: value.link.forward.label,
              },
            ]);
          }
        }
      } else if (value.link.reverse && keySplit[1] === r.name) {
        // ↑configに逆変換が許可されていれば、逆方向の変換を候補に含める
        const name = keySplit[0];
        if (!candidateMap.has(name) && !route.some((w) => w.name === name)) {
          if (name === target) {
            candidateMap.set(name, [
              {
                name,
                category: datasetConfig[name].category,
                link: value.link.reverse.label,
              },
            ]);
          } else if (!candidateTempMapList[0].has(name)) {
            candidateTempMapList[0].set(name, [
              {
                name,
                category: datasetConfig[name].category,
                link: value.link.reverse.label,
              },
            ]);
          }
        }
      }
    });

    candidateTempMapList[0].forEach((r) => {
      Object.entries(relationConfig).forEach(([key, value]) => {
        const keySplit = key.split("-");
        if (keySplit[0] === r[0].name) {
          const name = keySplit[1];
          if (!route.some((w) => w.name === name)) {
            if (name === target) {
              candidateMap.set(`${r[0].name}-${name}`, [
                r[0],
                {
                  name,
                  category: datasetConfig[name].category,
                  link: value.link.forward.label,
                },
              ]);
            } else {
              candidateTempMapList[1].set(`${r[0].name}-${name}`, [
                r[0],
                {
                  name,
                  category: datasetConfig[name].category,
                  link: value.link.forward.label,
                },
              ]);
            }
          }
        } else if (value.link.reverse && keySplit[1] === r[0].name) {
          // ↑configに逆変換が許可されていれば、逆方向の変換を候補に含める
          const name = keySplit[0];
          if (
            !candidateMap.has(`${r[0].name}-${name}`) &&
            !route.some((w) => w.name === name)
          ) {
            if (name === target) {
              candidateMap.set(`${r[0].name}-${name}`, [
                r[0],
                {
                  name,
                  category: datasetConfig[name].category,
                  link: value.link.reverse.label,
                },
              ]);
            } else if (!candidateTempMapList[1].has(`${r[0].name}-${name}`)) {
              candidateTempMapList[1].set(`${r[0].name}-${name}`, [
                r[0],
                {
                  name,
                  category: datasetConfig[name].category,
                  link: value.link.reverse.label,
                },
              ]);
            }
          }
        }
      });
    });

    if (!candidateMap.size && !candidateTempMapList[1].size) {
      return;
    }

    candidateTempMapList[1].forEach((r) => {
      Object.entries(relationConfig).forEach(([key, value]) => {
        const keySplit = key.split("-");
        if (keySplit[0] === r[1].name) {
          const name = keySplit[1];
          if (!route.some((w) => w.name === name)) {
            if (name === target) {
              candidateMap.set(`${r[0].name}-${r[1].name}-${name}`, [
                r[0],
                r[1],
                {
                  name,
                  category: datasetConfig[name].category,
                  link: value.link.forward.label,
                },
              ]);
            }
          }
        } else if (value.link.reverse && keySplit[1] === r[1].name) {
          // ↑configに逆変換が許可されていれば、逆方向の変換を候補に含める
          const name = keySplit[0];
          if (
            !candidateMap.has(`${r[0].name}-${r[1].name}-${name}`) &&
            !route.some((w) => w.name === name)
          ) {
            if (name === target) {
              candidateMap.set(`${r[0].name}-${r[1].name}-${name}`, [
                r[0],
                r[1],
                {
                  name,
                  category: datasetConfig[name].category,
                  link: value.link.reverse.label,
                },
              ]);
            }
          }
        }
      });
    });

    NProgress.start();
    const result = (
      await Promise.all(
        Array.from(candidateMap.values(), async (v) => {
          // 変換結果を取得
          const convert = await executeQuery({
            route: route.concat(v),
            ids: ids,
            report: "target",
            limit: 10000,
          }).catch(() => null);
          NProgress.inc(1 / candidateMap.size);

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
          {/* {activeTab === "ANNOTATE" && (
            <Annotate
              databaseNodesList={databaseNodesList}
              route={route}
              setRoute={setRoute}
            />
          )}
          {activeTab === "LABEL2LD" && <LabelToId />} */}
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
