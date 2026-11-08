import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "@playwright/test";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  testDir: "tests/e2e",
  retries: 0,
  fullyParallel: false,
  workers: 1,
  globalSetup: path.join(dirname, "tests/e2e/global-setup.ts"),
  use: {
    headless: true,
  },
});
