import type { SavedItem } from "@/shared/schemas";

export type ListSortMode = "price-asc" | "price-desc";

export type ListQueryParams = {
  currency: string;
  storeDomain?: string;
  search?: string;
  sort: ListSortMode;
};

export function normalizeSearchText(text: string): string {
  return text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

export function compareSavedItems(a: SavedItem, b: SavedItem, sort: ListSortMode): number {
  const priceDiff =
    sort === "price-asc" ? a.price.amount - b.price.amount : b.price.amount - a.price.amount;
  if (priceDiff !== 0) {
    return priceDiff;
  }
  const updated = b.updatedAt.localeCompare(a.updatedAt);
  if (updated !== 0) {
    return updated;
  }
  return a.id.localeCompare(b.id);
}

export function sortByUpdatedAtDesc(items: SavedItem[]): SavedItem[] {
  return [...items].sort((a, b) => {
    const byUpdated = b.updatedAt.localeCompare(a.updatedAt);
    if (byUpdated !== 0) {
      return byUpdated;
    }
    return a.id.localeCompare(b.id);
  });
}

export function applyListQuery(items: SavedItem[], params: ListQueryParams): SavedItem[] {
  const searchNorm = params.search ? normalizeSearchText(params.search.trim()) : "";
  const filtered = items.filter((item) => {
    if (item.price.currency !== params.currency) {
      return false;
    }
    if (params.storeDomain && item.storeDomain !== params.storeDomain) {
      return false;
    }
    if (searchNorm && !normalizeSearchText(item.name).includes(searchNorm)) {
      return false;
    }
    return true;
  });
  return [...filtered].sort((a, b) => compareSavedItems(a, b, params.sort));
}

export function uniqueCurrencies(items: SavedItem[]): string[] {
  return [...new Set(items.map((item) => item.price.currency))].sort();
}

export function uniqueStoreDomains(items: SavedItem[], currency: string): string[] {
  return [
    ...new Set(items.filter((i) => i.price.currency === currency).map((i) => i.storeDomain)),
  ].sort();
}

export function resolveDefaultCurrency(items: SavedItem[], preferred?: string): string {
  if (items.length === 0) {
    return preferred && preferred.length === 3 ? preferred : "BRL";
  }
  const currencies = uniqueCurrencies(items);
  if (preferred && currencies.includes(preferred)) {
    return preferred;
  }
  const newest = [...items].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
  return newest?.price.currency ?? "BRL";
}

export function listEmptyMessage(
  allItems: SavedItem[],
  visible: SavedItem[],
  params: ListQueryParams,
): string | null {
  if (allItems.length === 0) {
    return "Nenhum produto salvo.";
  }
  if (visible.length === 0) {
    return "Nenhum produto encontrado.";
  }
  const hasCurrencyItems = allItems.some((i) => i.price.currency === params.currency);
  if (!hasCurrencyItems) {
    return null;
  }
  return null;
}
