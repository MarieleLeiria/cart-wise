import { genericAdapter } from "@/adapters/generic";
import type { StoreAdapter } from "@/adapters/types";
import type { CaptureReason } from "@/shared/capture-reasons";
import type { CapturedProduct } from "@/shared/schemas";
import type { ExtractResult } from "@/adapters/types";

export function adaptersForUrl(url = "", trigger: "auto" | "manual" = "manual"): StoreAdapter[] {
  void url;
  void trigger;
  return [genericAdapter];
}

export function setCaptureTrigger(trigger: "auto" | "manual"): void {
  (globalThis as { __cartwiseTrigger?: "auto" | "manual" }).__cartwiseTrigger = trigger;
}

export async function runAdapterChain(
  adapters: StoreAdapter[],
  trigger: "auto" | "manual",
): Promise<ExtractResult> {
  setCaptureTrigger(trigger);
  const adapter = adapters[0] ?? genericAdapter;
  try {
    const result = await adapter.extract();
    if (result.status === "ok") {
      const product: CapturedProduct = {
        ...result.product,
        trigger,
        adapterId: adapter.id,
      };
      return { status: "ok", product };
    }
    if (result.status === "fail") {
      return result;
    }
    return { status: "fail", reason: "adapter_error" satisfies CaptureReason };
  } catch {
    return { status: "fail", reason: "adapter_error" satisfies CaptureReason };
  }
}
