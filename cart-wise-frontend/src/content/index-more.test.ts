import { describe, expect, it, vi, beforeEach } from "vitest";

const listeners: Array<
  (raw: unknown, sender: unknown, sendResponse: (r: unknown) => void) => boolean | void
> = [];

describe("content mensagens auxiliares", () => {
  beforeEach(() => {
    listeners.length = 0;
    document.body.innerHTML = "";
    vi.stubGlobal("location", { href: "https://www.amazon.com.br/dp/x" });
    vi.stubGlobal("chrome", {
      runtime: {
        onMessage: {
          addListener: (fn: (typeof listeners)[number]) => listeners.push(fn),
        },
        sendMessage: vi.fn(),
      },
    });
  });

  it("PING responde ok", async () => {
    vi.resetModules();
    await import("@/content/index");
    const response = await new Promise((resolve) => {
      listeners.at(-1)?.({ type: "PING" }, {}, resolve);
    });
    expect(response).toEqual({ ok: true });
  });

  it("SHOW_TOAST ack", async () => {
    vi.resetModules();
    await import("@/content/index");
    const response = await new Promise((resolve) => {
      listeners.at(-1)?.({ type: "SHOW_TOAST", text: "Ok" }, {}, resolve);
    });
    expect(response).toEqual({ ok: true });
    expect(document.getElementById("cartwise-toast-host")).not.toBeNull();
  });
});
