import { SAVE_BUTTON_LABEL } from "@/shared/capture-messages";
import { performCapture } from "@/content/capture";

const HOST_ID = "cartwise-save-host";

function ensureHost(): HTMLElement {
  let host = document.getElementById(HOST_ID);
  if (!host) {
    host = document.createElement("div");
    host.id = HOST_ID;
    host.style.position = "fixed";
    host.style.left = "16px";
    host.style.bottom = "16px";
    host.style.zIndex = "2147483646";
    host.style.margin = "0";
    document.documentElement.appendChild(host);
  }
  return host;
}

export function mountSaveFab(): void {
  if (document.getElementById(HOST_ID)) {
    return;
  }
  const host = ensureHost();
  const root = host.attachShadow({ mode: "closed" });
  const style = document.createElement("style");
  style.textContent = `
    .fab {
      all: initial;
      font: 600 14px/1.2 system-ui, sans-serif;
      color: #fff;
      background: #2563eb;
      border: none;
      border-radius: 999px;
      padding: 12px 18px;
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(0,0,0,.25);
      pointer-events: auto;
    }
    .fab:hover { background: #1d4ed8; }
    .fab:disabled { opacity: 0.6; cursor: wait; }
  `;
  const button = document.createElement("button");
  button.type = "button";
  button.className = "fab";
  button.textContent = SAVE_BUTTON_LABEL;
  button.addEventListener("click", () => {
    if (button.disabled) {
      return;
    }
    button.disabled = true;
    void performCapture("manual").finally(() => {
      button.disabled = false;
    });
  });
  root.appendChild(style);
  root.appendChild(button);
}
