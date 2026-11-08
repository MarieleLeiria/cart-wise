import type { CaptureReason } from "@/shared/capture-reasons";
import type { CapturedProduct } from "@/shared/schemas";

export type ExtractResult =
  | { status: "ok"; product: CapturedProduct }
  | { status: "fail"; reason: CaptureReason }
  | { status: "unhandled" };

export type StoreAdapter = {
  id: string;
  matches(url: string): boolean;
  isAddToCartTarget?(element: Element): boolean;
  extract(): Promise<ExtractResult>;
};
