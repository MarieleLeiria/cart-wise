import { afterEach, describe, expect, it, vi } from "vitest";
import { waitForPredicate } from "@/adapters/shared/wait-for-price";

afterEach(() => {
  vi.useRealTimers();
});

describe("waitForPredicate", () => {
  it("retorna quando predicate fica true", async () => {
    vi.useFakeTimers();
    let attempts = 0;
    const promise = waitForPredicate(() => {
      attempts += 1;
      return attempts >= 2;
    }, 500);
    await vi.advanceTimersByTimeAsync(150);
    expect(await promise).toBe(true);
    vi.useRealTimers();
  });
});
