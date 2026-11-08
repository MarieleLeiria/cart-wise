import type { CaptureReason } from "@/shared/capture-reasons";
import { captureReasonLabels } from "@/shared/capture-reasons";

export const SAVE_BUTTON_LABEL = "Salvar no CartWise";

export const permissionTexts = {
  request: "O CartWise precisa de permissão para ler esta página.",
  denied: "Sem permissão, este site não pode ser salvo.",
  not_https: "Só é possível salvar páginas HTTPS.",
} as const;

export const toastSuccessTexts = {
  created: "Produto salvo.",
  updated: "Produto atualizado.",
} as const;

export function reasonMessage(reason: CaptureReason): string {
  return captureReasonLabels[reason];
}

export type CaptureUiResult =
  | { kind: "success"; created: boolean; name: string }
  | { kind: "failure"; reason: CaptureReason }
  | { kind: "permission"; permission: "denied" | "not_https" | "request" };

export function popupMessageFor(result: CaptureUiResult): string {
  if (result.kind === "permission") {
    return permissionTexts[result.permission];
  }
  if (result.kind === "success") {
    return result.created ? toastSuccessTexts.created : toastSuccessTexts.updated;
  }
  return reasonMessage(result.reason);
}

export function toastMessageFor(result: CaptureUiResult): string | null {
  if (result.kind === "permission") {
    return null;
  }
  if (result.kind === "success") {
    return result.created ? toastSuccessTexts.created : toastSuccessTexts.updated;
  }
  return reasonMessage(result.reason);
}
