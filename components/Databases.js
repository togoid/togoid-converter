import React, { useState } from "react";
import dbCatalogue from "../public/dataset.json";
import { categories } from "../lib/setting";

const Databases = (props) => {
  const [language, setLanguage] = useState("en");

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

              <div className="database__index">
                <h3>DB Name Index</h3>
                {(() => {
                  const labelIndex = [];
                  return Object.keys(dbCatalogue).map((key, i) => {
                    const keyInitial = dbCatalogue[key].label
                      .slice(0, 1)
                      .toUpperCase();
                    if (
                      Object.keys(props.dbConfig).find(
                        (k) =>
                          (k.split("-").indexOf(key) === 0 ||
                            k.split("-").indexOf(key) === 1) &&
                          !labelIndex.includes(keyInitial)
                      )
                    ) {
                      labelIndex.push(keyInitial);
                      return (
                        <a href={"/#" + keyInitial} key={i}>
                          {keyInitial + " "}
                        </a>
                      );
                    }
                  });
                })()}
              </div>

              {Object.keys(dbCatalogue).map((key) => {
                const labels = Array.from(
                  new Set(
                    Object.keys(props.dbConfig).map((k) => {
                      const names = k.split("-");
                      if (
                        names.indexOf(key) === 0 ||
                        names.indexOf(key) === 1
                      ) {
                        return names.indexOf(key) === 0 ? names[1] : names[0];
                      }
                    })
                  )
                ).filter((v) => v);

                if (labels.length) {
                  return (
                    <article
                      className="database__item"
                      key={key}
                      id={dbCatalogue[key].label.slice(0, 1).toUpperCase()}
                    >
                      <h3 className="title">
                        <span className="text">{dbCatalogue[key].label}</span>
                      </h3>
                      {dbCatalogue[key][`description_${language}`] && (
                        <div className="description">
                          <p>{dbCatalogue[key][`description_${language}`]}</p>
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
                          {labels.map((l, i) => (
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
                            </div>
                          ))}
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
                        {dbCatalogue[key].organization_en && language === "en" && (
                          <div className="data__wrapper">
                            <dt>ORGANIZATION</dt>
                            <dd>{dbCatalogue[key].organization_en}</dd>
                          </div>
                        )}
                        {dbCatalogue[key].organization_ja && language === "ja" && (
                          <div className="data__wrapper">
                            <dt>ORGANIZATION</dt>
                            <dd>{dbCatalogue[key].organization_ja}</dd>
                          </div>
                        )}
                        {dbCatalogue[key].examples && (
                          <div className="data__wrapper">
                            <dt>EXAMPLES</dt>
                            <dd>
                              {dbCatalogue[key].examples.map((example, i) => {
                                return (
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
                                );
                              })}
                            </dd>
                          </div>
                        )}
                      </dl>
                    </article>
                  );
                }
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Databases;
