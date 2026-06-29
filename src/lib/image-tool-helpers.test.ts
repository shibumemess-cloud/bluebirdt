import { describe, it, expect } from "vitest";
import {
  rgbToHex,
  rgbToHsl,
  rgbToOklch,
  contrastRatio,
  fromPx,
  toPx,
  placement,
  substituteTokens,
  hasPageToken,
  escapeWifi,
  buildWifiPayload,
  buildVCard,
  dpiToScale,
  pageFileName,
  parsePageRange,
  normalizeUrl,
  buildPassphrase,
  passphraseEntropyBits,
  jsonToYaml,
} from "./image-tool-helpers";



describe("color-picker helpers", () => {
  it("rgbToHex pads and uppercases", () => {
    expect(rgbToHex(0, 0, 0)).toBe("#000000");
    expect(rgbToHex(255, 255, 255)).toBe("#FFFFFF");
    expect(rgbToHex(15, 171, 32)).toBe("#0FAB20");
  });
  it("rgbToHex clamps out-of-range channels", () => {
    expect(rgbToHex(-5, 300, 128)).toBe("#00FF80");
  });
  it("rgbToHsl computes pure red", () => {
    expect(rgbToHsl(255, 0, 0)).toEqual({ h: 0, s: 100, l: 50 });
  });
  it("rgbToHsl computes neutral gray", () => {
    expect(rgbToHsl(128, 128, 128)).toEqual({ h: 0, s: 0, l: 50 });
  });
  it("rgbToOklch returns sane lightness range", () => {
    const w = rgbToOklch(255, 255, 255);
    const k = rgbToOklch(0, 0, 0);
    expect(w.L).toBeGreaterThan(0.99);
    expect(k.L).toBeLessThan(0.01);
    expect(w.C).toBeLessThan(0.01);
  });
  it("contrastRatio: black on white = 21", () => {
    const a = { hex: "#000", r: 0, g: 0, b: 0 };
    const b = { hex: "#FFF", r: 255, g: 255, b: 255 };
    expect(Math.round(contrastRatio(a, b))).toBe(21);
  });
  it("contrastRatio: identical colors = 1", () => {
    const c = { hex: "#789", r: 119, g: 119, b: 119 };
    expect(contrastRatio(c, c)).toBeCloseTo(1, 5);
  });
});

describe("image-resizer unit conversion", () => {
  it("fromPx px is identity", () => {
    expect(fromPx(300, "px", 72)).toBe(300);
  });
  it("inches round-trip", () => {
    const inches = fromPx(720, "in", 72);
    expect(inches).toBe(10);
    expect(toPx(inches, "in", 72)).toBe(720);
  });
  it("cm round-trip at 300 dpi", () => {
    const cm = fromPx(1181, "cm", 300);
    expect(cm).toBeCloseTo(10, 1);
    expect(toPx(10, "cm", 300)).toBeGreaterThan(1180);
  });
});

describe("watermark placement", () => {
  const W = 1000, H = 800, w = 200, h = 100, pad = 20;
  it("top-left anchors to top-left corner + padding", () => {
    expect(placement("tl", W, H, w, h, pad)).toEqual({ cx: 120, cy: 70 });
  });
  it("bottom-right anchors to bottom-right corner − padding", () => {
    expect(placement("br", W, H, w, h, pad)).toEqual({ cx: 880, cy: 730 });
  });
  it("center-center is the canvas centroid", () => {
    expect(placement("cc", W, H, w, h, pad)).toEqual({ cx: 500, cy: 400 });
  });
  it("top-center: horizontally centered, top-padded", () => {
    expect(placement("tc", W, H, w, h, pad)).toEqual({ cx: 500, cy: 70 });
  });
});

describe("images-to-pdf token substitution", () => {
  it("replaces {page} and {total}", () => {
    expect(substituteTokens("page {page} of {total}", 3, 7)).toBe("page 3 of 7");
  });
  it("is case-insensitive and replaces all occurrences", () => {
    expect(substituteTokens("{PAGE}/{Total} · {page}", 2, 5)).toBe("2/5 · 2");
  });
  it("hasPageToken detects either token", () => {
    expect(hasPageToken("header {page}")).toBe(true);
    expect(hasPageToken("just text")).toBe(false);
  });
});

describe("qr-generator payloads", () => {
  it("escapeWifi backslash-escapes reserved chars", () => {
    expect(escapeWifi('a;b:c,d"e\\f')).toBe('a\\;b\\:c\\,d\\"e\\\\f');
    expect(escapeWifi("plain")).toBe("plain");
  });
  it("buildWifiPayload formats WPA networks", () => {
    expect(buildWifiPayload({ ssid: "Home", password: "p@ss;1", auth: "WPA" }))
      .toBe("WIFI:T:WPA;S:Home;P:p@ss\\;1;H:false;;");
  });
  it("buildWifiPayload omits password for open networks", () => {
    expect(buildWifiPayload({ ssid: "Cafe", password: "ignored", auth: "nopass", hidden: true }))
      .toBe("WIFI:T:nopass;S:Cafe;P:;H:true;;");
  });
  it("buildVCard includes only provided fields", () => {
    const v = buildVCard({ name: "Ada Lovelace", email: "ada@x.io" });
    expect(v).toContain("FN:Ada Lovelace");
    expect(v).toContain("EMAIL:ada@x.io");
    expect(v).not.toContain("ORG:");
    expect(v.startsWith("BEGIN:VCARD")).toBe(true);
    expect(v.endsWith("END:VCARD")).toBe(true);
  });
});

