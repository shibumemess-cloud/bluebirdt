import { describe, it, expect } from "vitest";
import { slugify, parseInBase, toBase, encodeHtml, decodeHtml } from "./extra-tools-helpers";

describe("slugify", () => {
  it("lowercases and joins words", () => {
    expect(slugify("Hello World!")).toBe("hello-world");
  });
  it("strips diacritics and handles &", () => {
    expect(slugify("Café & Crème")).toBe("cafe-and-creme");
  });
  it("supports underscore separator and max length", () => {
    expect(slugify("Long Title Here", { separator: "_", maxLength: 9 })).toBe("long_titl");
  });
  it("empty input returns empty", () => {
    expect(slugify("   ")).toBe("");
  });
});

describe("number base", () => {
  it("round-trips dec to hex", () => {
    const { n } = parseInBase("255", 10);
    expect(n).not.toBeNull();
    expect(toBase(n!, 16)).toBe("ff");
  });
  it("round-trips hex to bin", () => {
    const { n } = parseInBase("ff", 16);
    expect(toBase(n!, 2)).toBe("11111111");
  });
  it("rejects bad digits", () => {
    expect(parseInBase("2", 2).error).toMatch(/base-2/);
  });
  it("handles negatives", () => {
    const { n } = parseInBase("-10", 10);
    expect(toBase(n!, 16)).toBe("-a");
  });
});

describe("html entities", () => {
  it("encodes the dangerous five", () => {
    expect(encodeHtml(`<a href="x">'&'</a>`)).toBe("&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;");
  });
  it("encodes non-ASCII as numeric", () => {
    expect(encodeHtml("café", { mode: "numeric" })).toBe("caf&#233;");
  });
  it("decodes named, decimal and hex entities", () => {
    expect(decodeHtml("&lt;b&gt;hi&nbsp;&#233;&#x2014;&lt;/b&gt;")).toBe("<b>hi\u00a0é—</b>");
  });
  it("leaves unknown entities alone", () => {
    expect(decodeHtml("&foobar;")).toBe("&foobar;");
  });
});
