import { isMvpHostUrl } from "@/background/mvp-hosts";
import type { CaptureActiveTabMessage, ItemCapturedMessage } from "@/shared/messages";
import type { CaptureReason } from "@/shared/capture-reasons";

export type CaptureTabFailure = { ok: false; reason: CaptureReason };
export type CaptureTabPermission = { ok: false; permission: "denied" | "not_https" };

function originPatternForUrl(url: string): string | null {
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

async function ensureHostPermission(url: string): Promise<"granted" | "denied" | "not_https"> {
  if (!url.startsWith("https://")) {
    return "not_https";
  }
  if (isMvpHostUrl(url)) {
    return "granted";
  }
  const pattern = originPatternForUrl(url);
  if (!pattern) {
    return "not_https";
  }
  const has = await chrome.permissions.contains({ origins: [pattern] });
  if (has) {
    return "granted";
  }
  const granted = await chrome.permissions.request({ origins: [pattern] });
  return granted ? "granted" : "denied";
}

function contentScriptFiles(): string[] {
  const manifest = chrome.runtime.getManifest();
  const scripts = manifest.content_scripts ?? [];
  const files = scripts.flatMap((entry) => entry.js ?? []);
  return files.length > 0 ? files : [];
}

async function pingContentScript(tabId: number): Promise<boolean> {
  try {
    const response: unknown = await chrome.tabs.sendMessage(tabId, { type: "PING" });
    return Boolean(response && typeof response === "object" && (response as { ok?: boolean }).ok);
  } catch {
    return false;
  }
}

async function injectContentScript(tabId: number): Promise<void> {
  const files = contentScriptFiles();
  if (files.length === 0) {
    throw new Error("no_content_script");
  }
  await chrome.scripting.executeScript({ target: { tabId }, files });
}

export async function runCaptureOnTab(
  tabId: number,
): Promise<ItemCapturedMessage | CaptureTabFailure> {
  const alive = await pingContentScript(tabId);
  if (!alive) {
    await injectContentScript(tabId);
  }
  const response: unknown = await chrome.tabs.sendMessage(tabId, {
    type: "RUN_CAPTURE",
    trigger: "manual",
  });
  if (
    response &&
    typeof response === "object" &&
    "type" in response &&
    (response as { type: string }).type === "ITEM_CAPTURED"
  ) {
    return response as ItemCapturedMessage;
  }
  if (
    response &&
    typeof response === "object" &&
    "ok" in response &&
    (response as { ok: boolean }).ok === false &&
    "reason" in response
  ) {
    return { ok: false, reason: (response as { reason: CaptureReason }).reason };
  }
  return { ok: false, reason: "adapter_error" };
}

export async function captureActiveTab(
  message: CaptureActiveTabMessage,
): Promise<ItemCapturedMessage | CaptureTabFailure | CaptureTabPermission> {
  try {
    const tab = await chrome.tabs.get(message.tabId);
    const url = tab.url ?? "";
    if (!url.startsWith("https://")) {
      return { ok: false, permission: "not_https" };
    }
    const permission = await ensureHostPermission(url);
    if (permission === "not_https") {
      return { ok: false, permission: "not_https" };
    }
    if (permission === "denied") {
      return { ok: false, permission: "denied" };
    }
    return runCaptureOnTab(message.tabId);
  } catch {
    return { ok: false, reason: "adapter_error" };
  }
}
