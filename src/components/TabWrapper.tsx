// @ts-expect-error
const TabWrapper = (props) => (
  <div className="tab_wrapper">
    <button
      onClick={() => props.changeIndexTab("EXPLORE")}
      className={
        props.activeTab === "EXPLORE" ? "button_tab active" : "button_tab"
      }
    >
      EXPLORE
    </button>
    <button
      onClick={() => props.changeIndexTab("NAVIGATE")}
      className={
        props.activeTab === "NAVIGATE" ? "button_tab active" : "button_tab"
      }
    >
      NAVIGATE
    </button>
    <button
      onClick={() => props.changeIndexTab("LABEL2LD")}
      className={
        props.activeTab === "LABEL2LD" ? "button_tab active" : "button_tab"
      }
    >
      LABEL2ID
    </button>
    <button
      onClick={() => props.changeIndexTab("DATASETS")}
      className={
        props.activeTab === "DATASETS" ? "button_tab active" : "button_tab"
      }
    >
      DATASETS
    </button>
    <button
      onClick={() => props.changeIndexTab("DOCUMENTS")}
      className={
        props.activeTab === "DOCUMENTS" ? "button_tab active" : "button_tab"
      }
    >
      DOCUMENTS
    </button>
  </div>
);

export default TabWrapper;
