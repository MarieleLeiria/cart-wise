import { liveQuery } from "dexie";
import { Observable } from "rxjs";
import { dedupeKeyForProduct } from "@/shared/dedupe-key";
import type { NormalizedProduct, SavedItem } from "@/shared/schemas";
import { db } from "@/storage/db";

export type SavedItemQuery = {
  currency?: string;
};

function newId(): string {
  return crypto.randomUUID();
}

function nowIso(): string {
  return new Date().toISOString();
}

async function upsertFromCapture(item: NormalizedProduct): Promise<SavedItem> {
  const dedupeKey = dedupeKeyForProduct(item);
  const existing = await db.savedItems.get({ dedupeKey });
  const timestamp = nowIso();
  if (existing) {
    const updated: SavedItem = {
      ...existing,
      ...item,
      dedupeKey,
      updatedAt: timestamp,
    };
    await db.savedItems.put(updated);
    return updated;
  }
  const created: SavedItem = {
    ...item,
    id: newId(),
    dedupeKey,
    capturedAt: timestamp,
    updatedAt: timestamp,
  };
  await db.savedItems.add(created);
  return created;
}

async function list(query?: SavedItemQuery): Promise<SavedItem[]> {
  const all = await db.savedItems.toArray();
  if (!query?.currency) {
    return all;
  }
  return all.filter((item) => item.price.currency === query.currency);
}

function observe(query?: SavedItemQuery): Observable<SavedItem[]> {
  return new Observable((subscriber) => {
    const subscription = liveQuery(() => list(query)).subscribe(
      (value) => subscriber.next(value),
      (error) => subscriber.error(error),
    );
    return () => subscription.unsubscribe();
  });
}

async function remove(id: string): Promise<void> {
  await db.savedItems.delete(id);
}

export const savedItemRepository = {
  upsertFromCapture,
  list,
  observe,
  remove,
};

export type SavedItemRepository = typeof savedItemRepository;
