// WebAPI safe transport layer for info1 runtime

import { findEndpoint } from "./allowlist";
import type { Value } from "./value";
import { NONE, strVal, numVal, boolVal, listVal } from "./value";
import { RuntimeError } from "./environment";

const FETCH_TIMEOUT_MS = 5000;

function jsonToValue(json: unknown): Value {
  if (json === null || json === undefined) return NONE;
  if (typeof json === "number")  return numVal(json);
  if (typeof json === "string")  return strVal(json);
  if (typeof json === "boolean") return boolVal(json);
  if (Array.isArray(json))       return listVal(json.map(jsonToValue));
  if (typeof json === "object") {
    // Convert object to a module-like value with attribute access
    const attrs: Record<string, Value> = {};
    for (const [k, v] of Object.entries(json as Record<string, unknown>)) {
      attrs[k] = jsonToValue(v);
    }
    return { kind: "module", name: "<json>", attrs };
  }
  return strVal(String(json));
}

export async function callWebApi(
  name: string,
  params: Record<string, string>,
  useMock = false,
): Promise<Value> {
  const endpoint = findEndpoint(name);
  if (!endpoint) {
    throw new RuntimeError(
      `WebAPI "${name}" は許可リストに登録されていません。` +
      `使用可能なAPI: ${["zipcode", "weather_mock"].join(", ")}`,
    );
  }

  // Return mock response immediately if requested or URL is empty
  if (useMock || !endpoint.url(params)) {
    return jsonToValue(endpoint.mockResponse ?? null);
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const response = await fetch(endpoint.url(params), {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    clearTimeout(timer);

    if (!response.ok) {
      throw new RuntimeError(
        `WebAPI "${name}" がエラーを返しました (HTTP ${response.status})`,
      );
    }

    const json = await response.json();
    return jsonToValue(json);
  } catch (err) {
    if (err instanceof RuntimeError) throw err;
    // Network error: fall back to mock
    if (endpoint.mockResponse !== undefined) {
      return jsonToValue(endpoint.mockResponse);
    }
    throw new RuntimeError(
      `WebAPI "${name}" の呼び出しに失敗しました: ${(err as Error).message}`,
    );
  }
}
