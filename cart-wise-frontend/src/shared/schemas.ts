import { z } from "zod";
import { captureReasons } from "@/shared/capture-reasons";

export const variantRecordSchema = z.record(z.string(), z.string());

export const priceSchema = z.object({
  amount: z.number().int().nonnegative(),
  currency: z.string().length(3),
});

export const sourceSchema = z.object({
  adapterId: z.string().min(1),
  trigger: z.enum(["auto", "manual"]),
});

export const capturedProductSchema = z.object({
  name: z.string(),
  images: z.array(z.string()).min(1).max(10),
  pageUrl: z.string().url(),
  canonicalUrl: z.string().url().optional(),
  priceText: z.string().min(1),
  currencyHint: z.string().optional(),
  storeName: z.string().optional(),
  variant: variantRecordSchema,
  adapterId: z.string().min(1),
  trigger: z.enum(["auto", "manual"]),
});

export const normalizedProductSchema = z.object({
  name: z.string().min(1).max(300),
  images: z.array(z.string()).min(1),
  productUrl: z.string().url(),
  storeDomain: z.string().min(1),
  storeName: z.string().max(80).nullable(),
  price: priceSchema,
  variant: variantRecordSchema,
  variantKey: z.string(),
  source: sourceSchema,
});

export const savedItemSchema = normalizedProductSchema.extend({
  id: z.string().uuid(),
  dedupeKey: z.string().min(1),
  capturedAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type CapturedProduct = z.infer<typeof capturedProductSchema>;
export type NormalizedProduct = z.infer<typeof normalizedProductSchema>;
export type SavedItem = z.infer<typeof savedItemSchema>;
export type Price = z.infer<typeof priceSchema>;

export const captureReasonSchema = z.enum(captureReasons);
