const TabWrapper = (props) => (
  <div className="tab_wrapper">
    <button
      onClick={() => props.changeIndexTab("NAVIGATE")}
      className={
        props.activeTab === "NAVIGATE" ? "button_tab active" : "button_tab"
      }
    >
      NAVIGATE
    </button>
    <button
      onClick={() => props.changeIndexTab("EXPLORE")}
      className={
        props.activeTab === "EXPLORE" ? "button_tab active" : "button_tab"
      }
    >
      EXPLORE
    </button>
    <button
      onClick={() => props.changeIndexTab("DATABASE")}
      className={
        props.activeTab === "DATABASE" ? "button_tab active" : "button_tab"
      }
    >
      DATABASES
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
