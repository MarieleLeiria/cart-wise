import { afterEach, describe, expect, it } from "vitest";
import type { NormalizedProduct } from "@/shared/schemas";
import { db } from "@/storage/db";
import { savedItemRepository } from "@/storage/saved-items";

const product: NormalizedProduct = {
  name: "Camisa",
  images: ["https://cdn.example/x.jpg"],
  productUrl: "https://shop.example/p",
  storeDomain: "shop.example",
  storeName: "Shop",
  price: { amount: 4990, currency: "BRL" },
  variant: {},
  variantKey: "",
  source: { adapterId: "generic", trigger: "manual" },
};

afterEach(async () => {
  await db.savedItems.clear();
});

describe("savedItemRepository", () => {
  it("FR-storage upsert cria e atualiza dedupeKey", async () => {
    const first = await savedItemRepository.upsertFromCapture(product);
    expect(first.id).toBeTruthy();
    const second = await savedItemRepository.upsertFromCapture({
      ...product,
      name: "Camisa nova",
      price: { amount: 5990, currency: "BRL" },
    });
    expect(second.id).toBe(first.id);
    expect(second.name).toBe("Camisa nova");
    const all = await savedItemRepository.list();
    expect(all).toHaveLength(1);
  });
});
