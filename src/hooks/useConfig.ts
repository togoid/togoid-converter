import axios from "axios";
import useSWR from "swr";

const configFetcher = async () => {
  const res = await Promise.all([
    axios.get<DatasetConfig>(
      `${process.env.NEXT_PUBLIC_API_ENDPOINT}/config/dataset`,
    ),
    axios.get<RelationConfig>(
      `${process.env.NEXT_PUBLIC_API_ENDPOINT}/config/relation`,
    ),
    axios.get<DescriptionConfig>(
      `${process.env.NEXT_PUBLIC_API_ENDPOINT}/config/descriptions`,
    ),
    axios.get(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/config/statistics`),
  ]);

  const relationConfig = res[1].data;
  const descriptionConfig = res[2].data;
  const statisticConfig = res[3].data as {
    [key: string]: { count: number; last_updated_at: string };
  };

  const datasetConfig = Object.entries(res[0].data).reduce(
    (prev, [key, value]) => {
      const linkTo = new Map();
      Object.keys(relationConfig).forEach((k) => {
        const names = k.split("-");
        if (names[0] === key) {
          linkTo.set(names[1], statisticConfig[k]?.count);
        }
      });

      Object.keys(relationConfig).forEach((k) => {
        const names = k.split("-");
        if (names[1] === key && !linkTo.has(names[0])) {
          linkTo.set(names[0], statisticConfig[k]?.count);
        }
      });

      return {
        ...prev,
        [key]: { ...value, linkTo },
      };
    },
    {} as DatasetConfig,
  );

  return {
    datasetConfig,
    relationConfig,
    descriptionConfig,
  };
};

/**
 * @param {boolean} [isFetch] fetcherの実行有無
 */
const useConfig = (isFetch?: boolean) => {
  const {
    data: { datasetConfig, relationConfig, descriptionConfig },
  } = useSWR("config", isFetch ? configFetcher : null, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    fallbackData: {
      datasetConfig: {},
      relationConfig: {},
      descriptionConfig: {},
    },
  });

  return {
    datasetConfig,
    relationConfig,
    descriptionConfig,
  };
};

export default useConfig;
