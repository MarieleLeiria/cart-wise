import { defineManifest } from "@crxjs/vite-plugin";
import packageJson from "./package.json";

/** Never matches production hosts; bundles the content script for dynamic registration. */
const contentScriptBundleMatch = "https://cart-wise-bundle-placeholder.invalid/*";

export default defineManifest({
  manifest_version: 3,
  name: "Cart Wise",
  description: "Salve produtos de lojas online no seu carrinho local.",
  version: packageJson.version,
  permissions: ["storage", "activeTab", "scripting", "contextMenus"],
  optional_host_permissions: ["https://*/*"],
  icons: {
    16: "public/icons/icon16.png",
    32: "public/icons/icon32.png",
    48: "public/icons/icon48.png",
    128: "public/icons/icon128.png",
  },
  action: {
    default_title: "Cart Wise",
    default_popup: "src/ui/popup/index.html",
    default_icon: {
      16: "public/icons/icon16.png",
      32: "public/icons/icon32.png",
    },
  },
  options_ui: {
    page: "src/ui/dashboard/index.html",
    open_in_tab: true,
  },
  background: {
    service_worker: "src/background/index.ts",
    type: "module",
  },
  commands: {
    "capture-active-tab": {
      suggested_key: { default: "Ctrl+Shift+S", mac: "Command+Shift+S" },
      description: "Salvar o produto da aba atual",
    },
  },
  content_scripts: [
    {
      matches: [contentScriptBundleMatch],
      js: ["src/content/index.ts"],
      run_at: "document_idle",
    },
  ],
});
