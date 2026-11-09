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
      contains: vi.fn(() => Promise.resolve(false)),
      request: vi.fn(() => Promise.resolve(false)),
      remove: vi.fn(() => Promise.resolve(true)),
    },
    scripting: {
      registerContentScripts: vi.fn(() => Promise.resolve()),
      unregisterContentScripts: vi.fn(() => Promise.resolve()),
    },
  });
});

describe("active-sites denial", () => {
  it("FR-site activateSite denied", async () => {
    vi.resetModules();
    const { activateSite } = await import("@/background/active-sites");
    const result = await activateSite("https://loja.example/p");
    expect(result).toEqual({ ok: false, permission: "denied" });
  });

  it("FR-site activateSite not_https", async () => {
    vi.resetModules();
    const { activateSite } = await import("@/background/active-sites");
    const result = await activateSite("http://loja.example/p");
    expect(result).toEqual({ ok: false, permission: "not_https" });
  });
});
