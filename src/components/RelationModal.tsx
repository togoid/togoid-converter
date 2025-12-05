import { useClickAway } from "react-use";
import ReactMarkdown from "react-markdown";

type Props = {
  setIsShowRelationModal: Dispatch<SetStateAction<boolean>>;
  v: any;
};

const RelationModal = ({ setIsShowRelationModal, ...props }: Props) => {
  const [language, setLanguage] = useState<"en" | "ja">("en");

  const ref = useRef(null);
  useClickAway(ref, () => {
    setIsShowRelationModal(false);
  });

  return (
    <div className="modal modal--through">
      <div ref={ref} className="modal__inner modal__inner--through">
        <button
          onClick={() => setIsShowRelationModal(false)}
          className="modal--through__close"
        />
        {props.v.relation.description_ja && (
          <LanguageButton language={language} setLanguage={setLanguage} />
        )}
        <div className="modal--through__description">
          <ReactMarkdown
            components={{
              a: ({ node, ...props }) => (
                <a {...props} target="_blank" rel="noopener noreferrer" />
              ),
            }}
          >
            {language === "ja" && props.v.relation.description_ja
              ? props.v.relation.description_ja
              : props.v.relation.description}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default RelationModal;