describe("pdf-to-images helpers", () => {
  it("dpiToScale maps standard DPIs", () => {
    expect(dpiToScale(72)).toBe(1);
    expect(dpiToScale(144)).toBe(2);
    expect(dpiToScale(300)).toBeCloseTo(4.1666, 3);
  });
  it("dpiToScale clamps non-positive input", () => {
    expect(dpiToScale(0)).toBe(0.1);
    expect(dpiToScale(-50)).toBe(0.1);
  });
  it("pageFileName zero-pads page numbers based on total", () => {
    expect(pageFileName("Report.pdf", 3, 12, "png")).toBe("Report-p03.png");
    expect(pageFileName("Report.pdf", 3, 120, "jpg")).toBe("Report-p003.jpg");
  });
  it("pageFileName sanitises odd characters", () => {
    expect(pageFileName("my file (v2).PDF", 1, 5, "png")).toBe("my_file_v2_-p01.png");
  });
  it("pageFileName supports webp", () => {
    expect(pageFileName("doc.pdf", 2, 9, "webp")).toBe("doc-p02.webp");
  });
});

describe("parsePageRange", () => {
  it("parses commas, ranges and stray spaces", () => {
    expect(parsePageRange("1-3, 5, 8-10", 12)).toEqual([1, 2, 3, 5, 8, 9, 10]);
    expect(parsePageRange("  2 ,  4  ", 10)).toEqual([2, 4]);
  });
  it("clamps to bounds and de-duplicates", () => {
    expect(parsePageRange("1-100", 5)).toEqual([1, 2, 3, 4, 5]);
    expect(parsePageRange("3,3,3,1-2", 5)).toEqual([1, 2, 3]);
  });
  it("flips reversed ranges", () => {
    expect(parsePageRange("7-4", 10)).toEqual([4, 5, 6, 7]);
  });
  it("ignores garbage tokens", () => {
    expect(parsePageRange("abc, 2, x-y, 4", 10)).toEqual([2, 4]);
  });
});

describe("normalizeUrl", () => {
  it("prefixes bare domains with https", () => {
    expect(normalizeUrl("example.com")).toBe("https://example.com");
    expect(normalizeUrl("  bluebird.tools/path  ")).toBe("https://bluebird.tools/path");
  });
  it("keeps existing schemes intact", () => {
    expect(normalizeUrl("http://example.com")).toBe("http://example.com");
    expect(normalizeUrl("mailto:a@b.io")).toBe("mailto:a@b.io");
    expect(normalizeUrl("tel:+15550100")).toBe("tel:+15550100");
  });
  it("leaves plain text alone", () => {
    expect(normalizeUrl("hello world")).toBe("hello world");
    expect(normalizeUrl("")).toBe("");
  });
});

describe("password helpers", () => {
  it("buildPassphrase respects word count and separator", () => {
    const p = buildPassphrase({ words: 5, separator: "-", capitalize: false, addDigit: false });
    expect(p.split("-")).toHaveLength(5);
  });
  it("buildPassphrase capitalizes and appends a digit", () => {
    const p = buildPassphrase({ words: 4, separator: ".", capitalize: true, addDigit: true });
    const parts = p.split(".");
    expect(parts).toHaveLength(4);
    // Last token has the digit suffixed.
    expect(/\d$/.test(parts[3])).toBe(true);
    // Each word starts with an uppercase letter.
    for (const w of parts) expect(/^[A-Z]/.test(w)).toBe(true);
  });
  it("buildPassphrase clamps word count into a sane range", () => {
    const tiny = buildPassphrase({ words: 0, separator: "-", capitalize: false, addDigit: false });
    expect(tiny.split("-")).toHaveLength(2);
    const huge = buildPassphrase({ words: 99, separator: "-", capitalize: false, addDigit: false });
    expect(huge.split("-")).toHaveLength(12);
  });
  it("passphraseEntropyBits grows with word count and digit", () => {
    const a = passphraseEntropyBits(4, false);
    const b = passphraseEntropyBits(6, false);
    const c = passphraseEntropyBits(6, true);
    expect(b).toBeGreaterThan(a);
    expect(c).toBeGreaterThan(b);
  });
});

describe("jsonToYaml", () => {
  it("scalar values render correctly", () => {
    expect(jsonToYaml(null)).toBe("null");
    expect(jsonToYaml(42)).toBe("42");
    expect(jsonToYaml(true)).toBe("true");
    expect(jsonToYaml("hello")).toBe("hello");
  });
  it("quotes strings that look like other YAML scalars", () => {
    expect(jsonToYaml("true")).toBe('"true"');
    expect(jsonToYaml("123")).toBe('"123"');
    expect(jsonToYaml("has: colon")).toBe('"has: colon"');
  });
  it("renders flat objects with key: value lines", () => {
    const y = jsonToYaml({ name: "bird", count: 3, free: true });
    expect(y).toBe("name: bird\ncount: 3\nfree: true");
  });
  it("renders arrays with leading dashes", () => {
    expect(jsonToYaml(["a", "b", "c"])).toBe("- a\n- b\n- c");
    expect(jsonToYaml([])).toBe("[]");
  });
  it("nests objects with two-space indentation", () => {
    const y = jsonToYaml({ outer: { inner: 1 } });
    expect(y).toBe("outer:\n  inner: 1");
  });
  it("nests arrays of objects under a dash", () => {
    const y = jsonToYaml([{ a: 1 }, { a: 2 }]);
    expect(y).toContain("- a: 1");
    expect(y).toContain("- a: 2");
  });
});

