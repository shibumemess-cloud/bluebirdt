import sha3 from "js-sha3";
const keccak256 = sha3.keccak256;

// ---------- Bitcoin ----------
const BTC_BASE58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const BECH32 = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";

function sha256Bytes(bytes: Uint8Array): Promise<Uint8Array> {
  const buf = bytes.slice().buffer; // ArrayBuffer copy
  return crypto.subtle.digest("SHA-256", buf).then((b) => new Uint8Array(b));
}

function base58Decode(s: string): Uint8Array | null {
  const bytes: number[] = [0];
  for (const ch of s) {
    const v = BTC_BASE58.indexOf(ch);
    if (v < 0) return null;
    let carry = v;
    for (let j = 0; j < bytes.length; j++) {
      carry += bytes[j] * 58;
      bytes[j] = carry & 0xff;
      carry >>= 8;
    }
    while (carry) { bytes.push(carry & 0xff); carry >>= 8; }
  }
  for (const ch of s) { if (ch === "1") bytes.push(0); else break; }
  return new Uint8Array(bytes.reverse());
}

function bech32Polymod(values: number[]): number {
  const GEN = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
  let chk = 1;
  for (const v of values) {
    const b = chk >> 25;
    chk = ((chk & 0x1ffffff) << 5) ^ v;
    for (let i = 0; i < 5; i++) if ((b >> i) & 1) chk ^= GEN[i];
  }
  return chk;
}
function bech32HrpExpand(hrp: string): number[] {
  const r: number[] = [];
  for (let i = 0; i < hrp.length; i++) r.push(hrp.charCodeAt(i) >> 5);
  r.push(0);
  for (let i = 0; i < hrp.length; i++) r.push(hrp.charCodeAt(i) & 31);
  return r;
}
function bech32Verify(s: string): "bech32" | "bech32m" | null {
  const pos = s.lastIndexOf("1");
  if (pos < 1 || pos + 7 > s.length) return null;
  const hrp = s.slice(0, pos).toLowerCase();
  const data: number[] = [];
  for (let i = pos + 1; i < s.length; i++) {
    const v = BECH32.indexOf(s[i].toLowerCase());
    if (v < 0) return null;
    data.push(v);
  }
  const poly = bech32Polymod(bech32HrpExpand(hrp).concat(data));
  if (poly === 1) return "bech32";
  if (poly === 0x2bc830a3) return "bech32m";
  return null;
}

export async function validateBitcoinAddress(addr: string): Promise<{ valid: boolean; type?: string; reason?: string }> {
  const a = addr.trim();
  if (!a) return { valid: false, reason: "Address is empty." };
  // Bech32 (SegWit v0 / Taproot)
  if (/^(bc1|tb1)/i.test(a)) {
    const kind = bech32Verify(a);
    if (!kind) return { valid: false, reason: "Bech32 checksum failed." };
    const lower = a.toLowerCase();
    if (lower.startsWith("bc1p")) return { valid: true, type: "Taproot (P2TR, mainnet)" };
    if (lower.startsWith("bc1q")) return { valid: true, type: "SegWit v0 (P2WPKH/P2WSH, mainnet)" };
    if (lower.startsWith("tb1p")) return { valid: true, type: "Taproot (testnet)" };
    if (lower.startsWith("tb1q")) return { valid: true, type: "SegWit v0 (testnet)" };
    return { valid: true, type: "Bech32" };
  }
  // Base58Check (legacy / P2SH)
  if (!/^[1-9A-HJ-NP-Za-km-z]{25,35}$/.test(a)) return { valid: false, reason: "Not a valid Base58 address." };
  const decoded = base58Decode(a);
  if (!decoded || decoded.length !== 25) return { valid: false, reason: "Decoded payload has wrong length." };
  const payload = decoded.slice(0, 21);
  const checksum = decoded.slice(21);
  const h1 = await sha256Bytes(payload);
  const h2 = await sha256Bytes(h1);
  for (let i = 0; i < 4; i++) if (h2[i] !== checksum[i]) return { valid: false, reason: "Checksum mismatch." };
  const v = decoded[0];
  if (v === 0x00) return { valid: true, type: "Legacy P2PKH (mainnet)" };
  if (v === 0x05) return { valid: true, type: "P2SH (mainnet)" };
  if (v === 0x6f) return { valid: true, type: "Legacy P2PKH (testnet)" };
  if (v === 0xc4) return { valid: true, type: "P2SH (testnet)" };
  return { valid: true, type: `Unknown version byte 0x${v.toString(16)}` };
}

// ---------- Ethereum EIP-55 ----------
export function toChecksumAddress(addr: string): string {
  const a = addr.toLowerCase().replace(/^0x/, "");
  const hash = keccak256(a);
  let out = "0x";
  for (let i = 0; i < a.length; i++) {
    out += parseInt(hash[i], 16) >= 8 ? a[i].toUpperCase() : a[i];
  }
  return out;
}
export function validateEthAddress(addr: string): { valid: boolean; checksum?: string; mixedCaseValid?: boolean; reason?: string } {
  const a = addr.trim();
  if (!/^0x[0-9a-fA-F]{40}$/.test(a)) return { valid: false, reason: "Must be 0x followed by 40 hex characters." };
  const checksum = toChecksumAddress(a);
  // If user gave all-lower or all-upper, it's syntactically valid but no checksum protection
  if (/^0x[0-9a-f]{40}$/.test(a) || /^0x[0-9A-F]{40}$/.test(a)) {
    return { valid: true, checksum, mixedCaseValid: true, reason: "Valid format but no checksum casing — accept with care." };
  }
  return { valid: a === checksum, checksum, mixedCaseValid: a === checksum, reason: a === checksum ? undefined : "Mixed‑case checksum does not match — likely a typo." };
}

// ---------- Gas units ----------
const WEI_PER_GWEI = 10n ** 9n;
const WEI_PER_ETH = 10n ** 18n;
export function gasConvert(value: string, fromUnit: "wei" | "gwei" | "ether"): { wei: string; gwei: string; ether: string } | null {
  try {
    const v = value.trim();
    if (!v) return null;
    let wei: bigint;
    if (fromUnit === "wei") {
      if (!/^\d+$/.test(v)) return null;
      wei = BigInt(v);
    } else {
      const mul = fromUnit === "gwei" ? WEI_PER_GWEI : WEI_PER_ETH;
      const [int, frac = ""] = v.split(".");
      if (!/^\d+$/.test(int) || (frac && !/^\d+$/.test(frac))) return null;
      const decimals = fromUnit === "gwei" ? 9 : 18;
      if (frac.length > decimals) return null;
      const padded = frac.padEnd(decimals, "0");
      wei = BigInt(int) * mul + BigInt(padded || "0");
    }
    return { wei: wei.toString(), gwei: formatUnits(wei, 9), ether: formatUnits(wei, 18) };
  } catch { return null; }
}
function formatUnits(value: bigint, decimals: number): string {
  const s = value.toString().padStart(decimals + 1, "0");
  const int = s.slice(0, -decimals) || "0";
  const frac = s.slice(-decimals).replace(/0+$/, "");
  return frac ? `${int}.${frac}` : int;
}

export function solidityFunctionSelector(signature: string): string {
  const clean = signature.replace(/\s+/g, "");
  const hash = keccak256(clean);
  return "0x" + hash.slice(0, 8);
}
