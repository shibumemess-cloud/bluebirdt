import { describe, it, expect } from "vitest";
import { validateImageFile, formatBytes } from "../components/ToolLayout";

describe("validateImageFile", () => {
  it("rejects null", () => {
    expect(validateImageFile(null)).toMatch(/choose|select/i);
  });
  it("rejects 0-byte file", () => {
    const f = new File([], "x.png", { type: "image/png" });
    expect(validateImageFile(f)).toMatch(/empty/i);
  });
  it("rejects files over 20 MB", () => {
    const f = new File([new Uint8Array(21 * 1024 * 1024)], "x.png", { type: "image/png" });
    expect(validateImageFile(f)).toMatch(/20 MB/);
  });
  it("rejects non-image MIME", () => {
    const f = new File([new Uint8Array([1, 2, 3])], "x.txt", { type: "text/plain" });
    expect(validateImageFile(f)).toMatch(/image/i);
  });
  it("accepts a valid PNG", () => {
    const f = new File([new Uint8Array([1, 2, 3])], "x.png", { type: "image/png" });
    expect(validateImageFile(f)).toBeNull();
  });
  it("jpegOnly rejects PNGs", () => {
    const f = new File([new Uint8Array([1, 2, 3])], "x.png", { type: "image/png" });
    expect(validateImageFile(f, { jpegOnly: true })).toMatch(/JPG/);
  });
  it("jpegOnly accepts JPEG", () => {
    const f = new File([new Uint8Array([1, 2, 3])], "x.jpg", { type: "image/jpeg" });
    expect(validateImageFile(f, { jpegOnly: true })).toBeNull();
  });
});

describe("formatBytes", () => {
  it("formats bytes", () => expect(formatBytes(500)).toBe("500 B"));
  it("formats KB", () => expect(formatBytes(2048)).toBe("2.0 KB"));
  it("formats MB", () => expect(formatBytes(1572864)).toBe("1.50 MB"));
});
