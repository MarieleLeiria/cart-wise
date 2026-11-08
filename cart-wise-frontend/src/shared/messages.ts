import { z } from "zod";
import { captureReasonSchema } from "@/shared/schemas";
import { capturedProductSchema } from "@/shared/schemas";

export const itemCapturedMessageSchema = z.object({
  type: z.literal("ITEM_CAPTURED"),
  payload: capturedProductSchema,
});

export const captureActiveTabMessageSchema = z.object({
  type: z.literal("CAPTURE_ACTIVE_TAB"),
  tabId: z.number().int().nonnegative(),
  source: z.enum(["popup", "command", "context_menu"]),
});

export const runCaptureMessageSchema = z.object({
  type: z.literal("RUN_CAPTURE"),
  trigger: z.enum(["manual"]),
});

export const captureFailedMessageSchema = z.object({
  type: z.literal("CAPTURE_FAILED"),
  reason: captureReasonSchema,
  trigger: z.enum(["auto", "manual"]),
});

export const runtimeMessageSchema = z.discriminatedUnion("type", [
  itemCapturedMessageSchema,
  captureActiveTabMessageSchema,
  runCaptureMessageSchema,
  captureFailedMessageSchema,
]);

export type ItemCapturedMessage = z.infer<typeof itemCapturedMessageSchema>;
export type CaptureActiveTabMessage = z.infer<typeof captureActiveTabMessageSchema>;
export type RunCaptureMessage = z.infer<typeof runCaptureMessageSchema>;
export type CaptureFailedMessage = z.infer<typeof captureFailedMessageSchema>;
export type RuntimeMessage = z.infer<typeof runtimeMessageSchema>;
