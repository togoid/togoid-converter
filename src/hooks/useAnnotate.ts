// @ts-check
import axios from "axios";
import useSWRImmutable from "swr/immutable";

/**
 * @param {{ id: string[]; name: string }} key
 */
const fetcher = async (key) => {
  if (!key.id || !key.name) {
    // idかnameがない時は取得不可能
    return undefined;
  }

  const response = await axios({
    url: "https://rdfportal.org/grasp-togoid",
    method: "POST",
    data: {
      query: `query {
        ${key.name}(id: ${JSON.stringify(key.id)}) {
          iri
          id
          label
        }
      }`,
    },
  });

  return Object.values(response.data.data)[0];
};

/**
 * @param {string[] | null} id
 * @param {string | null} name
 */
const useAnnotate = (id, name) => {
  const { data } = useSWRImmutable(
    {
      id: id,
      name: name,
    },
    fetcher,
  );

  return data;
};

export default useAnnotate;
