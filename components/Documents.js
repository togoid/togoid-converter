import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";

const Documents = () => {
  const [docs, setDocs] = useState("");

  useEffect(() => {
    fetch(
      "https://raw.githubusercontent.com/dbcls/togoid-config/docs/docs/help.md"
    )
      .then((res) => res.text())
      .then((data) => {
        setDocs(data);
      })
      .catch((e) => {
        console.log(e);
      });
  }, []);

  return (
    <div className="home">
      <main className="main">
        <div className="drawing_area">
          <ReactMarkdown className="markdown-body">{docs}</ReactMarkdown>
        </div>
      </main>
    </div>
  );
};

export default Documents;
