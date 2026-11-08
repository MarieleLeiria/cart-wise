import { storeAdapters } from "@/adapters/registry";
import { findAddToCartTargetFromEvent } from "@/adapters/shared/add-to-cart-target";
import { performCapture } from "@/content/capture";

export function registerAutoCaptureListener(): void {
  const adapter = storeAdapters.find((a) => a.id !== "generic" && a.matches(location.href));
  if (!adapter) {
    return;
  }

  document.addEventListener(
    "click",
    (event) => {
      const target = findAddToCartTargetFromEvent(event.target);
      if (!target) {
        return;
      }
      if (adapter.isAddToCartTarget && !adapter.isAddToCartTarget(target)) {
        return;
      }
      queueMicrotask(() => {
        void performCapture("auto");
      });
    },
    true,
  );
}
