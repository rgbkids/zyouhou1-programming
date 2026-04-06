// Allowlist of safe WebAPI endpoints for the Jouhou-I sandbox

export interface AllowedEndpoint {
  name: string;
  description: string;
  url: (params: Record<string, string>) => string;
  transform: (data: unknown) => string;
}

export const ALLOWED_ENDPOINTS: Record<string, AllowedEndpoint> = {
  zipcode: {
    name: 'zipcode',
    description: '郵便番号から住所を検索 (例: zipcode("1000001"))',
    url: (p) => `https://zipcloud.ibsnet.co.jp/api/search?zipcode=${encodeURIComponent(p.code ?? '')}`,
    transform: (data) => {
      const d = data as { results?: { address1: string; address2: string; address3: string }[] };
      if (!d.results || d.results.length === 0) return '(結果なし)';
      const r = d.results[0];
      return `${r.address1}${r.address2}${r.address3}`;
    },
  },
};
