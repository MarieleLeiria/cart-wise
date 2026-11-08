import type { StoreAdapter } from "@/adapters/types";
import { genericAdapter } from "@/adapters/generic";
import { storeAdapters } from "@/adapters/registry";
import type { CaptureReason } from "@/shared/capture-reasons";
import type { CapturedProduct } from "@/shared/schemas";
import type { ExtractResult } from "@/adapters/types";

export function adaptersForUrl(url: string, trigger: "auto" | "manual"): StoreAdapter[] {
  const specific = storeAdapters.filter((a) => a.id !== "generic" && a.matches(url));
  if (trigger === "manual") {
    const first = specific[0];
    return first ? [first] : [genericAdapter];
  }
  if (specific.length > 0) {
    const first = specific[0];
    return first ? [first, genericAdapter] : [genericAdapter];
  }
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
  for (let index = 0; index < adapters.length; index += 1) {
    const adapter = adapters[index];
    if (!adapter) {
      continue;
    }
    let result: ExtractResult;
    try {
      result = await adapter.extract();
    } catch {
      return { status: "fail", reason: "adapter_error" satisfies CaptureReason };
    }
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
    if (index === adapters.length - 1) {
      return { status: "fail", reason: "adapter_error" satisfies CaptureReason };
    }
  }
  return { status: "fail", reason: "adapter_error" satisfies CaptureReason };
}
