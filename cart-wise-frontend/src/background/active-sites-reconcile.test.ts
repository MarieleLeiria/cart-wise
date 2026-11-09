import { beforeEach, describe, expect, it, vi } from "vitest";

const storage = new Map<string, unknown>();

beforeEach(() => {
  storage.set("activeSites", ["https://loja.example/*", "https://revoked.example/*"]);
  vi.stubGlobal("chrome", {
    runtime: {
      getManifest: () => ({
        content_scripts: [{ js: ["assets/content.js"] }],
      }),
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
      contains: vi.fn((perm: { origins?: string[] }) => {
        const origin = perm.origins?.[0] ?? "";
        return Promise.resolve(origin !== "https://revoked.example/*");
      }),
    },
    scripting: {
      registerContentScripts: vi.fn(() => Promise.resolve()),
      unregisterContentScripts: vi.fn(() => Promise.resolve()),
    },
  });
});

describe("reconcileActiveSites", () => {
  it("NFR-RES remove site sem permissão", async () => {
    vi.resetModules();
    const { reconcileActiveSites, listActiveSites } = await import("@/background/active-sites");
    await reconcileActiveSites();
    const sites = await listActiveSites();
    expect(sites.map((s) => s.pattern)).toEqual(["https://loja.example/*"]);
    expect(chrome.scripting.unregisterContentScripts).toHaveBeenCalled();
  });
});
