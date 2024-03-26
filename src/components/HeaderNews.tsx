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
        <ReactMarkdown>{news}</ReactMarkdown>
        {/* <ul className="news-list__list">
          <li>
            <a href="" className="link">
              <time dateTime="2024-01-10" className="date">
                2024-01-10
              </time>
              <p className="title">Weekly update has been completed.</p>
            </a>
          </li>
          <li>
            <a href="" className="link">
              <time dateTime="2024-01-10" className="date">
                2024-01-10
              </time>
              <p className="title">
                Weekly update has been completed.- Weekly update has been
                completed.- Weekly update has been completed.
              </p>
            </a>
          </li>
        </ul> */}
      </details>
    </div>
  );
};

export default HeaderNews;
