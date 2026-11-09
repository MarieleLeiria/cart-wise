import { useCallback, useEffect, useState } from "react";
import { ProductListView } from "@/ui/shared/ProductListView";
import {
  popupMessageFor,
  SAVE_BUTTON_LABEL,
  siteActivationTexts,
  type CaptureUiResult,
} from "@/shared/capture-messages";
import type { CaptureReason } from "@/shared/capture-reasons";
import { useSavedItemsState } from "@/ui/shared/use-saved-items";

type CaptureResponse =
  | { ok: true; created: boolean; name: string }
  | { ok: false; reason: CaptureReason }
  | { ok: false; permission: "not_https" };

type SiteStatusResponse = { ok: true; active: boolean } | { ok: false; reason: CaptureReason };

type ActivateResponse =
  | { ok: true }
  | { ok: false; permission: "denied" | "not_https" }
  | { ok: false; reason: CaptureReason };

function toUiResult(response: CaptureResponse): CaptureUiResult {
  if (!response.ok && "permission" in response) {
    return { kind: "permission", permission: response.permission };
  }
  if (response.ok) {
    return { kind: "success", created: response.created, name: response.name };
  }
  return { kind: "failure", reason: response.reason };
}

export function PopupApp() {
  const { items, loading, error } = useSavedItemsState();
  const [tabIsHttps, setTabIsHttps] = useState(false);
  const [tabUrl, setTabUrl] = useState<string | null>(null);
  const [tabId, setTabId] = useState<number | null>(null);
  const [siteActive, setSiteActive] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refreshSiteStatus = useCallback(async (url: string | null) => {
    if (!url?.startsWith("https://")) {
      setSiteActive(false);
      return;
    }
    const response: SiteStatusResponse = await chrome.runtime.sendMessage({
      type: "GET_SITE_STATUS",
      url,
    });
    if (response.ok) {
      setSiteActive(response.active);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const https = Boolean(tab?.url?.startsWith("https://"));
      setTabIsHttps(https);
      setTabUrl(tab?.url ?? null);
      setTabId(tab?.id ?? null);
      await refreshSiteStatus(tab?.url ?? null);
    })();
  }, [refreshSiteStatus]);

  const captureActiveTab = useCallback(async () => {
    setBusy(true);
    setStatus(null);
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) {
        return;
      }
      const response: CaptureResponse = await chrome.runtime.sendMessage({
        type: "CAPTURE_ACTIVE_TAB",
        tabId: tab.id,
        source: "popup",
      });
      const ui = toUiResult(response);
      let message = popupMessageFor(ui);
      if (ui.kind === "success") {
        message = `${message} ${response.ok ? response.name : ""}`.trim();
      }
      setStatus(message);
    } finally {
      setBusy(false);
    }
  }, []);

  const toggleSiteActivation = useCallback(async () => {
    if (!tabUrl || tabId === null) {
      return;
    }
    setBusy(true);
    setStatus(null);
    try {
      if (siteActive) {
        const pattern = `${new URL(tabUrl).protocol}//${new URL(tabUrl).hostname}/*`;
        await chrome.runtime.sendMessage({
          type: "DEACTIVATE_SITE",
          pattern,
        });
        setSiteActive(false);
        setStatus(siteActivationTexts.deactivated);
        return;
      }
      const response: ActivateResponse = await chrome.runtime.sendMessage({
        type: "ACTIVATE_SITE",
        tabId,
        url: tabUrl,
      });
      if (response.ok) {
        setSiteActive(true);
        setStatus(siteActivationTexts.activated);
        return;
      }
      if ("permission" in response) {
        const ui: CaptureUiResult = { kind: "permission", permission: response.permission };
        setStatus(popupMessageFor(ui));
        return;
      }
      setStatus(popupMessageFor({ kind: "failure", reason: response.reason }));
    } finally {
      setBusy(false);
    }
  }, [siteActive, tabId, tabUrl]);

  return (
    <main className="popup">
      <header>
        <h1>Cart Wise</h1>
      </header>
      <button
        type="button"
        className="primary"
        disabled={!tabIsHttps || busy}
        onClick={() => void captureActiveTab()}
      >
        {SAVE_BUTTON_LABEL}
      </button>
      <button
        type="button"
        className="secondary"
        disabled={!tabIsHttps || busy}
        onClick={() => void toggleSiteActivation()}
      >
        {siteActive ? siteActivationTexts.deactivate : siteActivationTexts.activate}
      </button>
      {!tabIsHttps ? <p className="popup__hint">Só é possível salvar páginas HTTPS.</p> : null}
      {tabIsHttps ? (
        <p className="popup__hint">
          {siteActive ? siteActivationTexts.activeHint : siteActivationTexts.inactiveHint}
        </p>
      ) : null}
      {status ? <p className="popup__status">{status}</p> : null}
      {loading ? <p className="popup__status">Carregando lista…</p> : null}
      {error ? <p className="popup__status">{error}</p> : null}
      {items.length === 0 && !loading ? (
        <p className="popup__status">Nenhum produto salvo.</p>
      ) : null}
      <ProductListView limit={5} limitByUpdatedAt showFilters={false} />
      <p className="popup__footer">
        <button
          type="button"
          onClick={() => {
            void chrome.runtime.openOptionsPage();
          }}
        >
          Ver todos
        </button>
      </p>
    </main>
  );
}
