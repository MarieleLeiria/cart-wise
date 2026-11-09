import { describe, expect, it } from "vitest";
import { genericAdapter } from "@/adapters/generic";

describe("genericAdapter", () => {
  it("matches qualquer URL", () => {
    expect(genericAdapter.matches("https://any.example")).toBe(true);
  });
});
