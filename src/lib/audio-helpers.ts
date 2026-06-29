// Shared Web Audio helpers — all client-side, no uploads.
import lamejs from "@breezystack/lamejs";

export async function decodeAudioFile(file: File | Blob): Promise<AudioBuffer> {
  const arr = await file.arrayBuffer();
  const Ctx: typeof AudioContext =
    (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
  const ctx = new Ctx();
  try {
    // decodeAudioData returns a copy; safe to close ctx after.
    return await ctx.decodeAudioData(arr.slice(0));
  } finally {
    if (ctx.state !== "closed") ctx.close().catch(() => {});
  }
}

export function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numCh = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const length = buffer.length * numCh * 2 + 44;
  const ab = new ArrayBuffer(length);
  const view = new DataView(ab);
  const writeStr = (off: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i));
  };
  let offset = 0;
  writeStr(offset, "RIFF"); offset += 4;
  view.setUint32(offset, length - 8, true); offset += 4;
  writeStr(offset, "WAVE"); offset += 4;
  writeStr(offset, "fmt "); offset += 4;
  view.setUint32(offset, 16, true); offset += 4;
  view.setUint16(offset, 1, true); offset += 2;
  view.setUint16(offset, numCh, true); offset += 2;
  view.setUint32(offset, sampleRate, true); offset += 4;
  view.setUint32(offset, sampleRate * numCh * 2, true); offset += 4;
  view.setUint16(offset, numCh * 2, true); offset += 2;
  view.setUint16(offset, 16, true); offset += 2;
  writeStr(offset, "data"); offset += 4;
  view.setUint32(offset, length - offset - 4, true); offset += 4;

  const channels: Float32Array[] = [];
  for (let c = 0; c < numCh; c++) channels.push(buffer.getChannelData(c));
  let i = 0;
  while (i < buffer.length) {
    for (let c = 0; c < numCh; c++) {
      let s = Math.max(-1, Math.min(1, channels[c][i]));
      s = s < 0 ? s * 0x8000 : s * 0x7fff;
      view.setInt16(offset, s, true);
      offset += 2;
    }
    i++;
  }
  return new Blob([ab], { type: "audio/wav" });
}

export function audioBufferToMp3(buffer: AudioBuffer, kbps = 192): Blob {
  const numCh = Math.min(2, buffer.numberOfChannels);
  const enc = new lamejs.Mp3Encoder(numCh, buffer.sampleRate, kbps);
  const left16 = floatToInt16(buffer.getChannelData(0));
  const right16 = numCh > 1 ? floatToInt16(buffer.getChannelData(1)) : null;
  const block = 1152;
  const chunks: Uint8Array[] = [];
  for (let i = 0; i < left16.length; i += block) {
    const l = left16.subarray(i, i + block);
    const r = right16 ? right16.subarray(i, i + block) : null;
    const mp3 = r ? enc.encodeBuffer(l, r) : enc.encodeBuffer(l);
    if (mp3.length) chunks.push(new Uint8Array(mp3));
  }
  const end = enc.flush();
  if (end.length) chunks.push(new Uint8Array(end));
  return new Blob(chunks as BlobPart[], { type: "audio/mpeg" });
}

function floatToInt16(input: Float32Array): Int16Array {
  const out = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return out;
}

export function sliceBuffer(buffer: AudioBuffer, startSec: number, endSec: number): AudioBuffer {
  const sr = buffer.sampleRate;
  const start = Math.max(0, Math.floor(startSec * sr));
  const end = Math.min(buffer.length, Math.floor(endSec * sr));
  const len = Math.max(1, end - start);
  const out = new AudioBuffer({
    length: len,
    numberOfChannels: buffer.numberOfChannels,
    sampleRate: sr,
  });
  for (let c = 0; c < buffer.numberOfChannels; c++) {
    out.copyToChannel(buffer.getChannelData(c).subarray(start, end), c);
  }
  return out;
}

export function concatBuffers(buffers: AudioBuffer[]): AudioBuffer {
  if (!buffers.length) throw new Error("No buffers");
  const sr = buffers[0].sampleRate;
  const numCh = Math.max(...buffers.map((b) => b.numberOfChannels));
  const total = buffers.reduce((s, b) => s + b.length, 0);
  const out = new AudioBuffer({ length: total, numberOfChannels: numCh, sampleRate: sr });
  let offset = 0;
  for (const b of buffers) {
    for (let c = 0; c < numCh; c++) {
      const src = b.getChannelData(Math.min(c, b.numberOfChannels - 1));
      out.copyToChannel(src, c, offset);
    }
    offset += b.length;
  }
  return out;
}

