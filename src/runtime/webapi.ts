// WebAPI allowlist and safe transport layer

export interface AllowlistEntry {
  /** URL template with {param} placeholders */
  urlTemplate: string;
  description: string;
}

export const WEBAPI_ALLOWLIST: Record<string, AllowlistEntry> = {
  zipcode: {
    urlTemplate: 'https://zipcloud.ibsnet.co.jp/api/search?zipcode={zipcode}',
    description: '郵便番号検索 (zipcloud)',
  },
};

export class WebapiError extends Error {}

export async function webapiGetJson(
  name: string,
  params: Record<string, string>
): Promise<unknown> {
  const entry = WEBAPI_ALLOWLIST[name];
  if (!entry) {
    throw new WebapiError(
      `WebAPI '${name}' は許可リストにありません。利用可能: ${Object.keys(WEBAPI_ALLOWLIST).join(', ')}`
    );
  }

  let url = entry.urlTemplate;
  for (const [k, v] of Object.entries(params)) {
    url = url.replace(`{${k}}`, encodeURIComponent(v));
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) throw new WebapiError(`HTTP エラー: ${res.status}`);
    return await res.json();
  } catch (e) {
    clearTimeout(timer);
    if (e instanceof WebapiError) throw e;
    throw new WebapiError(`WebAPI 呼び出し失敗: ${(e as Error).message}`);
  }
}

/** Mock responses for offline/test use */
export const MOCK_RESPONSES: Record<string, unknown> = {
  zipcode: {
    status: 200,
    results: [{
      zipcode: '1000001',
      prefcode: '13',
      address1: '東京都',
      address2: '千代田区',
      address3: '千代田',
    }],
  },
};

export async function webapiGetJsonMock(
  name: string,
  _params: Record<string, string>
): Promise<unknown> {
  if (!WEBAPI_ALLOWLIST[name]) {
    throw new WebapiError(`WebAPI '${name}' は許可リストにありません`);
  }
  await new Promise(r => setTimeout(r, 50)); // simulate latency
  return MOCK_RESPONSES[name] ?? { status: 404 };
}
