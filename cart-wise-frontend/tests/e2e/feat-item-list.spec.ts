import path from "node:path";
import { fileURLToPath } from "node:url";
import { test, expect, chromium } from "@playwright/test";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const extensionPath = path.join(dirname, "../../dist");

test("FR-LST-006 popup mostra lista vazia", async () => {
  const context = await chromium.launchPersistentContext("", {
    headless: false,
    args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`],
  });

  try {
    const serviceWorker =
      context.serviceWorkers()[0] ?? (await context.waitForEvent("serviceworker"));
    const extensionId = new URL(serviceWorker.url()).host;
    expect(extensionId.length).toBeGreaterThan(0);

    const popupUrl = `chrome-extension://${extensionId}/src/ui/popup/index.html`;
    const page = await context.newPage();
    await page.goto(popupUrl);
    await expect(page.getByText("Nenhum produto salvo.")).toBeVisible({ timeout: 15_000 });
  } finally {
    await context.close();
  }
});
