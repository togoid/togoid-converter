/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState, useEffect } from "react";
import useConfig from "../hooks/useConfig";
import { categories, colorLegendList } from "../lib/setting";

const Databases = (props) => {
  const [language, setLanguage] = useState("en");
  const [nameIndex, setNameIndex] = useState([]);
  const [datasetHaveLinkObj, setDatasetHaveLinkObj] = useState({});
  const [datasetFilterObj, setDatasetFilterObj] = useState({});

  const { datasetConfig: dbCatalogue, descriptionConfig: dbDesc } = useConfig();

  useEffect(() => {
    setDatasetHaveLinkObj(dbCatalogue);
    createNameIndexList(dbCatalogue);
    setDatasetFilterObj(dbCatalogue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createNameIndexList = (dataset) => {
    // Dataset Name Index のリストを作成
    setNameIndex([
      ...new Set(Object.keys(dataset).map((v) => v.slice(0, 1).toUpperCase())),
    ]);
  };

  const handleCategoryFilter = (input) => {
    const filterDataset = Object.entries(datasetHaveLinkObj).reduce(
      (prev, [key, value]) => {
        return value.category === input ? { ...prev, [key]: value } : prev;
      },
      {}
    );

    createNameIndexList(filterDataset);
    setDatasetFilterObj(filterDataset);
  };

  const handleResetfilter = () => {
    createNameIndexList(datasetHaveLinkObj);
    setDatasetFilterObj(datasetHaveLinkObj);
  };

  const clickExamples = (examples, key) => {
    props.executeExamples(examples.join("\n"), key);
  };

  return (
    <div className="home">
      <main className="main">
        <div className="drawing_area">
          <div className="database">
            <div className="database__inner">
              <div className="select_lang">
                <div className="radio">
                  <input
                    type="radio"
                    id="en"
                    name="en"
                    value="en"
                    className="radio__input"
                    style={{ width: "20px", height: "20px" }}
                    onChange={() => setLanguage("en")}
                    checked={language === "en"}
                  />
                  <label htmlFor="en" className="radio__label">
                    en
                  </label>
                </div>
                <div className="radio">
                  <input
                    type="radio"
                    id="ja"
                    name="ja"
                    value="ja"
                    className="radio__input"
                    style={{ width: "20px", height: "20px" }}
                    onChange={() => setLanguage("ja")}
                    checked={language === "ja"}
                  />
                  <label htmlFor="ja" className="radio__label">
                    ja
                  </label>
                </div>
              </div>

              <section className="database__index">
                <section className="database__index__names">
                  <h3 className="database__index__title">Dataset Name Index</h3>
                  <section className="database__index__links">
                    {nameIndex.map((v, i) => (
                      <a href={"/#" + v} key={i}>
                        {v + " "}
                      </a>
                    ))}
                  </section>
                </section>
              </section>

              <section className="database__index">
                <h3 className="database__index__title">Color Legend</h3>
                <button onClick={handleResetfilter}>Reset</button>
                <section className="database__index__colors">
                  {colorLegendList.map((v, i) => (
                    <div key={i} className="color">
                      <input
                        type="radio"
                        id={v.color}
                        name="color"
                        className="color__input"
                      />
                      <label htmlFor={v.color} className="label">
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
                              className="text"
                            >
                              {v2}
                            </span>
                          </span>
                        ))}
                      </label>
                    </div>
                  ))}
                </section>
              </section>

              {Object.keys(datasetFilterObj).map((key) => (
                <article
                  className="database__item"
                  key={key}
                  id={dbCatalogue[key].label.slice(0, 1).toUpperCase()}
                >
                  <h3
                    className="title"
                    id={dbCatalogue[key].label.replace(/\s/g, "")}
                  >
                    <span
                      className="title__square"
                      style={{
                        backgroundColor: categories[dbCatalogue[key].category]
                          ? categories[dbCatalogue[key].category].color
                          : null,
                      }}
                    />
                    <span className="title__text">
                      {dbCatalogue[key].label}
                    </span>
                  </h3>
                  {dbDesc[key] && dbDesc[key][`description_${language}`] && (
                    <div className="description">
                      <p>{dbDesc[key][`description_${language}`]}</p>
                      <p>
                        Cited from{" "}
                        <a
                          href={`https://integbio.jp/dbcatalog/record/${dbCatalogue[key].catalog}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Integbio Database Catalog
                        </a>
                      </p>
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
                        dbCatalogue[l] ? (
                          <a
                            href={
                              "/#" + dbCatalogue[l].label.replace(/\s/g, "")
                            }
                            key={i}
                          >
                            <div
                              className="path_label small green"
                              style={{
                                backgroundColor: categories[
                                  dbCatalogue[l].category
                                ]
                                  ? categories[dbCatalogue[l].category].color
                                  : null,
                              }}
                              key={i}
                            >
                              {dbCatalogue[l].label}
                              <span>{count}</span>
                            </div>
                          </a>
                        ) : null
                      )}
                    </div>
                  </div>
                  <dl className="data">
                    <div className="data__wrapper">
                      <dt>PREFIX</dt>
                      <dd>{dbCatalogue[key].prefix}</dd>
                    </div>
                    <div className="data__wrapper">
                      <dt>CATEGORY</dt>
                      <dd>{dbCatalogue[key].category}</dd>
                    </div>
                    {dbDesc[key] && dbDesc[key][`organization_${language}`] && (
                      <div className="data__wrapper">
                        <dt>ORGANIZATION</dt>
                        <dd>{dbDesc[key][`organization_${language}`]}</dd>
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
                    {dbCatalogue[key].examples && (
                      <div className="data__wrapper">
                        <dt>EXAMPLES</dt>
                        <dd>
                          {dbCatalogue[key].examples.map((example, i) => (
                            <li key={i}>
                              <a
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  clickExamples(example, key);
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

export default Databases;
