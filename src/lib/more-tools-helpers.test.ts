import { describe, it, expect } from "vitest";
import { transformUrl, transformUrlBatch } from "../routes/url-encoder";
import { generateLorem, generateSentence } from "../routes/lorem-ipsum";
import { parseTimestamp, formatRelative, detectUnit } from "../routes/timestamp-converter";


describe("transformUrl", () => {
  it("encodes a component", () => {
    expect(transformUrl("a b&c", "encode", "component").out).toBe("a%20b%26c");
  });
  it("preserves URL structure when scope=url", () => {
    expect(transformUrl("https://x.com/a b?q=1&r=2", "encode", "url").out)
      .toBe("https://x.com/a%20b?q=1&r=2");
  });
  it("returns an error for malformed decode", () => {
    expect(transformUrl("%E0%A4%A", "decode", "component").error).toBeTruthy();
  });
  it("handles empty input", () => {
    expect(transformUrl("", "encode", "component")).toEqual({ out: "" });
  });
});

describe("transformUrlBatch", () => {
  it("processes each line independently", () => {
    const r = transformUrlBatch("a b\nc&d", "encode", "component");
    expect(r.out).toBe("a%20b\nc%26d");
    expect(r.errorCount).toBe(0);
  });
  it("marks failed lines with an error comment", () => {
    const r = transformUrlBatch("ok\n%E0%A4%A", "decode", "component");
    expect(r.errorCount).toBe(1);
    expect(r.out.split("\n")[1].startsWith("# error:")).toBe(true);
  });
});

describe("detectUnit", () => {
  it("detects milliseconds for 13-digit values", () => {
    expect(detectUnit("1700000000000")).toBe("milliseconds");
  });
  it("detects seconds for 10-digit values", () => {
    expect(detectUnit("1700000000")).toBe("seconds");
  });
  it("returns null for non-numeric input", () => {
    expect(detectUnit("hello")).toBeNull();
  });
});


describe("generateLorem", () => {
  it("produces N paragraphs starting with the classic line when requested", () => {
    const out = generateLorem(3, "paragraphs", { startClassic: true, seed: 1 });
    expect(out.length).toBe(3);
    expect(out[0].startsWith("Lorem ipsum dolor sit amet")).toBe(true);
  });
  it("produces a word block of exactly N words", () => {
    const [out] = generateLorem(12, "words", { seed: 7 });
    expect(out.split(/\s+/).length).toBe(12);
  });
  it("sentence ends with a period", () => {
    const s = generateSentence(() => 0.5);
    expect(s.endsWith(".")).toBe(true);
  });
  it("clamps absurd counts", () => {
    expect(generateLorem(99999, "paragraphs", { seed: 2 }).length).toBe(200);
  });
});

describe("parseTimestamp", () => {
  it("parses seconds", () => {
    const d = parseTimestamp("1700000000", "seconds")!;
    expect(d.getUTCFullYear()).toBe(2023);
  });
  it("parses milliseconds", () => {
    const d = parseTimestamp("1700000000000", "milliseconds")!;
    expect(d.getUTCFullYear()).toBe(2023);
  });
  it("rejects garbage", () => {
    expect(parseTimestamp("abc", "seconds")).toBeNull();
  });
  it("rejects out-of-range values", () => {
    expect(parseTimestamp("999999999999999999", "milliseconds")).toBeNull();
  });
});

describe("formatRelative", () => {
  const now = new Date("2025-01-01T00:00:00Z");
  it("returns 'ago' for the past", () => {
    expect(formatRelative(new Date("2024-12-31T23:59:55Z"), now)).toMatch(/ago$/);
  });
  it("returns 'in' for the future", () => {
    expect(formatRelative(new Date("2025-01-01T01:00:00Z"), now)).toMatch(/^in /);
  });
});
