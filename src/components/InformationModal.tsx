const InformationModal = (props) => {
  const [language, setLanguage] = useState("en");

  const { datasetConfig, descriptionConfig } = useConfig();

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
          {datasetConfig[props.database].label}
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
          {Object.prototype.hasOwnProperty.call(
            descriptionConfig,
            props.database,
          ) &&
            descriptionConfig[props.database][`description_${language}`] && (
              <div>
                <p>
                  {descriptionConfig[props.database][`description_${language}`]}
                </p>
                <p>
                  Cited from{" "}
                  <a
                    href={`https://integbio.jp/dbcatalog/record/${
                      datasetConfig[props.database].catalog
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

        <div className="modal--through__buttons path">
          <div className="path_label small white">LINK TO</div>
          <svg className="arrow" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M4,15V9H12V4.16L19.84,12L12,19.84V15H4Z"
            />
          </svg>
          <div className="path_children">
            {[...datasetConfig[props.database].linkTo].map(([v, count], i) => (
              <div
                className="path_label small green"
                style={{
                  backgroundColor: categories[datasetConfig[v].category]
                    ? categories[datasetConfig[v].category].color
                    : null,
                }}
                key={i}
              >
                {datasetConfig[v].label}
                <span>{count}</span>
              </div>
            ))}
          </div>
        </div>

        <dl className="modal--through__data_list">
          <div className="modal--through__data_list__item">
            <dt>PREFIX</dt>
            <dd>{datasetConfig[props.database].prefix}</dd>
          </div>
          <div className="modal--through__data_list__item">
            <dt>CATEGORY</dt>
            <dd>{datasetConfig[props.database].category}</dd>
          </div>
          {Object.prototype.hasOwnProperty.call(
            descriptionConfig,
            props.database,
          ) &&
            descriptionConfig[props.database][`organization_${language}`] && (
              <div className="modal--through__data_list__item">
                <dt>ORGANIZATION</dt>
                <dd>
                  {
                    descriptionConfig[props.database][
                      `organization_${language}`
                    ]
                  }
                </dd>
              </div>
            )}
        </dl>
      </div>
    </div>
  );
};

export default InformationModal;
