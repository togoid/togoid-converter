import useSWRImmutable from "swr/immutable";
import axios from "axios";
import ReactMarkdown from "react-markdown";

const Documents = () => {
  const [language, setLanguage] = useState<"en" | "ja">("en");

  const { data: docs } = useSWRImmutable(
    {
      language: language,
    },
    async () => {
      const res = await axios.get(
        `https://raw.githubusercontent.com/togoid/togoid-config/production/docs/help${
          language === "en" ? "" : "_ja"
        }.md`,
      );

      return res.data;
    },
  );

  return (
    <div className="home">
      <main className="main">
        <div className="documents">
          <LanguageButton language={language} setLanguage={setLanguage} />
          <div className="markdown-body">
            <ReactMarkdown>{docs}</ReactMarkdown>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Documents;
