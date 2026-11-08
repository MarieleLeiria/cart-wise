const BADGE_SUCCESS_BG = "#0B7A3B";
const BADGE_FAILURE_BG = "#B42318";

export function setSuccessBadge(): void {
  void chrome.action.setBadgeText({ text: "OK" });
  void chrome.action.setBadgeBackgroundColor({ color: BADGE_SUCCESS_BG });
}

export function setFailureBadge(): void {
  void chrome.action.setBadgeText({ text: "!" });
  void chrome.action.setBadgeBackgroundColor({ color: BADGE_FAILURE_BG });
}
