import Dexie, { type Table } from "dexie";
import type { SavedItem } from "@/shared/schemas";

export class CartWiseDatabase extends Dexie {
  savedItems!: Table<SavedItem, string>;

  constructor(name = "CartWiseDB") {
    super(name);
    this.version(1).stores({
      savedItems: "id, &dedupeKey, storeDomain, price.currency, updatedAt, price.amount",
    });
    this.version(2).stores({
      savedItems: "id, &dedupeKey, storeDomain, price.currency, updatedAt, price.amount",
    });
  }
}

export const db = new CartWiseDatabase();
