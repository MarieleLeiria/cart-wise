import { useCallback, useEffect, useState } from "react";
import { ProductListView } from "@/ui/shared/ProductListView";
import { siteActivationTexts } from "@/shared/capture-messages";

type ActiveSite = { pattern: string; hostname: string };

type ListResponse =
  | { ok: true; sites: ActiveSite[] }
  | { ok: false; reason?: string };

export function DashboardApp() {
  const [sites, setSites] = useState<ActiveSite[]>([]);
  const [loadingSites, setLoadingSites] = useState(true);

  const loadSites = useCallback(async () => {
    setLoadingSites(true);
    try {
      const response: ListResponse = await chrome.runtime.sendMessage({
        type: "LIST_ACTIVE_SITES",
      });
      if (response.ok) {
        setSites(response.sites);
      } else {
        setSites([]);
      }
    } finally {
      setLoadingSites(false);
    }
  }, []);

  useEffect(() => {
    const timer = globalThis.setTimeout(() => {
      void loadSites();
    }, 0);
    return () => globalThis.clearTimeout(timer);
  }, [loadSites]);

  const deactivate = useCallback(
    async (pattern: string) => {
      await chrome.runtime.sendMessage({
        type: "DEACTIVATE_SITE",
        pattern,
      });
      await loadSites();
    },
    [loadSites],
  );

  return (
    <main className="dashboard">
      <header>
        <h1>Produtos salvos</h1>
      </header>
      <ProductListView showFilters />
      <section className="dashboard__sites" aria-labelledby="active-sites-heading">
        <h2 id="active-sites-heading">Sites ativados</h2>
        {loadingSites ? <p>Carregando sites…</p> : null}
        {!loadingSites && sites.length === 0 ? (
          <p>{siteActivationTexts.inactiveHint}</p>
        ) : null}
        {sites.length > 0 ? (
          <ul className="dashboard__site-list">
            {sites.map((site) => (
              <li key={site.pattern}>
                <span>{site.hostname}</span>
                <button type="button" onClick={() => void deactivate(site.pattern)}>
                  {siteActivationTexts.deactivate}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </main>
  );
}
