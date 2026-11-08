import { describe, expect, it, vi } from "vitest";
import { setFailureBadge } from "@/background/badge";
import { applyCommandResultBadge } from "@/background/on-command-result";

vi.mock("@/background/badge", () => ({
  setFailureBadge: vi.fn(),
  setSuccessBadge: vi.fn(),
}));

describe("applyCommandResultBadge", () => {
  it("marca badge em falha com reason", () => {
    applyCommandResultBadge({ ok: false, reason: "adapter_error" });
    expect(setFailureBadge).toHaveBeenCalled();
  });

  it("ignora sucesso e permission", () => {
    vi.mocked(setFailureBadge).mockClear();
    applyCommandResultBadge({ ok: true });
    applyCommandResultBadge({ ok: false, permission: "denied" });
    expect(setFailureBadge).not.toHaveBeenCalled();
  });
});
