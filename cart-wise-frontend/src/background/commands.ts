import { handleCaptureActiveTab } from "@/background/capture-flow";

export function registerBackgroundCommands(
  onResult: (result: unknown) => void,
): void {
  if (chrome.commands?.onCommand) {
  chrome.commands.onCommand.addListener((command) => {
    if (command !== "capture-active-tab") {
      return;
    }
    void (async () => {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) {
        return;
      }
      const result = await handleCaptureActiveTab({
        type: "CAPTURE_ACTIVE_TAB",
        tabId: tab.id,
        source: "command",
      });
      onResult(result);
    })();
  });

  }
  if (chrome.contextMenus) {
    chrome.contextMenus.removeAll(() => {
      chrome.contextMenus.create({
        id: "cartwise-save-page",
        title: "Salvar no CartWise",
        contexts: ["page"],
      });
    });

    chrome.contextMenus.onClicked.addListener((info, tab) => {
      if (info.menuItemId !== "cartwise-save-page" || !tab?.id) {
        return;
      }
      void handleCaptureActiveTab({
        type: "CAPTURE_ACTIVE_TAB",
        tabId: tab.id,
        source: "context_menu",
      }).then(onResult);
    });
  }
}
