import { readMetaContent } from "@/adapters/shared/open-graph";
import { productOffer, readJsonLdProducts } from "@/adapters/shared/json-ld";
import { waitForPriceInDom } from "@/adapters/shared/wait-for-price";
import type { CaptureReason } from "@/shared/capture-reasons";
import type { CapturedProduct } from "@/shared/schemas";
import type { ExtractResult } from "@/adapters/types";

function scalarToString(value: unknown): string | undefined {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number") {
    return String(value);
  }
  return undefined;
}

function httpsImages(values: Array<string | undefined>): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    if (!value?.startsWith("https://")) {
      continue;
    }
    if (seen.has(value)) {
      continue;
    }
    seen.add(value);
    out.push(value);
    if (out.length >= 10) {
      break;
    }
  }
  return out;
}

function readPriceFromDom(doc: Document): string | undefined {
  const micro = doc.querySelector("[itemprop=price]");
  const content = micro?.getAttribute("content") ?? micro?.textContent ?? "";
  const text = content.trim();
  if (text && /\d/.test(text)) {
    return text;
  }
  const sale = doc.querySelector("[data-price], .sale-price, .price__current");
  const saleText = sale?.textContent?.trim() ?? "";
  if (saleText && /\d/.test(saleText)) {
    return saleText;
  }
  return undefined;
}

function strikeThroughOnly(doc: Document, priceText: string): boolean {
  const nodes = doc.querySelectorAll(".old-price, .price--old, [data-testid='list-price']");
  for (const node of nodes) {
    const text = node.textContent?.trim() ?? "";
    if (text && text === priceText) {
      return true;
    }
  }
  return false;
}

function collectBaseFields(doc: Document): {
  name?: string;
  priceText?: string;
  currencyHint?: string;
  images: string[];
} {
  const products = readJsonLdProducts(doc);
  let name: string | undefined;
  let priceText: string | undefined;
  let currencyHint: string | undefined;
  const imageCandidates: Array<string | undefined> = [];

  for (const product of products) {
    if (!name) {
      name = scalarToString(product.name);
    }
    const offer = productOffer(product);
    if (offer) {
      if (!priceText) {
        priceText = scalarToString(offer.price);
      }
      if (!currencyHint) {
        currencyHint = scalarToString(offer.priceCurrency);
      }
    }
    const image = product.image;
    if (typeof image === "string") {
      imageCandidates.push(image);
    } else if (Array.isArray(image)) {
      imageCandidates.push(
        ...image.map((v) => scalarToString(v)).filter((v): v is string => Boolean(v)),
      );
    }
  }

  if (!name) {
    name = readMetaContent(doc, "og:title") ?? doc.querySelector("h1")?.textContent?.trim();
  }

  const ogImage = readMetaContent(doc, "og:image");
  imageCandidates.push(ogImage);

  if (!priceText) {
    priceText =
      readMetaContent(doc, "product:price:amount") ??
      readMetaContent(doc, "og:price:amount") ??
      readPriceFromDom(doc);
  }
  if (!currencyHint) {
    currencyHint =
      readMetaContent(doc, "product:price:currency") ?? readMetaContent(doc, "og:price:currency");
  }

  return {
    name,
    priceText,
    currencyHint,
    images: httpsImages(imageCandidates),
  };
}

export async function extractGenericProduct(
  doc: Document,
  pageUrl: string,
  adapterId: string,
  trigger: CapturedProduct["trigger"],
): Promise<ExtractResult> {
  const base = collectBaseFields(doc);
  const priceText = await waitForPriceInDom(() => {
    const next = collectBaseFields(doc);
    return next.priceText;
  });

  if (!base.name) {
    return { status: "fail", reason: "name_not_found" satisfies CaptureReason };
  }
  if (!priceText) {
    return { status: "fail", reason: "price_not_found" satisfies CaptureReason };
  }
  if (strikeThroughOnly(doc, priceText)) {
    const sale = readPriceFromDom(doc);
    if (!sale) {
      return { status: "fail", reason: "price_not_found" satisfies CaptureReason };
    }
    base.priceText = sale;
  } else {
    base.priceText = priceText;
  }

  if (base.images.length === 0) {
    return { status: "fail", reason: "no_image" satisfies CaptureReason };
  }

  const product: CapturedProduct = {
    name: base.name,
    images: base.images,
    pageUrl,
    priceText: base.priceText,
    currencyHint: base.currencyHint,
    variant: {},
    adapterId,
    trigger,
  };

  if (!product.priceText || !/\d/.test(product.priceText)) {
    return { status: "fail", reason: "price_not_found" satisfies CaptureReason };
  }

  return { status: "ok", product };
}

export function extractGenericFromFixtureHtml(
  html: string,
  pageUrl: string,
): Promise<ExtractResult> {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return extractGenericProduct(doc, pageUrl, "generic", "manual");
}
