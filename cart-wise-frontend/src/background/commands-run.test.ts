import { describe, expect, it, vi } from "vitest";

describe("commands handlers", () => {
  it("executa comando e menu com mock de capture-flow", async () => {
    vi.resetModules();
    vi.doMock("@/background/capture-flow", () => ({
      handleCaptureActiveTab: vi.fn(() =>
        Promise.resolve({ ok: true, itemId: "id", created: true, name: "N" }),
      ),
    }));
    let commandCb: (command: string) => void = () => undefined;
    let menuCb: (info: { menuItemId: string }, tab: { id: number }) => void = () =>
      undefined;
    const onResult = vi.fn();
    vi.stubGlobal("chrome", {
      commands: { onCommand: { addListener: (fn: typeof commandCb) => (commandCb = fn) } },
      contextMenus: {
        removeAll: (cb?: () => void) => cb?.(),
        create: vi.fn(),
        onClicked: { addListener: (fn: typeof menuCb) => (menuCb = fn) },
      },
      tabs: { query: vi.fn(() => Promise.resolve([{ id: 1 }])) },
    });
    const { registerBackgroundCommands } = await import("@/background/commands");
    registerBackgroundCommands(onResult);
    commandCb("other");
    void commandCb("capture-active-tab");
    menuCb({ menuItemId: "other" }, { id: 2 });
    void menuCb({ menuItemId: "cartwise-save-page" }, { id: 2 });
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(onResult).toHaveBeenCalledTimes(2);
    vi.doUnmock("@/background/capture-flow");
  });
});
