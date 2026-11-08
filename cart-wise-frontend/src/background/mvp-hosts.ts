export const mvpHostPatterns = [
  "https://*.magazineluiza.com.br/*",
  "https://*.shein.com/*",
  "https://*.shopee.com.br/*",
  "https://*.mercadolivre.com.br/*",
  "https://*.amazon.com.br/*",
] as const;

export function isMvpHostUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    const mvp = [
      "magazineluiza.com.br",
      "shein.com",
      "shopee.com.br",
      "mercadolivre.com.br",
      "amazon.com.br",
    ];
    return mvp.some((domain) => host === domain || host.endsWith(`.${domain}`));
  } catch {
    return false;
  }
}
