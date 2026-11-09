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
        get: vi.fn(() => Promise.resolve({ activeSites: "invalid" })),
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

describe("readPatterns corrupt", () => {
  it("FR-site lista vazia quando storage inválido", async () => {
    vi.resetModules();
    const { listActiveSites, isSiteActive } = await import("@/background/active-sites");
    expect(await listActiveSites()).toEqual([]);
    expect(await isSiteActive("http://insecure.example")).toBe(false);
  });
});
