import { describe, expect, it } from "vitest";
import { readMetaContent } from "@/adapters/shared/open-graph";

describe("readMetaContent", () => {
  it("lê property e name", () => {
    document.head.innerHTML = `
      <meta property="og:title" content="T" />
      <meta name="og:desc" content="D" />`;
    expect(readMetaContent(document, "og:title")).toBe("T");
    expect(readMetaContent(document, "og:desc")).toBe("D");
    expect(readMetaContent(document, "missing")).toBeUndefined();
  });
});
