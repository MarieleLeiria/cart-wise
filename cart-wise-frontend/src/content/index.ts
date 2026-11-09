import { performCapture } from "@/content/capture";
import { mountSaveFab } from "@/content/save-button";
import { showCaptureToast } from "@/content/toast";
import type { CaptureReason } from "@/shared/capture-reasons";
import { runCaptureMessageSchema } from "@/shared/messages";

mountSaveFab();

chrome.runtime.onMessage.addListener((raw, _sender, sendResponse) => {
  if (raw && typeof raw === "object" && (raw as { type?: string }).type === "PING") {
    sendResponse({ ok: true });
    return;
  }
  if (
    raw &&
    typeof raw === "object" &&
    (raw as { type?: string }).type === "SHOW_TOAST" &&
    typeof (raw as { text?: string }).text === "string"
  ) {
    showCaptureToast((raw as { text: string }).text);
    sendResponse({ ok: true });
    return;
  }

  const parsed = runCaptureMessageSchema.safeParse(raw);
  if (!parsed.success) {
    sendResponse({ ok: false, reason: "invalid_payload" satisfies CaptureReason });
    return true;
  }

  void performCapture("manual", { skipServiceWorker: true }).then((result) => {
    sendResponse(result);
  });
  return true;
});
