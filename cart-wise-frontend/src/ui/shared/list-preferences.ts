import type { ListSortMode } from "@/ui/shared/list-query";

const CURRENCY_KEY = "ui.listCurrency";
const SORT_KEY = "ui.listSort";

export type ListPreferences = {
  currency: string;
  sort: ListSortMode;
};

export async function loadListPreferences(): Promise<Partial<ListPreferences>> {
  const stored = await chrome.storage.local.get([CURRENCY_KEY, SORT_KEY]);
  const rawCurrency = stored[CURRENCY_KEY];
  const currency = typeof rawCurrency === "string" ? rawCurrency : undefined;
  const rawSort = stored[SORT_KEY];
  const sort = rawSort === "price-asc" || rawSort === "price-desc" ? rawSort : undefined;
  return { currency, sort };
}

export async function saveListCurrency(currency: string): Promise<void> {
  await chrome.storage.local.set({ [CURRENCY_KEY]: currency });
}

export async function saveListSort(sort: ListSortMode): Promise<void> {
  await chrome.storage.local.set({ [SORT_KEY]: sort });
}
