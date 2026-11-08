const QUICK_MS = 500;
const MAX_WAIT_MS = 2000;
const TICK_MS = 100;

export async function waitForPredicate(
  predicate: () => boolean,
  maxMs = MAX_WAIT_MS,
): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start <= maxMs) {
    if (predicate()) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, TICK_MS));
  }
  return predicate();
}

export async function waitForPriceInDom(readPrice: () => string | undefined): Promise<string | undefined> {
  const immediate = readPrice();
  if (immediate) {
    return immediate;
  }
  await waitForPredicate(() => Boolean(readPrice()), MAX_WAIT_MS);
  return readPrice();
}

export { MAX_WAIT_MS, QUICK_MS };
