const searchNameIndexSetList = new Set<string>();
const searchCategorySetList = new Set<string>();

type Props = {
  executeExamples: (idList: string[], exampleTarget: string) => void;
};

const Datasets = ({ executeExamples }: Props) => {
  const { datasetConfig, descriptionConfig } = useConfig();

  const [language, setLanguage] = useState<"en" | "ja">("en");
  const [datasetFilterObj, setDatasetFilterObj] = useState(datasetConfig);
  const [searchText, setSearchText] = useState("");

  // Dataset Name Index のリストを作成
  const nameIndex = useMemo(
    () => [
      ...new Set(
        Object.keys(datasetConfig).map((v) => v.slice(0, 1).toUpperCase()),
      ),
    ],
    [datasetConfig],
  );

  const handleNameIndexFilter = (input: string) => {
    searchNameIndexSetList.has(input)
      ? searchNameIndexSetList.delete(input)
      : searchNameIndexSetList.add(input);

    searchDataset(searchText);
  };

  const handleCategoryFilter = (input: string) => {
    searchCategorySetList.has(input)
      ? searchCategorySetList.delete(input)
      : searchCategorySetList.add(input);

    searchDataset(searchText);
  };

  const handleTextfilter = (input: string) => {
    setSearchText(input);

    searchDataset(input);
  };

  const searchDataset = (text: string) => {
    const filterDataset = Object.entries(datasetConfig).reduce(
      (prev, [key, value]) => {
        return (!text ||
          value.label.toLowerCase().includes(text.toLowerCase())) &&
          (!searchCategorySetList.size ||
            searchCategorySetList.has(value.category)) &&
          (!searchNameIndexSetList.size ||
            searchNameIndexSetList.has(key.slice(0, 1).toUpperCase()))
          ? { ...prev, [key]: value }
          : prev;
      },
      {},
    );

    setDatasetFilterObj(filterDataset);
  };

  const handleNameIndexClear = () => {
    searchNameIndexSetList.clear();
    searchDataset(searchText);
  };

  const handleCategoryClear = () => {
    searchCategorySetList.clear();
    searchDataset(searchText);
  };

  return (
    <div className="home">
      <main className="main">
        <div className="drawing_area">
          <div className="database">
            <div className="database__inner">
              <section className="database__lang-keyword">
                <section className="database__lang">
                  <section className="database__index__names">
                    <LanguageButton
                      language={language}
                      setLanguage={setLanguage}
                    />
                    <section className="database__index__links">
                      {nameIndex.map((v, i) => (
                        <button
                          key={i}
                          onClick={() => handleNameIndexFilter(v)}
                          className={
                            searchNameIndexSetList.size === 0 ||
                            searchNameIndexSetList.has(v)
                              ? "text active"
                              : "text"
                          }
                        >
                          {v}
                        </button>
                      ))}
                    </section>
                  </section>
                  <button
                    className="clear-button"
                    onClick={handleNameIndexClear}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 11.708 11.708"
                      className="clear-button__icon"
                    >
                      <path
                        d="M-11780.5,1806.5l-5.5,5.5,5.5-5.5-5.5-5.5,5.5,5.5,5.5-5.5-5.5,5.5,5.5,5.5Z"
                        transform="translate(11786.354 -1800.647)"
                        fill="rgba(0,0,0,0)"
                        stroke="#707070"
                        strokeWidth="1"
                      />
                    </svg>
                    <span className="clear-button__text">Clear</span>
                  </button>
                </section>
                <input
                  type="text"
                  className="database__keyword"
                  value={searchText}
                  onChange={(e) => handleTextfilter(e.target.value)}
                />
              </section>

              <section className="database__index">
                <h3 className="database__index__title">Color Legend</h3>
                <section className="database__index__colors">
                  {colorLegendList.map((v, i) => (
                    <div key={i} className="color">
                      <span
                        className="square"
                        style={{
                          backgroundColor: v.color,
                        }}
                      />
                      {v.categoryList.map((v2, i2) => (
                        <span key={i2}>
                          {i2 > 0 && ", "}
                          <span
                            style={{ cursor: "pointer" }}
                            onClick={() => handleCategoryFilter(v2)}
                            className={
                              searchCategorySetList.size === 0 ||
                              searchCategorySetList.has(v2)
                                ? "text active"
                                : "text"
                            }
                          >
                            {v2}
                          </span>
                        </span>
                      ))}
                    </div>
                  ))}
                </section>
                <button className="clear-button" onClick={handleCategoryClear}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 11.708 11.708"
                    className="clear-button__icon"
                  >
                    <path
                      d="M-11780.5,1806.5l-5.5,5.5,5.5-5.5-5.5-5.5,5.5,5.5,5.5-5.5-5.5,5.5,5.5,5.5Z"
                      transform="translate(11786.354 -1800.647)"
                      fill="rgba(0,0,0,0)"
                      stroke="#707070"
                      strokeWidth="1"
                    />
                  </svg>
                  <span className="clear-button__text">Clear</span>
                </button>
              </section>

              {Object.keys(datasetFilterObj).map((key) => (
                <article
                  className="database__item"
                  key={key}
                  id={datasetConfig[key].label.slice(0, 1).toUpperCase()}
                >
                  <h3
                    className="title"
                    id={datasetConfig[key].label.replace(/\s/g, "")}
                  >
                    <span
                      className="title__square"
                      style={{
                        backgroundColor: categories[datasetConfig[key].category]
                          ? categories[datasetConfig[key].category].color
                          : null,
                      }}
                    />
                    <span className="title__text">
                      {datasetConfig[key].label}
                    </span>
                  </h3>
                  {(datasetFilterObj[key].description ||
                    (descriptionConfig[key] &&
                      descriptionConfig[key][`description_${language}`])) && (
                    <div className="description">
                      {datasetFilterObj[key].description ? (
                        <p>{datasetFilterObj[key].description}</p>
                      ) : (
                        <>
                          <p>
                            {descriptionConfig[key][`description_${language}`]}
                          </p>
                          <p>
                            Cited from{" "}
                            <a
                              href={`https://integbio.jp/dbcatalog/record/${datasetConfig[key].catalog}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Integbio Database Catalog
                            </a>
                          </p>
                        </>
                      )}
                    </div>
                  )}
                  <div className="path">
                    <div className="path_label small white">LINK TO</div>
                    <svg className="icon" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M4,15V9H12V4.16L19.84,12L12,19.84V15H4Z"
                      />
                    </svg>
                    <div className="path__children">
                      {[...datasetFilterObj[key].linkTo].map(([l, count], i) =>
                        datasetConfig[l] ? (
                          <a
                            href={
                              "/#" + datasetConfig[l].label.replace(/\s/g, "")
                            }
                            key={i}
                          >
                            <div
                              className="path_label small green"
                              style={{
                                backgroundColor: categories[
                                  datasetConfig[l].category
                                ]
                                  ? categories[datasetConfig[l].category].color
                                  : null,
                              }}
                              key={i}
                            >
                              {datasetConfig[l].label}
                              <span className="total">{count}</span>
                            </div>
                          </a>
                        ) : null,
                      )}
                    </div>
                  </div>
                  <dl className="data">
                    <div className="data__wrapper">
                      <dt>PREFIX</dt>
                      <dd>{datasetConfig[key].prefix}</dd>
                    </div>
                    <div className="data__wrapper">
                      <dt>CATEGORY</dt>
                      <dd>{datasetConfig[key].category}</dd>
                    </div>
                    {descriptionConfig[key] &&
                      descriptionConfig[key][`organization_${language}`] && (
                        <div className="data__wrapper">
                          <dt>ORGANIZATION</dt>
                          <dd>
                            {descriptionConfig[key][`organization_${language}`]}
                          </dd>
                        </div>
                      )}
                    {datasetFilterObj[key].count && (
                      <div className="data__wrapper">
                        <dt>COUNT</dt>
                        <dd>{datasetFilterObj[key].count}</dd>
                      </div>
                    )}
                    {datasetFilterObj[key].lastUpdatedAt && (
                      <div className="data__wrapper">
                        <dt>LAST UPDATED AT</dt>
                        <dd>{datasetFilterObj[key].lastUpdatedAt}</dd>
                      </div>
                    )}
                    {datasetConfig[key].examples && (
                      <div className="data__wrapper">
                        <dt>EXAMPLES</dt>
                        <dd>
                          {datasetConfig[key].examples.map((example, i) => (
                            <li key={i}>
                              <a
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  executeExamples(example, key);
                                }}
                              >
                                {example.join(", ")}
                              </a>
                            </li>
                          ))}
                        </dd>
                      </div>
                    )}
                  </dl>
                </article>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Datasets;
