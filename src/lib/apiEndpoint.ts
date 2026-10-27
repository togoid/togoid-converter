/**
 * APIの接続先を返す
 * NEXT_PUBLIC_API_ENDPOINT_TS が設定されているビルドでのみ、URLにクエリパラメータ ?api=ts が付いているときだけ接続先をそちらに切り替える
 */
export const getApiEndpoint = () => {
  const tsEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT_TS;

  if (
    tsEndpoint &&
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("api") === "ts"
  ) {
    return tsEndpoint;
  }

  return process.env.NEXT_PUBLIC_API_ENDPOINT;
};
