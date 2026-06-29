import { describe, it, expect } from "vitest";
import { countText } from "../routes/word-counter";
import { toHex } from "../routes/hash-generator";
import { newUuidV4, newUuidV7, formatUuid } from "../routes/uuid-generator";

describe("countText", () => {
  it("counts empty", () => {
    expect(countText("").words).toBe(0);
    expect(countText("").chars).toBe(0);
  });
  it("counts words and sentences", () => {
    const s = countText("Hello world. This is fine!");
    expect(s.words).toBe(5);
    expect(s.sentences).toBe(2);
  });
  it("handles paragraphs", () => {
    expect(countText("a\n\nb\n\nc").paragraphs).toBe(3);
  });
});

describe("toHex", () => {
  it("hex-encodes bytes", () => {
    const buf = new Uint8Array([0, 1, 15, 255]).buffer;
    expect(toHex(buf)).toBe("00010fff");
  });
});

describe("uuid", () => {
  const RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
  it("v4 matches RFC shape", () => {
    expect(newUuidV4()).toMatch(RE);
  });
  it("v7 sets version nibble to 7 and sorts by time", () => {
    const a = newUuidV7(1_700_000_000_000);
    const b = newUuidV7(1_800_000_000_000);
    expect(a[14]).toBe("7");
    expect(b[14]).toBe("7");
    expect(a < b).toBe(true);
  });
  it("formatUuid honours options", () => {
    const id = "0a0b0c0d-0e0f-4a1b-8c2d-3e4f5061728a";
    expect(formatUuid(id, { upper: true })).toBe(id.toUpperCase());
    expect(formatUuid(id, { hyphens: false })).toBe(id.replace(/-/g, ""));
    expect(formatUuid(id, { braces: true })).toBe(`{${id}}`);
  });
});
