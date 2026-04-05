// WebAPI allowlist for info1 runtime
// Only APIs registered here can be called via webapi.get_json()

export interface ApiEndpoint {
  name: string;
  description: string;
  url: (params: Record<string, string>) => string;
  mockResponse?: unknown; // Fallback mock when fetch fails
}

export const API_ALLOWLIST: ApiEndpoint[] = [
  {
    name: "zipcode",
    description: "郵便番号 → 住所検索",
    url: (p) => `https://zipcloud.ibsnet.co.jp/api/search?zipcode=${encodeURIComponent(p.code ?? "")}`,
    mockResponse: {
      results: [
        {
          zipcode: "1000001",
          address1: "東京都",
          address2: "千代田区",
          address3: "千代田",
        },
      ],
    },
  },
  {
    name: "weather_mock",
    description: "天気情報（モック）",
    url: () => "",
    mockResponse: {
      city: "Tokyo",
      temp: 22,
      description: "晴れ",
    },
  },
];

export function findEndpoint(name: string): ApiEndpoint | undefined {
  return API_ALLOWLIST.find((e) => e.name === name);
}
