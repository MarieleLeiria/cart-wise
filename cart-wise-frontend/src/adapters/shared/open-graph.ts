export function readMetaContent(doc: Document, property: string): string | undefined {
  const byProperty = doc.querySelector(`meta[property="${property}"]`);
  if (byProperty) {
    return byProperty.getAttribute("content") ?? undefined;
  }
  const byName = doc.querySelector(`meta[name="${property}"]`);
  return byName?.getAttribute("content") ?? undefined;
}
