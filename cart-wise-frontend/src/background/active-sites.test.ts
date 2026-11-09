import { beforeEach, describe, expect, it, vi } from "vitest";

const storage = new Map<string, unknown>();

beforeEach(() => {
  storage.clear();
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
      contains: vi.fn(() => Promise.resolve(true)),
      request: vi.fn(() => Promise.resolve(true)),
      remove: vi.fn(() => Promise.resolve(true)),
    },
    scripting: {
      registerContentScripts: vi.fn(() => Promise.resolve()),
      unregisterContentScripts: vi.fn(() => Promise.resolve()),
    },
  });
});

describe("active-sites", () => {
  it("FR-site activateSite grava e registra script", async () => {
    vi.resetModules();
    const { activateSite, listActiveSites } = await import("@/background/active-sites");
    const result = await activateSite("https://loja.example/p");
    expect(result).toEqual({ ok: true });
    expect(chrome.scripting.registerContentScripts).toHaveBeenCalled();
    const sites = await listActiveSites();
    expect(sites[0]?.hostname).toBe("loja.example");
  });

  it("FR-site activateSite idempotente", async () => {
    vi.resetModules();
    const { activateSite, listActiveSites } = await import("@/background/active-sites");
    storage.set("activeSites", ["https://loja.example/*"]);
    const result = await activateSite("https://loja.example/p");
    expect(result).toEqual({ ok: true });
    const sites = await listActiveSites();
    expect(sites).toHaveLength(1);
  });

  it("FR-site deactivateSite remove", async () => {
    vi.resetModules();
    const { activateSite, deactivateSite, listActiveSites } = await import(
      "@/background/active-sites"
    );
    await activateSite("https://loja.example/p");
    await deactivateSite("https://loja.example/*");
    const sites = await listActiveSites();
    expect(sites).toHaveLength(0);
  });
});
