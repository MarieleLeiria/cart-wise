import { beforeEach, describe, expect, it, vi } from "vitest";

const listeners: Array<
  (raw: unknown, sender: unknown, sendResponse: (r: unknown) => void) => boolean
> = [];

beforeEach(() => {
  listeners.length = 0;
  vi.stubGlobal("chrome", {
    runtime: {
      id: "cart-wise-ext",
      onMessage: {
        addListener: (fn: (typeof listeners)[number]) => listeners.push(fn),
      },
    },
    action: {
      setBadgeText: vi.fn(),
      setBadgeBackgroundColor: vi.fn(),
    },
    tabs: {
      get: vi.fn(() => Promise.resolve({ url: "http://insecure.example" })),
      sendMessage: vi.fn(),
    },
  });
});

async function respond(
  raw: unknown,
  sender: object = { id: "cart-wise-ext", url: "chrome-extension://cart-wise/popup.html" },
): Promise<unknown> {
  vi.resetModules();
  await import("@/background/index");
  return new Promise((resolve) => {
    listeners.at(-1)?.(raw, sender, resolve);
  });
}

describe("background handlers extra", () => {
  it("CAPTURE_FAILED ack", async () => {
    const response = await respond(
      {
        type: "CAPTURE_FAILED",
        reason: "adapter_error",
        trigger: "manual",
      },
      { id: "cart-wise-ext", tab: { id: 1 } },
    );
    expect(response).toEqual({ ok: true });
  });

  it("CAPTURE_ACTIVE_TAB not_https", async () => {
    const response = await respond({
      type: "CAPTURE_ACTIVE_TAB",
      tabId: 1,
      source: "popup",
    });
    expect(response).toEqual({ ok: false, permission: "not_https" });
  });

  it("RUN_CAPTURE no background retorna adapter_error", async () => {
    const response = await respond({ type: "RUN_CAPTURE", trigger: "manual" });
    expect(response).toEqual({ ok: false, reason: "adapter_error" });
  });
});
