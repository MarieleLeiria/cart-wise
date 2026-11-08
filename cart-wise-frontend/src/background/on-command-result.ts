import { setFailureBadge } from "@/background/badge";

export function applyCommandResultBadge(result: unknown): void {
  if (
    result &&
    typeof result === "object" &&
    "ok" in result &&
    !(result as { ok: boolean }).ok &&
    "reason" in result
  ) {
    setFailureBadge();
  }
}
