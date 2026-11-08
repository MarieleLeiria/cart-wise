import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { NormalizedProduct } from "@/shared/schemas";
import { db } from "@/storage/db";
import { savedItemRepository } from "@/storage/saved-items";
import { useSavedItems } from "@/ui/shared/use-saved-items";

const product: NormalizedProduct = {
  name: "Hook",
  images: ["https://cdn.example/x.jpg"],
  productUrl: "https://shop.example/hook",
  storeDomain: "shop.example",
  storeName: null,
  price: { amount: 10, currency: "BRL" },
  variant: {},
  variantKey: "",
  source: { adapterId: "generic", trigger: "manual" },
};

afterEach(async () => {
  await db.savedItems.clear();
});

describe("useSavedItems", () => {
  it("FR-LST-009 hook reflete storage", async () => {
    const { result } = renderHook(() => useSavedItems());
    expect(result.current).toHaveLength(0);
    await savedItemRepository.upsertFromCapture(product);
    await waitFor(() => expect(result.current.length).toBe(1));
  });
});
