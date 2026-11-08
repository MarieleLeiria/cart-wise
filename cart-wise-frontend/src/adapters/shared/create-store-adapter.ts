import { isAddToCartLikeTarget } from "@/adapters/shared/add-to-cart-target";
import { urlMatchesDomain } from "@/adapters/shared/domains";
import { extractGenericProduct } from "@/adapters/shared/generic-extract";
import type { StoreAdapter } from "@/adapters/types";

export type StoreAdapterOptions = {
  id: string;
  domain: string;
  variantRequiredCheck?: (doc: Document) => boolean;
};

export function createStoreAdapter(options: StoreAdapterOptions): StoreAdapter {
  return {
    id: options.id,
    matches(url: string) {
      return urlMatchesDomain(url, options.domain);
    },
    isAddToCartTarget(element: Element) {
      return isAddToCartLikeTarget(element);
    },
    async extract() {
      if (options.variantRequiredCheck?.(document)) {
        return { status: "fail", reason: "variant_not_selected" };
      }
      const trigger =
        (globalThis as { __cartwiseTrigger?: "auto" | "manual" }).__cartwiseTrigger ?? "auto";
      const result = await extractGenericProduct(document, location.href, options.id, trigger);
      if (result.status === "ok") {
        return { ...result, product: { ...result.product, adapterId: options.id, trigger } };
      }
      if (result.status === "fail" && result.reason === "name_not_found") {
        return { status: "unhandled" };
      }
      return result;
    },
  };
}
