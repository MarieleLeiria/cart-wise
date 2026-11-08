import type { ListSortMode } from "@/ui/shared/list-query";

type ListToolbarProps = {
  currencies: string[];
  storeDomains: string[];
  currency: string;
  storeDomain: string;
  search: string;
  sort: ListSortMode;
  showFilters: boolean;
  onCurrencyChange: (value: string) => void;
  onStoreChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onSortChange: (value: ListSortMode) => void;
};

export function ListToolbar({
  currencies,
  storeDomains,
  currency,
  storeDomain,
  search,
  sort,
  showFilters,
  onCurrencyChange,
  onStoreChange,
  onSearchChange,
  onSortChange,
}: ListToolbarProps) {
  return (
    <div className="list-toolbar">
      <label>
        Moeda
        <select
          value={currency}
          onChange={(event) => onCurrencyChange(event.target.value)}
          aria-label="Moeda"
        >
          {currencies.map((code) => (
            <option key={code} value={code}>
              {code}
            </option>
          ))}
        </select>
      </label>
      {showFilters ? (
        <>
          <label>
            Loja
            <select
              value={storeDomain}
              onChange={(event) => onStoreChange(event.target.value)}
              aria-label="Loja"
            >
              <option value="">Todas</option>
              {storeDomains.map((domain) => (
                <option key={domain} value={domain}>
                  {domain}
                </option>
              ))}
            </select>
          </label>
          <label>
            Busca
            <input
              type="search"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              aria-label="Buscar por nome"
            />
          </label>
          <label>
            Ordenação
            <select
              value={sort}
              onChange={(event) => onSortChange(event.target.value as ListSortMode)}
              aria-label="Ordenação por preço"
            >
              <option value="price-asc">Preço crescente</option>
              <option value="price-desc">Preço decrescente</option>
            </select>
          </label>
        </>
      ) : null}
    </div>
  );
}
