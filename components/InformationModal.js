import React, { useState } from "react";
import { categories } from "../lib/setting";

const InformationModal = (props) => {
  const [language, setLanguage] = useState("en");

  const hideInformationModal = () => {
    props.setInformationModal(false);
  };

  return (
    <div
      className="modal modal--through"
      onClick={() => hideInformationModal()}
    >
      <div
        className="modal__inner modal__inner--through"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <button
          onClick={() => hideInformationModal()}
          className="modal--through__close"
        />
        <h2 className="modal--through__title">
          {props.dbCatalogue[props.database].label}
        </h2>
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
        <p className="modal--through__description">
          {Object.prototype.hasOwnProperty.call(props.dbDesc, props.database) &&
            props.dbDesc[props.database][`description_${language}`] && (
              <div>
                <p>{props.dbDesc[props.database][`description_${language}`]}</p>
                <p>
                  Cited from{" "}
                  <a
                    href={`https://integbio.jp/dbcatalog/record/${
                      props.dbCatalogue[props.database].catalog
                    }`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Integbio Database Catalog
                  </a>
                </p>
              </div>
            )}
        </p>
        {(() => {
          const labels = Array.from(
            new Set(
              Object.keys(props.dbConfig).map((k) => {
                const names = k.split("-");
                if (
                  names.indexOf(props.database) === 0 ||
                  names.indexOf(props.database) === 1
                ) {
                  return names.indexOf(props.database) === 0
                    ? names[1]
                    : names[0];
                }
              })
            )
          ).filter((v) => v);

          if (labels.length) {
            return (
              <div className="modal--through__buttons path">
                <div className="path_label small white">LINK TO</div>
                <svg className="arrow" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M4,15V9H12V4.16L19.84,12L12,19.84V15H4Z"
                  />
                </svg>
                <div className="path_children">
                  {labels.map((l, i) => (
                    <div
                      className="path_label small green"
                      style={{
                        backgroundColor: categories[
                          props.dbCatalogue[l].category
                        ]
                          ? categories[props.dbCatalogue[l].category].color
                          : null,
                      }}
                      key={i}
                    >
                      {props.dbCatalogue[l].label}
                    </div>
                  ))}
                </div>
              </div>
            );
          }
        })()}

        <dl className="modal--through__data_list">
          <div className="modal--through__data_list__item">
            <dt>PREFIX</dt>
            <dd>{props.dbCatalogue[props.database].prefix}</dd>
          </div>
          <div className="modal--through__data_list__item">
            <dt>CATEGORY</dt>
            <dd>{props.dbCatalogue[props.database].category}</dd>
          </div>
          {Object.prototype.hasOwnProperty.call(props.dbDesc, props.database) &&
            props.dbDesc[props.database][`organization_${language}`] && (
              <div className="modal--through__data_list__item">
                <dt>ORGANIZATION</dt>
                <dd>
                  {props.dbDesc[props.database][`organization_${language}`]}
                </dd>
              </div>
            )}
        </dl>
      </div>
    </div>
  );
};

export default InformationModal;
