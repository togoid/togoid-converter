import React, { useState } from "react";
import dataset from "../public/dataset.json";
import dbConfig from "../public/config.json";
import dbCatalogue from "../public/dataset.json";
import { categories } from "../lib/setting";

const Databases = () => {
  const [language, setLanguage] = useState("en");
  return (
    <div className="home">
      <main className="main">
        <div className="drawing_area">
          <div className="database">
            <div>
              <input
                type="radio"
                name="en"
                value="en"
                style={{ width: "20px", height: "20px" }}
                onChange={() => setLanguage("en")}
                checked={language === "en"}
              />
              <label>en</label>
              <input
                type="radio"
                name="ja"
                value="ja"
                style={{ width: "20px", height: "20px" }}
                onChange={() => setLanguage("ja")}
                checked={language === "ja"}
              />
              <label>ja</label>
            </div>
            <div className="database__inner">
              <div className="database__top">
                <div className="input_search">
                  <svg className="input_search__icon" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"
                    />
                  </svg>
                  <input type="text" className="input_search__input" />
                </div>
              </div>
              {Object.keys(dataset).map((key) => {
                const labels = Object.keys(dbConfig)
                  .map((k, i) => {
                    const names = k.split("-");
                    if (names.indexOf(key) === 0 || names.indexOf(key) === 1) {
                      const name =
                        names.indexOf(key) === 0 ? names[1] : names[0];
                      const label = dbCatalogue[name].label;
                      return (
                        <div
                          className="path_label small green"
                          style={{
                            backgroundColor: categories[
                              dbCatalogue[name].category
                            ]
                              ? categories[dbCatalogue[name].category].color
                              : null,
                          }}
                          key={i}
                        >
                          {label}
                        </div>
                      );
                    }
                  })
                  .filter((v) => v);

                if (labels.length) {
                  return (
                    <article className="database__item" key={key}>
                      <h3 className="title">
                        <span className="text">{dataset[key].label}</span>
                      </h3>
                      {language === "en" && (
                        <div className="description">
                          {dataset[key].description_en}
                        </div>
                      )}
                      {language === "ja" && (
                        <div className="description">
                          {dataset[key].description_ja}
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
                        <div className="path__children">{labels}</div>
                      </div>
                      <dl className="data">
                        <div className="data__wrapper">
                          <dt>PREFIX</dt>
                          <dd>{dataset[key].prefix}</dd>
                        </div>
                        <div className="data__wrapper">
                          <dt>CATEGORY</dt>
                          <dd>{dataset[key].category}</dd>
                        </div>
                        {dataset[key].organization_en && language === "en" && (
                          <div className="data__wrapper">
                            <dt>ORGANIZATION</dt>
                            <dd>{dataset[key].organization_en}</dd>
                          </div>
                        )}
                        {dataset[key].organization_ja && language === "ja" && (
                          <div className="data__wrapper">
                            <dt>ORGANIZATION</dt>
                            <dd>{dataset[key].organization_ja}</dd>
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
