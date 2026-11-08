const addToCartPatterns = [
  /adicionar ao carrinho/i,
  /adicionar à sacola/i,
  /comprar agora/i,
  /add to cart/i,
  /buy now/i,
];

const addToCartAttributeHints = ["add-to-cart", "addToCart", "addtocart", "btn-add-cart"];

function elementText(element: Element): string {
  const el = element as HTMLElement;
  return (el.innerText ?? el.textContent ?? "").trim();
}

function attributeHints(element: Element): string {
  const names = ["name", "id", "data-testid", "class", "aria-label"];
  return names
    .map((attr) => element.getAttribute(attr) ?? "")
    .join(" ");
}

export function isAddToCartLikeTarget(element: Element): boolean {
  const text = elementText(element);
  const attrs = attributeHints(element);
  if (addToCartPatterns.some((pattern) => pattern.test(text) || pattern.test(attrs))) {
    return true;
  }
  if (addToCartAttributeHints.some((hint) => attrs.toLowerCase().includes(hint.toLowerCase()))) {
    return true;
  }
  if (element instanceof HTMLButtonElement || element instanceof HTMLInputElement) {
    const value = element.value ?? "";
    if (addToCartPatterns.some((pattern) => pattern.test(value))) {
      return true;
    }
  }
  return false;
}

export function findAddToCartTargetFromEvent(target: EventTarget | null): Element | null {
  if (!(target instanceof Element)) {
    return null;
  }
  let current: Element | null = target;
  while (current && current !== document.body) {
    if (isAddToCartLikeTarget(current)) {
      return current;
    }
    current = current.parentElement;
  }
  return null;
}
