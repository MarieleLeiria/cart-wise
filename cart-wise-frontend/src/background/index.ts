import type { CaptureReason } from "@/shared/capture-reasons";
import { runtimeMessageSchema } from "@/shared/messages";
import { setFailureBadge } from "@/background/badge";
import { handleCaptureActiveTab, persistFromCapture } from "@/background/capture-flow";
import { registerBackgroundCommands } from "@/background/commands";
import { applyCommandResultBadge } from "@/background/on-command-result";

type FailureResponse = { ok: false; reason: CaptureReason };

registerBackgroundCommands(applyCommandResultBadge);

function isTrustedSender(sender: chrome.runtime.MessageSender): boolean {
  return sender.id === chrome.runtime.id;
}

function isExtensionUiSender(sender: chrome.runtime.MessageSender): boolean {
  return Boolean(sender.url?.startsWith("chrome-extension://"));
}

chrome.runtime.onMessage.addListener((raw, sender, sendResponse) => {
  if (!isTrustedSender(sender)) {
    sendResponse({ ok: false, reason: "invalid_payload" } satisfies FailureResponse);
    return;
  }
  const parsed = runtimeMessageSchema.safeParse(raw);
  if (!parsed.success) {
    sendResponse({ ok: false, reason: "invalid_payload" } satisfies FailureResponse);
    return;
  }
  const message = parsed.data;
  void (async () => {
    switch (message.type) {
      case "ITEM_CAPTURED": {
        if (!sender.tab) {
          sendResponse({ ok: false, reason: "invalid_payload" } satisfies FailureResponse);
          break;
        }
        sendResponse(await persistFromCapture(message));
        break;
      }
      case "CAPTURE_ACTIVE_TAB": {
        if (!isExtensionUiSender(sender)) {
          sendResponse({ ok: false, reason: "invalid_payload" } satisfies FailureResponse);
          break;
        }
        sendResponse(await handleCaptureActiveTab(message));
        break;
      }
      case "CAPTURE_FAILED": {
        if (!sender.tab) {
          sendResponse({ ok: false, reason: "invalid_payload" } satisfies FailureResponse);
          break;
        }
        setFailureBadge();
        sendResponse({ ok: true });
        break;
      }
      case "RUN_CAPTURE": {
        sendResponse({ ok: false, reason: "adapter_error" } satisfies FailureResponse);
        break;
      }
      default: {
        sendResponse({ ok: false, reason: "invalid_payload" } satisfies FailureResponse);
      }
    }
  })();
  return true;
});
