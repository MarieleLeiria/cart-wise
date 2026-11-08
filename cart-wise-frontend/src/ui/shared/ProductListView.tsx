import { useEffect, useMemo, useState } from "react";
import type { SavedItem } from "@/shared/schemas";
import { ItemRow } from "@/ui/shared/ItemRow";
import { ListToolbar } from "@/ui/shared/ListToolbar";
import {
  applyListQuery,
  sortByUpdatedAtDesc,
  listEmptyMessage,
  resolveDefaultCurrency,
  uniqueCurrencies,
  uniqueStoreDomains,
  type ListSortMode,
} from "@/ui/shared/list-query";
import { loadListPreferences, saveListCurrency, saveListSort } from "@/ui/shared/list-preferences";
import { useSavedItems } from "@/ui/shared/use-saved-items";

type ProductListViewProps = {
  limit?: number;
  limitByUpdatedAt?: boolean;
  showFilters: boolean;
};

export function ProductListView({ limit, limitByUpdatedAt, showFilters }: ProductListViewProps) {
  const items = useSavedItems();
  const [search, setSearch] = useState("");
  const [storeDomain, setStoreDomain] = useState("");
  const [sort, setSort] = useState<ListSortMode>("price-asc");
  const [currencyOverride, setCurrencyOverride] = useState<string | undefined>();
  const [storedCurrency, setStoredCurrency] = useState<string | undefined>();

  useEffect(() => {
    void loadListPreferences().then((prefs) => {
      if (prefs.sort) {
        setSort(prefs.sort);
      }
      setStoredCurrency(prefs.currency);
    });
  }, []);

  const currency = useMemo(() => {
    const selected = resolveDefaultCurrency(items, currencyOverride ?? storedCurrency);
    if (items.length > 0 && !items.some((item) => item.price.currency === selected)) {
      return resolveDefaultCurrency(items);
    }
    return selected;
  }, [currencyOverride, items, storedCurrency]);

  const currencies = useMemo(() => {
    const found = uniqueCurrencies(items);
    return found.length > 0 ? found : ["BRL"];
  }, [items]);

  const storeDomains = useMemo(() => uniqueStoreDomains(items, currency), [items, currency]);

  const queryParams = useMemo(
    () => ({
      currency,
      storeDomain: storeDomain || undefined,
      search,
      sort,
    }),
    [currency, search, sort, storeDomain],
  );

  const visible = useMemo(() => {
    if (limitByUpdatedAt && limit) {
      const recent = sortByUpdatedAtDesc(
        items.filter((item) => item.price.currency === currency),
      );
      return recent.slice(0, limit);
    }
    const filtered = applyListQuery(items, queryParams);
    return limit ? filtered.slice(0, limit) : filtered;
  }, [currency, items, limit, limitByUpdatedAt, queryParams]);

  const emptyMessage = listEmptyMessage(items, visible, queryParams);

  return (
    <section className="product-list">
      <ListToolbar
        currencies={currencies}
        storeDomains={storeDomains}
        currency={currency}
        storeDomain={storeDomain}
        search={search}
        sort={sort}
        showFilters={showFilters}
        onCurrencyChange={(value) => {
          setCurrencyOverride(value);
          void saveListCurrency(value);
        }}
        onSortChange={(value) => {
          setSort(value);
          void saveListSort(value);
        }}
        onSearchChange={setSearch}
        onStoreChange={setStoreDomain}
      />
      {emptyMessage ? <p className="product-list__empty">{emptyMessage}</p> : null}
      {!emptyMessage && visible.length === 0 ? (
        <p className="product-list__empty">Nenhum produto encontrado.</p>
      ) : null}
      <div className="product-list__items">
        {visible.map((item: SavedItem) => (
          <ItemRow key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
