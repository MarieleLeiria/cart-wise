/** Indica se a página exige escolha de variação sem uma opção válida selecionada. */
export function isVariantSelectionMissing(doc: Document): boolean {
  const root = doc.querySelector("[data-cartwise-variant-required]");
  if (!root) {
    return false;
  }
  const selected =
    root.querySelector("[data-cartwise-variant-selected='true']") ??
    root.querySelector("option[selected]:not([value=''])") ??
    root.querySelector(".variant-selected");
  return !selected;
}
