const TS_ENDPOINT = "https://d2msbksmqrw746.cloudfront.net";
const STORAGE_KEY = "apiEndpoint";

/**
 * APIの接続先を返す
 * URLにクエリパラメータ ?api=ts を付けると接続先を切り替え、localStorage に保存する
 * (?api=default で解除)
 */
export const getApiEndpoint = () => {
  const defaultEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT;

  if (typeof window === "undefined") {
    return defaultEndpoint;
  }

  try {
    const param = new URLSearchParams(window.location.search).get("api");
    if (param === "ts") {
      localStorage.setItem(STORAGE_KEY, "ts");
    } else if (param === "default") {
      localStorage.removeItem(STORAGE_KEY);
    }

    return localStorage.getItem(STORAGE_KEY) === "ts"
      ? TS_ENDPOINT
      : defaultEndpoint;
  } catch {
    return defaultEndpoint;
  }
};
