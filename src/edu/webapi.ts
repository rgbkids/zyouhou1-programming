// Safe WebAPI layer for the Jouhou-I sandbox
// Only allows pre-approved endpoints from allowlist.ts

import type { Value, ModuleValue, BuiltinValue } from '../core/value';
import { str } from '../core/value';
import { RuntimeError } from '../core/evaluator';
import { ALLOWED_ENDPOINTS } from './allowlist';

export type WebAPIResult = { ok: true; data: string } | { ok: false; error: string };

/** Mock backend for testing - returns fixed responses */
type MockMap = Record<string, string>;
let mockResponses: MockMap | null = null;

export function setMockResponses(mocks: MockMap | null) {
  mockResponses = mocks;
}

async function fetchAllowlisted(name: string, params: Record<string, string>): Promise<string> {
  if (mockResponses !== null) {
    const key = `${name}:${JSON.stringify(params)}`;
    if (key in mockResponses) return mockResponses[key];
    return '(モックデータなし)';
  }

  const endpoint = ALLOWED_ENDPOINTS[name];
  if (!endpoint) {
    throw new RuntimeError(`webapi: '${name}' is not in the allowed list`, 0);
  }

  const url = endpoint.url(params);
  const resp = await fetch(url);
  if (!resp.ok) throw new RuntimeError(`webapi: HTTP ${resp.status} for '${name}'`, 0);
  const json = await resp.json();
  return endpoint.transform(json);
}

/**
 * Creates the webapi module for the evaluator.
 * Note: Because fetch is async but the evaluator is sync, we use a pre-resolved
 * result cache approach. The UI layer must pre-fetch results before execution,
 * or use an async evaluator wrapper.
 *
 * For simplicity, we provide a sync module that works with pre-resolved results.
 */
export interface WebAPICache {
  get: (name: string, params: Record<string, string>) => string | undefined;
  set: (name: string, params: Record<string, string>, result: string) => void;
}

export function createWebAPIModule(cache: WebAPICache): ModuleValue {
  const get_json: BuiltinValue = {
    type: 'builtin',
    name: 'get_json',
    call: (args: Value[]) => {
      if (args.length < 1 || args[0].type !== 'string') {
        throw new RuntimeError('webapi.get_json() requires a string name', 0);
      }
      const name = args[0].value;
      const params: Record<string, string> = {};
      if (args.length >= 2 && args[1].type === 'string') {
        params.code = args[1].value;
      }
      const cached = cache.get(name, params);
      if (cached !== undefined) return str(cached);
      throw new RuntimeError(`webapi: no result for '${name}' — run in async mode`, 0);
    },
  };

  return {
    type: 'module',
    name: 'webapi',
    attrs: { get_json },
  };
}

/** Pre-fetch all webapi calls found in source code before execution */
export async function prefetchWebAPI(
  source: string,
  cache: WebAPICache,
): Promise<void> {
  // Simple regex scan for webapi.get_json("name", "param") patterns
  const pattern = /webapi\.get_json\(\s*["'](\w+)["']\s*(?:,\s*["']([^"']*)["'])?\s*\)/g;
  const fetches: Promise<void>[] = [];
  let match;
  while ((match = pattern.exec(source)) !== null) {
    const name = match[1];
    const param = match[2] ?? '';
    const params: Record<string, string> = param ? { code: param } : {};
    fetches.push(
      fetchAllowlisted(name, params).then(result => {
        cache.set(name, params, result);
      }).catch(() => {
        cache.set(name, params, '(取得失敗)');
      }),
    );
  }
  await Promise.all(fetches);
}
