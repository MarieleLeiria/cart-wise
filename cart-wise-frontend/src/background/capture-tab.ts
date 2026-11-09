import { contentScriptJsFiles } from "@/background/active-sites";
import type { CaptureActiveTabMessage, ItemCapturedMessage } from "@/shared/messages";
import type { CaptureReason } from "@/shared/capture-reasons";

export type CaptureTabFailure = { ok: false; reason: CaptureReason };

function scriptFilesOrThrow(): string[] {
  const files = contentScriptJsFiles();
  if (files.length === 0) {
    throw new Error("no_content_script");
  }
  return files;
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
  await chrome.scripting.executeScript({
    target: { tabId },
    files: scriptFilesOrThrow(),
  });
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
): Promise<ItemCapturedMessage | CaptureTabFailure | { ok: false; permission: "not_https" }> {
  try {
    const tab = await chrome.tabs.get(message.tabId);
    const url = tab.url ?? "";
    if (!url.startsWith("https://")) {
      return { ok: false, permission: "not_https" };
    }
    return runCaptureOnTab(message.tabId);
  } catch {
    return { ok: false, reason: "adapter_error" };
  }
}
