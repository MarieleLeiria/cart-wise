import { ProductListView } from "@/ui/shared/ProductListView";

export function DashboardApp() {
  return (
    <main className="dashboard">
      <header>
        <h1>Produtos salvos</h1>
      </header>
      <ProductListView showFilters />
    </main>
  );
}
