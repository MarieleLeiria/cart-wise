import { afterEach, describe, expect, it, vi } from "vitest";
import type { NormalizedProduct } from "@/shared/schemas";
import { db } from "@/storage/db";
import { savedItemRepository } from "@/storage/saved-items";

const product: NormalizedProduct = {
  name: "Produto",
  images: ["https://cdn.example/x.jpg"],
  productUrl: "https://shop.example/p",
  storeDomain: "shop.example",
  storeName: null,
  price: { amount: 100, currency: "BRL" },
  variant: {},
  variantKey: "",
  source: { adapterId: "generic", trigger: "manual" },
};

afterEach(async () => {
  await db.savedItems.clear();
});

describe("savedItemRepository observe/remove", () => {
  it("FR-LST-009 observe emite apos upsert", async () => {
    const values: number[] = [];
    const sub = savedItemRepository.observe().subscribe((items) => {
      values.push(items.length);
    });
    await savedItemRepository.upsertFromCapture(product);
    await vi.waitFor(() => expect(values.at(-1)).toBe(1));
    sub.unsubscribe();
  });

  it("FR-remove remove por id", async () => {
    const saved = await savedItemRepository.upsertFromCapture(product);
    await savedItemRepository.remove(saved.id);
    expect(await savedItemRepository.list()).toHaveLength(0);
  });

  it("FR-list filtra moeda", async () => {
    await savedItemRepository.upsertFromCapture(product);
    await savedItemRepository.upsertFromCapture({
      ...product,
      productUrl: "https://shop.example/p2",
      price: { amount: 1, currency: "USD" },
    });
    expect(await savedItemRepository.list({ currency: "USD" })).toHaveLength(1);
  });
});
