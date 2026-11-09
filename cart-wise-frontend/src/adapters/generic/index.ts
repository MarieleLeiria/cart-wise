import { extractGenericProduct } from "@/adapters/shared/generic-extract";
import type { StoreAdapter } from "@/adapters/types";

export const genericAdapter: StoreAdapter = {
  id: "generic",
  matches() {
    return true;
  },
  async extract() {
    const trigger =
      (globalThis as { __cartwiseTrigger?: "auto" | "manual" }).__cartwiseTrigger ?? "manual";
    return extractGenericProduct(document, location.href, "generic", trigger);
  },
};
