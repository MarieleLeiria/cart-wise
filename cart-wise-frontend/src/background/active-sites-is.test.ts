import { beforeEach, describe, expect, it, vi } from "vitest";

beforeEach(() => {
  vi.stubGlobal("chrome", {
    runtime: {
      getManifest: () => ({
        content_scripts: [{ js: ["assets/content.js"] }],
      }),
    },
    storage: {
      local: {
        get: vi.fn(() => Promise.resolve({ activeSites: [] })),
        set: vi.fn(() => Promise.resolve()),
      },
    },
    permissions: {
      contains: vi.fn(() => Promise.resolve(true)),
    },
    scripting: {
      registerContentScripts: vi.fn(),
      unregisterContentScripts: vi.fn(),
    },
  });
});

describe("isSiteActive inativo", () => {
  it("FR-site false quando não está na lista", async () => {
    vi.resetModules();
    const { isSiteActive } = await import("@/background/active-sites");
    expect(await isSiteActive("https://loja.example/p")).toBe(false);
  });
});
