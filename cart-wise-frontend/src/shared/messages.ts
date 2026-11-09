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

export const activateSiteMessageSchema = z.object({
  type: z.literal("ACTIVATE_SITE"),
  tabId: z.number().int().nonnegative(),
  url: z.string().min(1),
});

export const deactivateSiteMessageSchema = z.object({
  type: z.literal("DEACTIVATE_SITE"),
  pattern: z.string().min(1),
});

export const getSiteStatusMessageSchema = z.object({
  type: z.literal("GET_SITE_STATUS"),
  url: z.string().min(1),
});

export const listActiveSitesMessageSchema = z.object({
  type: z.literal("LIST_ACTIVE_SITES"),
});

export const runtimeMessageSchema = z.discriminatedUnion("type", [
  itemCapturedMessageSchema,
  captureActiveTabMessageSchema,
  runCaptureMessageSchema,
  captureFailedMessageSchema,
  activateSiteMessageSchema,
  deactivateSiteMessageSchema,
  getSiteStatusMessageSchema,
  listActiveSitesMessageSchema,
]);

export type ItemCapturedMessage = z.infer<typeof itemCapturedMessageSchema>;
export type CaptureActiveTabMessage = z.infer<typeof captureActiveTabMessageSchema>;
export type RunCaptureMessage = z.infer<typeof runCaptureMessageSchema>;
export type CaptureFailedMessage = z.infer<typeof captureFailedMessageSchema>;
export type ActivateSiteMessage = z.infer<typeof activateSiteMessageSchema>;
export type DeactivateSiteMessage = z.infer<typeof deactivateSiteMessageSchema>;
export type GetSiteStatusMessage = z.infer<typeof getSiteStatusMessageSchema>;
export type ListActiveSitesMessage = z.infer<typeof listActiveSitesMessageSchema>;
export type RuntimeMessage = z.infer<typeof runtimeMessageSchema>;
