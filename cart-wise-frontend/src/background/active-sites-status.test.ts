import { beforeEach, describe, expect, it, vi } from "vitest";

beforeEach(() => {
  vi.stubGlobal("chrome", {
    runtime: {
      getManifest: () => ({ content_scripts: [{ js: ["content.js"] }] }),
    },
    storage: {
      local: {
        get: vi.fn(() => Promise.resolve({ activeSites: ["https://loja.example/*"] })),
        set: vi.fn(() => Promise.resolve()),
      },
    },
    permissions: {
      contains: vi.fn(() => Promise.resolve(false)),
    },
    scripting: {
      registerContentScripts: vi.fn(),
      unregisterContentScripts: vi.fn(),
    },
  });
});

describe("isSiteActive", () => {
  it("FR-site false sem permissão", async () => {
    vi.resetModules();
    const { isSiteActive } = await import("@/background/active-sites");
    const active = await isSiteActive("https://loja.example/p");
    expect(active).toBe(false);
  });
});
