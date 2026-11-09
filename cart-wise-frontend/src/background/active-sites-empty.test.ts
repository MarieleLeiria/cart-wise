import { beforeEach, describe, expect, it, vi } from "vitest";

beforeEach(() => {
  vi.stubGlobal("chrome", {
    runtime: {
      getManifest: () => ({ content_scripts: [] }),
    },
    storage: {
      local: {
        get: vi.fn(() => Promise.resolve({ activeSites: [] })),
        set: vi.fn(() => Promise.resolve()),
      },
    },
    permissions: {
      contains: vi.fn(() => Promise.resolve(false)),
      request: vi.fn(() => Promise.resolve(true)),
    },
    scripting: {
      registerContentScripts: vi.fn(),
      unregisterContentScripts: vi.fn(),
    },
  });
});

describe("activateSite sem bundle", () => {
  it("FR-site falha sem content script no manifest", async () => {
    vi.resetModules();
    const { activateSite } = await import("@/background/active-sites");
    await expect(activateSite("https://loja.example/p")).rejects.toThrow("no_content_script");
  });
});
