import { contentScriptIdForPattern, originPatternForUrl } from "@/shared/site-origin";

const STORAGE_KEY = "activeSites";

export type ActiveSiteRecord = {
  pattern: string;
  hostname: string;
};

export function contentScriptJsFiles(): string[] {
  const manifest = chrome.runtime.getManifest();
  const scripts = manifest.content_scripts ?? [];
  const files = scripts.flatMap((entry) => entry.js ?? []);
  return files.length > 0 ? files : [];
}

async function readPatterns(): Promise<string[]> {
  if (!chrome.storage?.local) {
    return [];
  }
  const stored = await chrome.storage.local.get(STORAGE_KEY);
  const raw = stored[STORAGE_KEY];
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.filter((p): p is string => typeof p === "string");
}

async function writePatterns(patterns: string[]): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: [...new Set(patterns)] });
}

async function registerPattern(pattern: string): Promise<void> {
  const files = contentScriptJsFiles();
  if (files.length === 0) {
    throw new Error("no_content_script");
  }
  const id = contentScriptIdForPattern(pattern);
  try {
    await chrome.scripting.unregisterContentScripts({ ids: [id] });
  } catch {
    /* not registered yet */
  }
  await chrome.scripting.registerContentScripts([
    {
      id,
      matches: [pattern],
      js: files,
      persistAcrossSessions: true,
      runAt: "document_idle",
    },
  ]);
}

async function unregisterPattern(pattern: string): Promise<void> {
  const id = contentScriptIdForPattern(pattern);
  try {
    await chrome.scripting.unregisterContentScripts({ ids: [id] });
  } catch {
    /* ignore */
  }
}

export async function listActiveSites(): Promise<ActiveSiteRecord[]> {
  const patterns = await readPatterns();
  return patterns.map((pattern) => ({
    pattern,
    hostname: pattern.replace(/^https:\/\//, "").replace(/\/\*$/, ""),
  }));
}

export async function isSiteActive(url: string): Promise<boolean> {
  const pattern = originPatternForUrl(url);
  if (!pattern) {
    return false;
  }
  const patterns = await readPatterns();
  if (!patterns.includes(pattern)) {
    return false;
  }
  return chrome.permissions.contains({ origins: [pattern] });
}

export async function activateSite(
  url: string,
): Promise<{ ok: true } | { ok: false; permission: "denied" | "not_https" }> {
  const pattern = originPatternForUrl(url);
  if (!pattern) {
    return { ok: false, permission: "not_https" };
  }
  const has = await chrome.permissions.contains({ origins: [pattern] });
  if (!has) {
    const granted = await chrome.permissions.request({ origins: [pattern] });
    if (!granted) {
      return { ok: false, permission: "denied" };
    }
  }
  const patterns = await readPatterns();
  if (!patterns.includes(pattern)) {
    patterns.push(pattern);
    await writePatterns(patterns);
  }
  await registerPattern(pattern);
  return { ok: true };
}

export async function deactivateSite(pattern: string): Promise<void> {
  await unregisterPattern(pattern);
  const patterns = (await readPatterns()).filter((p) => p !== pattern);
  await writePatterns(patterns);
  try {
    await chrome.permissions.remove({ origins: [pattern] });
  } catch {
    /* user may have revoked already */
  }
}

export async function reconcileActiveSites(): Promise<void> {
  const patterns = await readPatterns();
  const kept: string[] = [];
  for (const pattern of patterns) {
    const has = await chrome.permissions.contains({ origins: [pattern] });
    if (!has) {
      await unregisterPattern(pattern);
      continue;
    }
    kept.push(pattern);
    try {
      await registerPattern(pattern);
    } catch {
      /* build manifest may lack content script during tests */
    }
  }
  if (kept.length !== patterns.length) {
    await writePatterns(kept);
  }
}
