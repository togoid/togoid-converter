import useSWRImmutable from "swr/immutable";
import axios from "axios";
import ReactMarkdown from "react-markdown";

const HeaderNews = () => {
  const { data: news } = useSWRImmutable("news", async () => {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_DOCUMENT_ENDPOINT}/news.md`,
    );

    return res.data;
  });

  return (
    <div className="header__news">
      <details className="news-list" open>
        <summary className="news-list__summary">History</summary>
        <div className="news-list__list">
          <ReactMarkdown>{news}</ReactMarkdown>
        </div>
      </details>
    </div>
  );
};

export default HeaderNews;
