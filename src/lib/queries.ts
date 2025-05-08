import axios from "axios";
import { query } from "gql-query-builder";

export const getConvertUrlSearchParams = (baseParams: {
  route: Route[];
  ids: string[];
  report: string;
  format: "csv" | "json";
  limit?: number;
  compact?: boolean;
}) => {
  const params = new URLSearchParams({
    route: baseParams.route
      .map((v, i) => (i === 0 ? v.name : `${v.relation?.link.label},${v.name}`))
      .join(","),
    ids: baseParams.ids.join(","),
    report: baseParams.report,
    format: baseParams.format,
    output: "id",
  });
  if (baseParams.limit) {
    params.set("limit", String(baseParams.limit));
  }
  if (baseParams.compact) {
    params.set("compact", "1");
  }

  return params;
};

export const executeQuery = async <T extends string>(baseParams: {
  route: Route[];
  ids: string[];
  report: T;
  limit?: number;
  compact?: boolean;
}) => {
  return await axios
    .post<{
      ids: string[];
      results: T extends "target" ? string[] : string[][];
      route: string[];
    }>(
      `${process.env.NEXT_PUBLIC_API_ENDOPOINT}/convert`,
      getConvertUrlSearchParams({ ...baseParams, format: "json" }),
    )
    .then((d) => d.data);
};

export const executeCountQuery = async (option: {
  relation: string;
  ids: string[];
  link: string;
}) => {
  return await axios
    .post(
      `${process.env.NEXT_PUBLIC_API_ENDOPOINT}/count/${option.relation}`,
      new URLSearchParams({
        ids: option.ids.join(","),
        link: option.link,
      }),
    )
    .then((d) => d.data);
};

export const executeAnnotateQuery = async (option: {
  name: string;
  ids: string[];
  fields?: string[];
  variables?: {
    [key: string]: {
      value: string[];
      type: string;
    };
  };
}) => {
  const fields = ["id"];
  option.fields?.forEach((v) => {
    fields.push(v);
  });

  const variables: {
    [key: string]: {
      value: string[];
      type: string;
    };
  } = {
    id: {
      value: [...new Set(option.ids)],
      type: "[String!]",
    },
  };
  if (option.variables) {
    Object.assign(variables, option.variables);
  }

  const data = query({
    operation: option.name,
    variables: variables,
    fields: fields,
  });

  const res = await axios.post<{
    data: any[][];
  }>("https://dx.dbcls.jp/grasp-dev-togoid", data);

  return Object.values(res.data.data)[0].reduce(
    (prev, curr) => {
      const { id, ...other } = curr;
      return { ...prev, [id]: other };
    },
    {} as { [key: string]: { [key: string]: string | string[] } },
  ) as { [key: string]: { [key: string]: string | string[] } };
};
