import { activeTabAtom } from "@/atoms/tab";

const TabWrapper = (props: any) => {
  const [activeTab, setActiveTab] = useAtom(activeTabAtom);

  return (
    <div className="tab_wrapper">
      <button
        onClick={() => {
          props.changeIndexTab("EXPLORE"), setActiveTab("EXPLORE");
        }}
        className={activeTab === "EXPLORE" ? "button_tab active" : "button_tab"}
      >
        EXPLORE
      </button>
      <button
        onClick={() => {
          props.changeIndexTab("NAVIGATE"), setActiveTab("NAVIGATE");
        }}
        className={
          activeTab === "NAVIGATE" ? "button_tab active" : "button_tab"
        }
      >
        NAVIGATE
      </button>
      <button
        onClick={() => {
          props.changeIndexTab("ANNOTATE"), setActiveTab("ANNOTATE");
        }}
        className={
          activeTab === "ANNOTATE" ? "button_tab active" : "button_tab"
        }
      >
        ANNOTATE
      </button>
      <button
        onClick={() => {
          props.changeIndexTab("DATASETS"), setActiveTab("DATASETS");
        }}
        className={
          activeTab === "DATASETS" ? "button_tab active" : "button_tab"
        }
      >
        DATASETS
      </button>
      <button
        onClick={() => {
          props.changeIndexTab("DOCUMENTS"), setActiveTab("DOCUMENTS");
        }}
        className={
          activeTab === "DOCUMENTS" ? "button_tab active" : "button_tab"
        }
      >
        DOCUMENTS
      </button>
    </div>
  );
};

export default TabWrapper;
