import { createPortal } from "react-dom";

const ExploreResultRelation = (props: any) => {
  const [isShowRelationModal, setIsShowRelationModal] = useState(false);

  return (
    <div
      id={`label${props.i}-${props.j}`}
      className="label_list label_list__item label_list__item__inner"
    >
      <p className="text">{props.v.relation.link.display_label}</p>
      {props.v.relation?.description && (
        <button
          className="circle-button"
          onClick={() => setIsShowRelationModal(true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 6.427 16.004">
            <path
              d="M13.5,4A1.5,1.5,0,1,0,15,5.5,1.5,1.5,0,0,0,13.5,4m-.36,4.77c-1.19.1-4.44,2.69-4.44,2.69-.2.15-.14.14.02.42s.14.29.33.16.53-.34,1.08-.68c2.12-1.36.34,1.78-.57,7.07-.36,2.62,2,1.27,2.61.87s2.21-1.5,2.37-1.61c.22-.15.06-.27-.11-.52-.12-.17-.24-.05-.24-.05-.65.43-1.84,1.33-2,.76-.19-.57,1.03-4.48,1.7-7.17C14,10.07,14.3,8.67,13.14,8.77Z"
              transform="translate(-8.573 -4)"
              fill="#fff"
            />
          </svg>
        </button>
      )}
      {isShowRelationModal &&
        createPortal(
          <RelationModal
            setIsShowRelationModal={setIsShowRelationModal}
            v={props.v}
          />,
          document.body,
        )}
    </div>
  );
};

export default ExploreResultRelation;
