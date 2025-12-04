const LanguageButton = ({
  language,
  setLanguage,
}: {
  language: "en" | "ja";
  setLanguage: (language: "en" | "ja") => void;
}) => {
  return (
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
  );
};

export default LanguageButton;
