import { useClickAway } from "react-use";
import LanguageButton from "@/components/LanguageButton";

type Props = {
  setIsShowInfomationModal: Dispatch<SetStateAction<boolean>>;
  database: any;
};

const InformationModal = ({ setIsShowInfomationModal, ...props }: Props) => {
  const [language, setLanguage] = useState<"en" | "ja">("en");

  const { datasetConfig, descriptionConfig } = useConfig();

  const ref = useRef(null);
  useClickAway(ref, () => {
    setIsShowInfomationModal(false);
  });

  return (
    <div className="modal modal--through">
      <div ref={ref} className="modal__inner modal__inner--through">
        <button
          onClick={() => setIsShowInfomationModal(false)}
          className="modal--through__close"
        />
        <h2 className="modal--through__title">
          {datasetConfig[props.database].label}
        </h2>
        <LanguageButton language={language} setLanguage={setLanguage} />
        {datasetConfig[props.database].description ||
          (descriptionConfig[props.database]?.[`description_${language}`] && (
            <div className="modal--through__description">
              {datasetConfig[props.database].description ? (
                <p>{datasetConfig[props.database].description}</p>
              ) : (
                <>
                  <p>
                    {
                      descriptionConfig[props.database][
                        `description_${language}`
                      ]
                    }
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
                </>
              )}
            </div>
          ))}

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
                  // @ts-expect-error
                  backgroundColor: categories[datasetConfig[v].category]
                    ? // @ts-expect-error
                      categories[datasetConfig[v].category].color
                    : null,
                }}
                key={i}
              >
                {datasetConfig[v].label}
                <span className="total">{count}</span>
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
