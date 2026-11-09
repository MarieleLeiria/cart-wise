/** Origin pattern `https://hostname/*` for optional host permissions and content scripts. */
export function originPatternForUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") {
      return null;
    }
    return `${parsed.protocol}//${parsed.hostname}/*`;
  } catch {
    return null;
  }
}

export function hostnameForUrl(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

/** Stable id for `chrome.scripting.registerContentScripts`. */
export function contentScriptIdForPattern(pattern: string): string {
  const slug = pattern
    .replace(/^https:\/\//, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return `cartwise-${slug || "site"}`;
}
