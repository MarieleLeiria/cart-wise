import { describe, expect, it, vi } from "vitest";

describe("registerBackgroundCommands", () => {
  it("registra listeners quando chrome.commands existe", async () => {
    const onCommand = vi.fn();
    const removeAll = vi.fn((cb?: () => void) => cb?.());
    const create = vi.fn();
    vi.stubGlobal("chrome", {
      commands: { onCommand: { addListener: onCommand } },
      contextMenus: { removeAll, create, onClicked: { addListener: vi.fn() } },
      tabs: { query: vi.fn() },
    });
    const { registerBackgroundCommands } = await import("@/background/commands");
    registerBackgroundCommands(() => undefined);
    expect(onCommand).toHaveBeenCalled();
    expect(create).toHaveBeenCalled();
  });
});
