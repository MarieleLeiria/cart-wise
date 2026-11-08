import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ItemCapturedMessage } from "@/shared/messages";
import * as captureTab from "@/background/capture-tab";
import { handleCaptureActiveTab } from "@/background/capture-flow";

const captured: ItemCapturedMessage = {
  type: "ITEM_CAPTURED",
  payload: {
    name: "Produto",
    images: ["https://cdn.example/i.jpg"],
    pageUrl: "https://www.amazon.com.br/dp/1",
    priceText: "R$ 10,00",
    currencyHint: "BRL",
    variant: {},
    adapterId: "amazon-com-br",
    trigger: "manual",
  },
};

beforeEach(() => {
  vi.stubGlobal("chrome", {
    action: { setBadgeText: vi.fn(), setBadgeBackgroundColor: vi.fn() },
    tabs: { sendMessage: vi.fn(() => Promise.resolve({ ok: true })) },
  });
});

describe("handleCaptureActiveTab branches", () => {
  it("persiste ITEM_CAPTURED", async () => {
    vi.spyOn(captureTab, "captureActiveTab").mockResolvedValue(captured);
    const result = await handleCaptureActiveTab({
      type: "CAPTURE_ACTIVE_TAB",
      tabId: 1,
      source: "popup",
    });
    expect(result.ok).toBe(true);
  });

  it("propaga permission", async () => {
    vi.spyOn(captureTab, "captureActiveTab").mockResolvedValue({
      ok: false,
      permission: "denied",
    });
    const result = await handleCaptureActiveTab({
      type: "CAPTURE_ACTIVE_TAB",
      tabId: 1,
      source: "popup",
    });
    expect(result).toEqual({ ok: false, permission: "denied" });
  });

  it("propaga failure reason", async () => {
    vi.spyOn(captureTab, "captureActiveTab").mockResolvedValue({
      ok: false,
      reason: "price_not_found",
    });
    const result = await handleCaptureActiveTab({
      type: "CAPTURE_ACTIVE_TAB",
      tabId: 1,
      source: "popup",
    });
    expect(result).toEqual({ ok: false, reason: "price_not_found" });
  });

  it("adapter_error quando resposta inesperada", async () => {
    vi.spyOn(captureTab, "captureActiveTab").mockResolvedValue({ ok: true } as never);
    const result = await handleCaptureActiveTab({
      type: "CAPTURE_ACTIVE_TAB",
      tabId: 1,
      source: "popup",
    });
    expect(result).toEqual({ ok: false, reason: "adapter_error" });
  });
});
