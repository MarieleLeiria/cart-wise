import { useCallback, useEffect, useState } from "react";
import { ProductListView } from "@/ui/shared/ProductListView";
import {
  popupMessageFor,
  SAVE_BUTTON_LABEL,
  type CaptureUiResult,
} from "@/shared/capture-messages";
import type { CaptureReason } from "@/shared/capture-reasons";
import { useSavedItemsState } from "@/ui/shared/use-saved-items";

type CaptureResponse =
  | { ok: true; created: boolean; name: string }
  | { ok: false; reason: CaptureReason }
  | { ok: false; permission: "denied" | "not_https" };

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
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void (async () => {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      setTabIsHttps(Boolean(tab?.url?.startsWith("https://")));
    })();
  }, []);

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
      {!tabIsHttps ? <p className="popup__hint">Só é possível salvar páginas HTTPS.</p> : null}
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
