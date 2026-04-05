import type { RuntimeValue } from "./value";

type WebApiHandler = (params: RuntimeValue[]) => RuntimeValue;

const zipTable: Record<string, { prefecture: string; city: string; town: string }> = {
  "1000001": { prefecture: "東京都", city: "千代田区", town: "千代田" },
  "5300001": { prefecture: "大阪府", city: "大阪市北区", town: "梅田" },
};

export function createWebApiHandlers(): Record<string, WebApiHandler> {
  return {
    zip: (params) => {
      const code = String(params[0] ?? "");
      return zipTable[code] ?? { error: "not_found", code };
    },
    weather: () => ({
      area: "tokyo",
      forecast: "sunny",
      high: 24,
      low: 14,
    }),
  };
}
