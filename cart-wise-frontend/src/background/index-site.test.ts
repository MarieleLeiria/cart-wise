import { beforeEach, describe, expect, it, vi } from "vitest";

const listeners: Array<
  (raw: unknown, sender: unknown, sendResponse: (r: unknown) => void) => boolean
> = [];

const storage = new Map<string, unknown>();

function chromeStub() {
  return {
    runtime: {
      id: "cart-wise-ext",
      getManifest: () => ({
        content_scripts: [{ js: ["assets/content.js"] }],
      }),
      onMessage: {
        addListener: (fn: (typeof listeners)[number]) => listeners.push(fn),
      },
      onInstalled: { addListener: vi.fn() },
      onStartup: { addListener: vi.fn() },
    },
    storage: {
      local: {
        get: vi.fn((key: string) =>
          Promise.resolve({ [key]: storage.get(key) ?? [] }),
        ),
        set: vi.fn((obj: Record<string, unknown>) => {
          for (const [k, v] of Object.entries(obj)) {
            storage.set(k, v);
          }
          return Promise.resolve();
        }),
      },
    },
    permissions: {
      contains: vi.fn(() => Promise.resolve(true)),
      request: vi.fn(() => Promise.resolve(true)),
      remove: vi.fn(() => Promise.resolve(true)),
    },
    scripting: {
      registerContentScripts: vi.fn(() => Promise.resolve()),
      unregisterContentScripts: vi.fn(() => Promise.resolve()),
    },
    action: {
      setBadgeText: vi.fn(),
      setBadgeBackgroundColor: vi.fn(),
    },
    tabs: {
      get: vi.fn(),
      sendMessage: vi.fn(),
    },
  };
}

const uiSender = { id: "cart-wise-ext", url: "chrome-extension://cart-wise/popup.html" };

beforeEach(() => {
  listeners.length = 0;
  storage.clear();
  vi.stubGlobal("chrome", chromeStub());
});

async function respond(raw: unknown, sender: object = uiSender): Promise<unknown> {
  vi.resetModules();
  await import("@/background/index");
  return new Promise((resolve) => {
    listeners.at(-1)?.(raw, sender, resolve);
  });
}

describe("background site activation", () => {
  it("FR-site ACTIVATE_SITE", async () => {
    const response = await respond({
      type: "ACTIVATE_SITE",
      tabId: 1,
      url: "https://loja.example/p",
    });
    expect(response).toEqual({ ok: true });
  });

  it("FR-site GET_SITE_STATUS", async () => {
    await respond({
      type: "ACTIVATE_SITE",
      tabId: 1,
      url: "https://loja.example/p",
    });
    const response = await respond({
      type: "GET_SITE_STATUS",
      url: "https://loja.example/p",
    });
    expect(response).toEqual({ ok: true, active: true });
  });

  it("FR-site LIST_ACTIVE_SITES e DEACTIVATE_SITE", async () => {
    await respond({
      type: "ACTIVATE_SITE",
      tabId: 1,
      url: "https://loja.example/p",
    });
    let list = await respond({ type: "LIST_ACTIVE_SITES" });
    expect(list).toMatchObject({ ok: true, sites: [{ hostname: "loja.example" }] });
    await respond({
      type: "DEACTIVATE_SITE",
      pattern: "https://loja.example/*",
    });
    list = await respond({ type: "LIST_ACTIVE_SITES" });
    expect(list).toEqual({ ok: true, sites: [] });
  });
});
