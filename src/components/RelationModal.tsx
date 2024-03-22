import { useClickAway } from "react-use";

type Props = {
  setIsShowRelationModal: Dispatch<SetStateAction<boolean>>;
  v: any;
};

const RelationModal = ({ setIsShowRelationModal, ...props }: Props) => {
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
        <h2 className="modal--through__title">Relation</h2>
        <div className="modal--through__description">
          <p>{props.v.relationDescription}</p>
        </div>
      </div>
    </div>
  );
};

export default RelationModal;
