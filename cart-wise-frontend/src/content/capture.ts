import { adaptersForUrl, runAdapterChain } from "@/adapters/resolve-chain";
import type { CaptureReason } from "@/shared/capture-reasons";
import { capturedProductSchema } from "@/shared/schemas";
import type { CaptureFailedMessage, ItemCapturedMessage } from "@/shared/messages";
import { toastMessageFor, type CaptureUiResult } from "@/shared/capture-messages";
import { showCaptureToast } from "@/content/toast";

type CaptureFailure = { ok: false; reason: CaptureReason };

async function notifyFailure(reason: CaptureReason, trigger: "auto" | "manual"): Promise<CaptureFailure> {
  const failed: CaptureFailedMessage = { type: "CAPTURE_FAILED", reason, trigger };
  await chrome.runtime.sendMessage(failed);
  const ui: CaptureUiResult = { kind: "failure", reason };
  const text = toastMessageFor(ui);
  if (text) {
    showCaptureToast(text);
  }
  return { ok: false, reason };
}

export async function performCapture(
  trigger: "auto" | "manual",
  options?: { skipServiceWorker?: boolean },
): Promise<ItemCapturedMessage | CaptureFailure> {
  const adapters = adaptersForUrl(location.href, trigger);
  const extracted = await runAdapterChain(adapters, trigger);
  if (extracted.status !== "ok") {
    return notifyFailure(
      extracted.status === "fail" ? extracted.reason : "adapter_error",
      trigger,
    );
  }

  const parsed = capturedProductSchema.safeParse(extracted.product);
  if (!parsed.success) {
    return notifyFailure("invalid_payload", trigger);
  }

  const message: ItemCapturedMessage = { type: "ITEM_CAPTURED", payload: parsed.data };

  if (options?.skipServiceWorker) {
    return message;
  }

  const swResponse: unknown = await chrome.runtime.sendMessage(message);

  const ui: CaptureUiResult =
    swResponse &&
    typeof swResponse === "object" &&
    "ok" in swResponse &&
    (swResponse as { ok: boolean }).ok
      ? {
          kind: "success",
          created: Boolean((swResponse as { created?: boolean }).created),
          name: String((swResponse as { name?: string }).name ?? parsed.data.name),
        }
      : {
          kind: "failure",
          reason:
            (swResponse as { reason?: CaptureReason })?.reason ??
            ("storage_error" satisfies CaptureReason),
        };

  const text = toastMessageFor(ui);
  if (text) {
    showCaptureToast(text);
  }

  if (ui.kind === "failure") {
    return { ok: false, reason: ui.reason };
  }

  return message;
}
