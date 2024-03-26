import useSWRImmutable from "swr/immutable";
import axios from "axios";
import ReactMarkdown from "react-markdown";

const HeaderNews = () => {
  const { data: news } = useSWRImmutable("news", async () => {
    const res = await axios.get(
      `https://raw.githubusercontent.com/togoid/togoid-config/main/docs/news.md`,
    );

    return res.data;
  });

  return (
    <div className="header__news">
      <a
        href="https://github.com/togoid/togoid-config/blob/main/docs/news.md"
        className="link"
      >
        <span>
          Update information :{" "}
          <ReactMarkdown
            allowElement={(_, index) => index === 0}
            components={{
              h1: ({ children }) => (
                <time
                  // @ts-expect-error
                  dateTime={children}
                >
                  {children}
                </time>
              ),
            }}
          >
            {news}
          </ReactMarkdown>
        </span>
      </a>
      <details className="news-list">
        <summary className="news-list__summary">History</summary>
        <div className="news-list__list">
          <ReactMarkdown>{news}</ReactMarkdown>
        </div>
      </details>
    </div>
  );
};

export default HeaderNews;
