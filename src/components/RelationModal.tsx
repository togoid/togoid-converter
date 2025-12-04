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
        <div className="modal--through__description">
          <p>{props.v.relation?.description}</p>
        </div>
      </div>
    </div>
  );
};

export default RelationModal;
