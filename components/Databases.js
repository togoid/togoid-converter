import React from "react";

const Databases = () => (
  <div className="home">
    <main className="main">
      <div className="drawing_area">
        <div className="database">
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

            <article className="database__item">
              <h3 className="title">
                <img
                  src="/images/icon_rat.png"
                  alt="アイコン画像：ラット"
                  className="icon"
                />
                <span className="text">ChEMBL compound</span>
              </h3>
              <div className="description">
                ChEMBL is a manually curated database of bioactive molecules
                with drug-like properties. It brings together chemical,
                bioactivity and genomic data to aid the translation of genomic
                information into effective new drugs.
              </div>

              <div className="path">
                <div className="path_label small white">LINK TO</div>
                <svg className="icon" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M4,15V9H12V4.16L19.84,12L12,19.84V15H4Z"
                  />
                </svg>
                <div htmlFor="result" className="path_label small green">
                  <span className="path_label__inner">
                    <img
                      src="/images/icon_rat.png"
                      alt="アイコン画像：ラット"
                      className="icon"
                    />
                    HGNC
                  </span>
                </div>
                <div htmlFor="result" className="path_label small purple">
                  <span className="path_label__inner">
                    <img
                      src="/images/icon_rat.png"
                      alt="アイコン画像：ラット"
                      className="icon"
                    />
                    HGNC
                  </span>
                </div>
              </div>

              <dl className="data">
                <div className="data__wrapper">
                  <dt>PREFIX</dt>
                  <dd>http://identifiers.org/chembl.compound/</dd>
                </div>
                <div className="data__wrapper">
                  <dt>TYPE</dt>
                  <dd>Chemical compound</dd>
                </div>
                <div className="data__wrapper">
                  <dt>DATE</dt>
                  <dd>2021/02/17</dd>
                </div>
                <div className="data__wrapper">
                  <dt>HOST</dt>
                  <dd>hogehoge</dd>
                </div>
                <div className="data__wrapper">
                  <dt>RECORD</dt>
                  <dd>765,460 entries</dd>
                </div>
              </dl>
            </article>
            <article className="database__item">
              <h3 className="title">
                <img
                  src="/images/icon_rat.png"
                  alt="アイコン画像：ラット"
                  className="icon"
                />
                <span className="text">ChEMBL compound</span>
              </h3>
              <div className="description">
                ChEMBL is a manually curated database of bioactive molecules
                with drug-like properties. It brings together chemical,
                bioactivity and genomic data to aid the translation of genomic
                information into effective new drugs.
              </div>

              <div className="path">
                <div className="path_label small white">LINK TO</div>
                <svg className="icon" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M4,15V9H12V4.16L19.84,12L12,19.84V15H4Z"
                  />
                </svg>
                <div htmlFor="result" className="path_label small green">
                  <span className="path_label__inner">
                    <img
                      src="/images/icon_rat.png"
                      alt="アイコン画像：ラット"
                      className="icon"
                    />
                    HGNC
                  </span>
                </div>
                <div htmlFor="result" className="path_label small purple">
                  <span className="path_label__inner">
                    <img
                      src="/images/icon_rat.png"
                      alt="アイコン画像：ラット"
                      className="icon"
                    />
                    HGNC
                  </span>
                </div>
              </div>

              <dl className="data">
                <div className="data__wrapper">
                  <dt>PREFIX</dt>
                  <dd>http://identifiers.org/chembl.compound/</dd>
                </div>
                <div className="data__wrapper">
                  <dt>TYPE</dt>
                  <dd>Chemical compound</dd>
                </div>
                <div className="data__wrapper">
                  <dt>DATE</dt>
                  <dd>2021/02/17</dd>
                </div>
                <div className="data__wrapper">
                  <dt>HOST</dt>
                  <dd>hogehoge</dd>
                </div>
                <div className="data__wrapper">
                  <dt>RECORD</dt>
                  <dd>765,460 entries</dd>
                </div>
              </dl>
            </article>
          </div>
        </div>
      </div>
    </main>
  </div>
);

export default Databases;
