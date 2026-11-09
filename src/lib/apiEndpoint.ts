const ENDPOINTS: Record<string, string> = {
  // TypeScript 版（MySQL）
  ts: "https://d2msbksmqrw746.cloudfront.net",
  // TypeScript 版（SPARQL。MySQL を使わず QLever に問い合わせる）
  sparql: "https://d3gibc551hr6ma.cloudfront.net",
};
const STORAGE_KEY = "apiEndpoint";

/**
 * APIの接続先を返す
 * URLにクエリパラメータ ?api=ts または ?api=sparql を付けると接続先を切り替え、localStorage に保存する
 * (?api=default で解除)
 */
export const getApiEndpoint = () => {
  const defaultEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT;

  if (typeof window === "undefined") {
    return defaultEndpoint;
  }

  try {
    const param = new URLSearchParams(window.location.search).get("api");
    if (param && Object.hasOwn(ENDPOINTS, param)) {
      localStorage.setItem(STORAGE_KEY, param);
    } else if (param === "default") {
      localStorage.removeItem(STORAGE_KEY);
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    return stored && Object.hasOwn(ENDPOINTS, stored)
      ? ENDPOINTS[stored]
      : defaultEndpoint;
  } catch {
    return defaultEndpoint;
  }
};
