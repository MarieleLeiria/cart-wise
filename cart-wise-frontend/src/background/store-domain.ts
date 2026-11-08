const MULTI_PART_TLDS = ["com.br", "co.uk"];

export function resolveStoreDomain(urlString: string): string {
  const host = new URL(urlString).hostname.toLowerCase();
  const parts = host.split(".").filter(Boolean);
  if (parts.length <= 2) {
    return parts.join(".");
  }
  const tail2 = parts.slice(-2).join(".");
  const tail3 = parts.slice(-3).join(".");
  if (MULTI_PART_TLDS.some((tld) => tail2 === tld || host.endsWith(`.${tld}`))) {
    return tail3;
  }
  return tail2;
}
