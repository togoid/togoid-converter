import ReactMarkdown from "react-markdown";

type Props = {
  datasetKey: string;
  language: "en" | "ja";
} & React.HTMLAttributes<HTMLDivElement>;

const DatasetsDescription = ({ datasetKey, language, ...rest }: Props) => {
  const { datasetConfig, descriptionConfig } = useConfig();

  return (
    <div {...rest}>
      {language === "ja" && datasetConfig[datasetKey].description_ja ? (
        <ReactMarkdown
          components={{
            a: ({ node, ...props }) => (
              <a {...props} target="_blank" rel="noopener noreferrer" />
            ),
          }}
        >
          {datasetConfig[datasetKey].description_ja}
        </ReactMarkdown>
      ) : datasetConfig[datasetKey].description ? (
        <ReactMarkdown
          components={{
            a: ({ node, ...props }) => (
              <a {...props} target="_blank" rel="noopener noreferrer" />
            ),
          }}
        >
          {datasetConfig[datasetKey].description}
        </ReactMarkdown>
      ) : (
        <>
          <p>{descriptionConfig[datasetKey][`description_${language}`]}</p>
          <p>
            Cited from{" "}
            <a
              href={`https://catalog.integbio.jp/dbcatalog/record/${datasetConfig[datasetKey].catalog}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Integbio Database Catalog
            </a>
          </p>
        </>
      )}
    </div>
  );
};

export default DatasetsDescription;
