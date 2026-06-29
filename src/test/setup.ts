import "@testing-library/jest-dom/vitest";

// jsdom doesn't implement HTMLCanvasElement encoding. Provide tiny shims so
// our Canvas-based tools can run inside unit tests.
const proto = HTMLCanvasElement.prototype as unknown as {
  getContext: (id: string) => unknown;
  toBlob: (cb: (b: Blob | null) => void, type?: string) => void;
};

proto.getContext = function () {
  return {
    fillStyle: "",
    font: "",
    imageSmoothingQuality: "high",
    fillRect: () => {},
    drawImage: () => {},
    createLinearGradient: () => ({ addColorStop: () => {} }),
    fillText: () => {},
  } as unknown;
};

proto.toBlob = function (cb: (b: Blob | null) => void, type = "image/png") {
  cb(new Blob([new Uint8Array([0x89, 0x50, 0x4e, 0x47])], { type }));
};

// jsdom's Image never fires load/decode. Resolve decode() and onload immediately.
Object.defineProperty(HTMLImageElement.prototype, "decode", {
  value: function () { return Promise.resolve(); },
});
const origSrc = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, "src");
Object.defineProperty(HTMLImageElement.prototype, "src", {
  set(v: string) {
    origSrc?.set?.call(this, v);
    Object.defineProperty(this, "naturalWidth", { value: 64, configurable: true });
    Object.defineProperty(this, "naturalHeight", { value: 64, configurable: true });
    setTimeout(() => this.onload?.(new Event("load")), 0);
  },
  get() { return origSrc?.get?.call(this); },
});

if (typeof URL.createObjectURL === "undefined") {
  (URL as unknown as { createObjectURL: () => string }).createObjectURL = () => "blob:mock";
}
