import type { DocsPin, DocsSourceKey, LoadedDocument } from "./types.js";

export function buildDocsPins(docs: LoadedDocument[]): DocsPin[] {
  const bySource = new Map<DocsSourceKey, { commit: string; ids: Set<string> }>();
  for (const d of docs) {
    let g = bySource.get(d.source);
    if (!g) {
      g = { commit: d.commit, ids: new Set() };
      bySource.set(d.source, g);
    } else if (g.commit !== d.commit) {
      throw new Error(`Mixed commits for source ${d.source}`);
    }
    g.ids.add(d.id);
  }
  return [...bySource.entries()].map(([source, v]) => ({
    source,
    commit: v.commit,
    documents: [...v.ids].sort(),
  }));
}
