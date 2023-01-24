// @ts-check
import axios from "axios";
import useSWR from "swr";

const configFetcher = async () => {
  const res = await Promise.all([
    axios.get(`${process.env.NEXT_PUBLIC_API_ENDOPOINT}/config/dataset`),
    axios.get(`${process.env.NEXT_PUBLIC_API_ENDOPOINT}/config/relation`),
    axios.get(`${process.env.NEXT_PUBLIC_API_ENDOPOINT}/config/descriptions`),
    axios.get(`${process.env.NEXT_PUBLIC_API_ENDOPOINT}/config/statistics`),
  ]);

  return {
    datasetConfig: res[0].data,
    relationConfig: res[1].data,
    descriptionConfig: res[2].data,
    statisticConfig: res[3].data,
  };
};

/**
 * @param {boolean} [isFetch] fetcherの実行有無
 */
const useConfig = (isFetch) => {
  const {
    data: { datasetConfig, relationConfig, descriptionConfig, statisticConfig },
  } = useSWR("config", isFetch ? configFetcher : null, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    fallbackData: {
      datasetConfig: {},
      relationConfig: {},
      descriptionConfig: {},
      statisticConfig: {},
    },
  });

  return {
    datasetConfig,
    relationConfig,
    descriptionConfig,
    statisticConfig,
  };
};

export default useConfig;
