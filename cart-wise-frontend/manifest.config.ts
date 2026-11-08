import { defineManifest } from "@crxjs/vite-plugin";
import packageJson from "./package.json";

const hostPermissions = [
  "https://*.magazineluiza.com.br/*",
  "https://*.shein.com/*",
  "https://*.shopee.com.br/*",
  "https://*.mercadolivre.com.br/*",
  "https://*.amazon.com.br/*",
] as const;

export default defineManifest({
  manifest_version: 3,
  name: "Cart Wise",
  description: "Salve produtos de lojas online no seu carrinho local.",
  version: packageJson.version,
  permissions: ["storage", "activeTab", "scripting", "contextMenus"],
  host_permissions: [...hostPermissions],
  optional_host_permissions: ["https://*/*"],
  action: {
    default_title: "Cart Wise",
    default_popup: "src/ui/popup/index.html",
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
      matches: [...hostPermissions],
      js: ["src/content/index.ts"],
      run_at: "document_idle",
    },
  ],
});