export function reverseBuffer(buffer: AudioBuffer): AudioBuffer {
  const out = new AudioBuffer({
    length: buffer.length,
    numberOfChannels: buffer.numberOfChannels,
    sampleRate: buffer.sampleRate,
  });
  for (let c = 0; c < buffer.numberOfChannels; c++) {
    const src = buffer.getChannelData(c);
    const dst = new Float32Array(src.length);
    for (let i = 0; i < src.length; i++) dst[i] = src[src.length - 1 - i];
    out.copyToChannel(dst, c);
  }
  return out;
}

export function normalizeBuffer(buffer: AudioBuffer, targetPeak = 0.98): AudioBuffer {
  let peak = 0;
  for (let c = 0; c < buffer.numberOfChannels; c++) {
    const d = buffer.getChannelData(c);
    for (let i = 0; i < d.length; i++) peak = Math.max(peak, Math.abs(d[i]));
  }
  if (peak === 0) return buffer;
  const gain = targetPeak / peak;
  const out = new AudioBuffer({
    length: buffer.length,
    numberOfChannels: buffer.numberOfChannels,
    sampleRate: buffer.sampleRate,
  });
  for (let c = 0; c < buffer.numberOfChannels; c++) {
    const src = buffer.getChannelData(c);
    const dst = new Float32Array(src.length);
    for (let i = 0; i < src.length; i++) dst[i] = src[i] * gain;
    out.copyToChannel(dst, c);
  }
  return out;
}

// Detect non-silent ranges. threshold = linear amplitude (0-1). minSilenceSec = gap to cut.
export function removeSilence(
  buffer: AudioBuffer,
  threshold = 0.01,
  minSilenceSec = 0.4,
): AudioBuffer {
  const sr = buffer.sampleRate;
  const minSilence = Math.floor(minSilenceSec * sr);
  const data = buffer.getChannelData(0);
  const keep: [number, number][] = [];
  let inSound = false;
  let segStart = 0;
  let silenceRun = 0;
  for (let i = 0; i < data.length; i++) {
    const amp = Math.abs(data[i]);
    if (amp >= threshold) {
      if (!inSound) {
        segStart = i;
        inSound = true;
      }
      silenceRun = 0;
    } else if (inSound) {
      silenceRun++;
      if (silenceRun >= minSilence) {
        keep.push([segStart, i - silenceRun]);
        inSound = false;
        silenceRun = 0;
      }
    }
  }
  if (inSound) keep.push([segStart, data.length]);
  if (!keep.length) return buffer;
  const total = keep.reduce((s, [a, b]) => s + (b - a), 0);
  const out = new AudioBuffer({
    length: total,
    numberOfChannels: buffer.numberOfChannels,
    sampleRate: sr,
  });
  for (let c = 0; c < buffer.numberOfChannels; c++) {
    const src = buffer.getChannelData(c);
    let off = 0;
    for (const [a, b] of keep) {
      out.copyToChannel(src.subarray(a, b), c, off);
      off += b - a;
    }
  }
  return out;
}

export function crossfadeBuffers(a: AudioBuffer, b: AudioBuffer, fadeSec: number): AudioBuffer {
  const sr = a.sampleRate;
  const fade = Math.min(Math.floor(fadeSec * sr), a.length, b.length);
  const totalLen = a.length + b.length - fade;
  const numCh = Math.max(a.numberOfChannels, b.numberOfChannels);
  const out = new AudioBuffer({ length: totalLen, numberOfChannels: numCh, sampleRate: sr });
  for (let c = 0; c < numCh; c++) {
    const da = a.getChannelData(Math.min(c, a.numberOfChannels - 1));
    const db = b.getChannelData(Math.min(c, b.numberOfChannels - 1));
    const dst = new Float32Array(totalLen);
    for (let i = 0; i < a.length; i++) dst[i] = da[i];
    for (let i = 0; i < fade; i++) {
      const t = i / fade;
      const idx = a.length - fade + i;
      dst[idx] = da[idx] * (1 - t) + db[i] * t;
    }
    for (let i = fade; i < b.length; i++) dst[a.length - fade + i] = db[i];
    out.copyToChannel(dst, c);
  }
  return out;
}

// Pitch-preserving speed change (factor: 0.5 = half speed, 2 = double).
// Simple resample via OfflineAudioContext at adjusted rate, then keep original SR.
// Note: this is a basic rate-change (also shifts pitch). For true pitch-preserving
// time-stretch we'd need a phase vocoder; soundtouchjs handles that separately.
export async function changeRate(buffer: AudioBuffer, factor: number): Promise<AudioBuffer> {
  const sr = buffer.sampleRate;
  const len = Math.max(1, Math.floor(buffer.length / factor));
  const off = new OfflineAudioContext(buffer.numberOfChannels, len, sr);
  const src = off.createBufferSource();
  src.buffer = buffer;
  src.playbackRate.value = factor;
  src.connect(off.destination);
  src.start();
  return await off.startRendering();
}

export function formatTime(sec: number): string {
  if (!isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  const ms = Math.floor((sec - Math.floor(sec)) * 100);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
