import { normalizeCaptured } from "@/background/normalize";
import { dedupeKeyForProduct } from "@/shared/dedupe-key";
import type { CaptureReason } from "@/shared/capture-reasons";
import type { CaptureActiveTabMessage, ItemCapturedMessage } from "@/shared/messages";
import { db } from "@/storage/db";
import { savedItemRepository } from "@/storage/saved-items";
import { setFailureBadge, setSuccessBadge } from "@/background/badge";
import { captureActiveTab as runTabCapture } from "@/background/capture-tab";
import { toastMessageFor, type CaptureUiResult } from "@/shared/capture-messages";

export type SuccessCaptureResponse = {
  ok: true;
  itemId: string;
  created: boolean;
  name: string;
};

export type FailureResponse = { ok: false; reason: CaptureReason };

export async function persistFromCapture(
  message: ItemCapturedMessage,
): Promise<SuccessCaptureResponse | FailureResponse> {
  const normalized = normalizeCaptured(message.payload);
  if (!normalized.ok) {
    setFailureBadge();
    return { ok: false, reason: normalized.reason };
  }
  const dedupeKey = dedupeKeyForProduct(normalized.product);
  const existing = await db.savedItems.where("dedupeKey").equals(dedupeKey).first();
  try {
    const saved = await savedItemRepository.upsertFromCapture(normalized.product);
    setSuccessBadge();
    return {
      ok: true,
      itemId: saved.id,
      created: !existing,
      name: saved.name,
    };
  } catch {
    setFailureBadge();
    return { ok: false, reason: "storage_error" };
  }
}

export async function handleCaptureActiveTab(
  message: CaptureActiveTabMessage,
): Promise<
  | SuccessCaptureResponse
  | FailureResponse
  | { ok: false; permission: "not_https" }
> {
  const captureResult = await runTabCapture(message);
  if ("permission" in captureResult) {
    return captureResult;
  }
  if ("reason" in captureResult && captureResult.ok === false) {
    setFailureBadge();
    return captureResult;
  }
  if (
    captureResult &&
    typeof captureResult === "object" &&
    "type" in captureResult &&
    captureResult.type === "ITEM_CAPTURED" &&
    "payload" in captureResult
  ) {
    const persisted = await persistFromCapture(captureResult);
    if (persisted.ok) {
      const ui: CaptureUiResult = {
        kind: "success",
        created: persisted.created,
        name: persisted.name,
      };
      const text = toastMessageFor(ui);
      if (text) {
        void chrome.tabs.sendMessage(message.tabId, { type: "SHOW_TOAST", text });
      }
    }
    return persisted;
  }
  setFailureBadge();
  return { ok: false, reason: "adapter_error" };
}
