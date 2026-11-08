export const mvpStoreDomains = [
  "magazineluiza.com.br",
  "shein.com",
  "shopee.com.br",
  "mercadolivre.com.br",
  "amazon.com.br",
] as const;

export function registrableDomainFromUrl(url: string): string | null {
  try {
    const host = new URL(url).hostname.toLowerCase();
  // eTLD+1 simplificado para hosts do MVP (evita dependência de PSL no content script).
    for (const domain of mvpStoreDomains) {
      if (host === domain || host.endsWith(`.${domain}`)) {
        return domain;
      }
    }
    const parts = host.split(".");
    if (parts.length >= 2) {
      return parts.slice(-2).join(".");
    }
    return host;
  } catch {
    return null;
  }
}

export function urlMatchesDomain(url: string, domain: string): boolean {
  return registrableDomainFromUrl(url) === domain;
}
