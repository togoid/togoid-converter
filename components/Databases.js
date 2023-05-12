import React, { useState, useEffect } from "react";
import { categories, colorLegendList } from "../lib/setting";

const Databases = (props) => {
  const [language, setLanguage] = useState("en");
  const [nameIndex, setNameIndex] = useState([]);

  useEffect(() => {
    // Dataset Name Index のリストを作成
    const labelIndexList = Array.from(
      new Set(
        Object.keys(props.dbCatalogue)
          .filter((key) =>
            Object.keys(props.dbConfig).find((k) => k.split("-").includes(key))
          )
          .map((v) => v.slice(0, 1).toUpperCase())
      )
    );

    setNameIndex(labelIndexList);
  }, []);

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
              <section className="database__index color">
                <h3 className="database__index__title">Color Legend</h3>
                <section className="database__index__colors">
                  {colorLegendList.map((v, i) => (
                    <div key={i} className="color">
                      <span
                        className="color__square"
                        style={{
                          backgroundColor: v.color,
                        }}
                      />
                      {v.categoryList.map((v2, i2) => (
                        <span key={i2} className="color__label">
                          {i2 > 0 && ", "}
                          {v2}
                        </span>
                      ))}
                    </div>
                  ))}
                </section>
              </section>

              {Object.keys(props.dbCatalogue).map((key) => {
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
                      id={props.dbCatalogue[key].label
                        .slice(0, 1)
                        .toUpperCase()}
                    >
                      <h3
                        className="title"
                        id={props.dbCatalogue[key].label.replace(/\s/g, "")}
                      >
                        <span
                          className="title__square"
                          style={{
                            backgroundColor: categories[
                              props.dbCatalogue[key].category
                            ]
                              ? categories[props.dbCatalogue[key].category]
                                  .color
                              : null,
                          }}
                        />
                        <span className="title__text">
                          {props.dbCatalogue[key].label}
                        </span>
                      </h3>
                      {props.dbDesc[key] &&
                        props.dbDesc[key][`description_${language}`] && (
                          <div className="description">
                            <p>
                              {props.dbDesc[key][`description_${language}`]}
                            </p>
                            <p>
                              Cited from{" "}
                              <a
                                href={`https://integbio.jp/dbcatalog/record/${props.dbCatalogue[key].catalog}`}
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
                          {labels.map((l, i) =>
                            props.dbCatalogue[l] ? (
                              <a
                                href={
                                  "/#" +
                                  props.dbCatalogue[l].label.replace(/\s/g, "")
                                }
                                key={i}
                              >
                                <div
                                  className="path_label small green"
                                  style={{
                                    backgroundColor: categories[
                                      props.dbCatalogue[l].category
                                    ]
                                      ? categories[
                                          props.dbCatalogue[l].category
                                        ].color
                                      : null,
                                  }}
                                  key={i}
                                >
                                  {props.dbCatalogue[l].label}
                                </div>
                              </a>
                            ) : null
                          )}
                        </div>
                      </div>
                      <dl className="data">
                        <div className="data__wrapper">
                          <dt>PREFIX</dt>
                          <dd>{props.dbCatalogue[key].prefix}</dd>
                        </div>
                        <div className="data__wrapper">
                          <dt>CATEGORY</dt>
                          <dd>{props.dbCatalogue[key].category}</dd>
                        </div>
                        {props.dbDesc[key] &&
                          props.dbDesc[key][`organization_${language}`] && (
                            <div className="data__wrapper">
                              <dt>ORGANIZATION</dt>
                              <dd>
                                {props.dbDesc[key][`organization_${language}`]}
                              </dd>
                            </div>
                          )}
                        {props.dbCatalogue[key].examples && (
                          <div className="data__wrapper">
                            <dt>EXAMPLES</dt>
                            <dd>
                              {props.dbCatalogue[key].examples.map(
                                (example, i) => {
                                  /* eslint-disable */
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
                                  /* eslint-enable */
                                }
                              )}
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
