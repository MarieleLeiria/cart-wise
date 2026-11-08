const HOST_ID = "cartwise-toast-host";
const HIDE_MS = 4000;

let hideTimer: ReturnType<typeof setTimeout> | undefined;

function ensureHost(): HTMLElement {
  let host = document.getElementById(HOST_ID);
  if (!host) {
    host = document.createElement("div");
    host.id = HOST_ID;
    host.style.position = "fixed";
    host.style.right = "16px";
    host.style.bottom = "16px";
    host.style.zIndex = "2147483647";
    host.style.margin = "0";
    host.style.pointerEvents = "none";
    document.documentElement.appendChild(host);
  }
  return host;
}

export function showCaptureToast(text: string): void {
  const existing = document.getElementById(HOST_ID);
  existing?.remove();
  const host = ensureHost();
  const root = host.attachShadow({ mode: "closed" });
  const style = document.createElement("style");
  style.textContent = `
    .toast {
      background: #1a1a1a;
      color: #fff;
      font: 14px/1.4 system-ui, sans-serif;
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0,0,0,.25);
      max-width: min(320px, calc(100vw - 32px));
    }
  `;
  const bubble = document.createElement("div");
  bubble.className = "toast";
  bubble.textContent = text;
  root.appendChild(style);
  root.appendChild(bubble);

  if (hideTimer) {
    clearTimeout(hideTimer);
  }
  hideTimer = setTimeout(() => {
    host.remove();
    hideTimer = undefined;
  }, HIDE_MS);
}
