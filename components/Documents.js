import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";

const Documents = () => {
  const [language, setLanguage] = useState("en");
  const [docs, setDocs] = useState("");

  useEffect(() => {
    fetch(
      `https://raw.githubusercontent.com/togoid/togoid-config/production/docs/help${
        language === "en" ? "" : "_ja"
      }.md`
    )
      .then((res) => res.text())
      .then((data) => {
        setDocs(data);
      })
      .catch((e) => {
        console.log(e);
      });
  }, [language]);

  return (
    <div className="home">
      <main className="main">
        <div className="documents">
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
          <ReactMarkdown className="markdown-body">{docs}</ReactMarkdown>
        </div>
      </main>
    </div>
  );
};

export default Documents;
