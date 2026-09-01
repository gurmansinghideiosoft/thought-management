/**
 * All vault cryptography runs here, in the browser. The server never sees a key
 * or any plaintext.
 *
 * - masterKey = Argon2id(masterPassword, kdfSalt, kdfParams)  — wraps the data key
 * - vaultKey  = random AES-256-GCM key, generated once at setup — encrypts items
 * - protectedKey = wrap(vaultKey, masterKey)                   — stored server-side
 * - verifier  = AES-GCM(vaultKey, "thought-vault")             — unlock sanity check
 * - each credential's `cipher` = AES-GCM(vaultKey, JSON(payload))
 */
import { argon2id } from 'hash-wasm';

import type { KdfParams } from '@/lib/types';

/** Sensible default — ~64 MiB, 3 passes. Stored so it can be raised later. */
export const DEFAULT_KDF: KdfParams = { m: 65_536, t: 3, p: 1 };

const IV_BYTES = 12;
const enc = new TextEncoder();
const dec = new TextDecoder();

/**
 * Copy into a fresh `ArrayBuffer`-backed view. `.slice()` / library outputs can
 * be typed `Uint8Array<ArrayBufferLike>`, which the current DOM lib rejects for
 * `BufferSource`; a copy is small here and sidesteps it.
 */
const ab = (u: Uint8Array): Uint8Array<ArrayBuffer> => {
  const out = new Uint8Array(u.byteLength);
  out.set(u);
  return out;
};

// --- base64 ----------------------------------------------------------

export function toB64(input: ArrayBuffer | Uint8Array): string {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s);
}

export function fromB64(b64: string): Uint8Array<ArrayBuffer> {
  const s = atob(b64);
  const bytes = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i += 1) bytes[i] = s.charCodeAt(i);
  return bytes;
}

export function randomBytes(n: number): Uint8Array<ArrayBuffer> {
  return crypto.getRandomValues(new Uint8Array(n));
}

// --- key derivation & wrapping ------------------------------------

/** Argon2id(masterPassword) → a non-extractable AES-GCM key for wrapping. */
export async function deriveMasterKey(
  password: string,
  saltB64: string,
  params: KdfParams,
): Promise<CryptoKey> {
  const hash = await argon2id({
    password,
    salt: fromB64(saltB64),
    parallelism: params.p,
    iterations: params.t,
    memorySize: params.m,
    hashLength: 32,
    outputType: 'binary',
  });
  return crypto.subtle.importKey('raw', ab(hash), { name: 'AES-GCM' }, false, [
    'wrapKey',
    'unwrapKey',
  ]);
}

export function generateVaultKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, [
    'encrypt',
    'decrypt',
  ]);
}

export async function wrapVaultKey(
  vaultKey: CryptoKey,
  masterKey: CryptoKey,
): Promise<string> {
  const iv = randomBytes(IV_BYTES);
  const wrapped = await crypto.subtle.wrapKey('raw', vaultKey, masterKey, {
    name: 'AES-GCM',
    iv,
  });
  return toB64(new Uint8Array([...iv, ...new Uint8Array(wrapped)]));
}

/** Throws (GCM tag failure) if `masterKey` is wrong. */
export async function unwrapVaultKey(
  protectedKeyB64: string,
  masterKey: CryptoKey,
): Promise<CryptoKey> {
  const raw = fromB64(protectedKeyB64);
  return crypto.subtle.unwrapKey(
    'raw',
    ab(raw.slice(IV_BYTES)),
    masterKey,
    { name: 'AES-GCM', iv: ab(raw.slice(0, IV_BYTES)) },
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

// --- symmetric encrypt/decrypt with the vault key ---------------

async function encryptBytes(key: CryptoKey, data: Uint8Array): Promise<string> {
  const iv = randomBytes(IV_BYTES);
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, ab(data));
  return toB64(new Uint8Array([...iv, ...new Uint8Array(ct)]));
}

async function decryptBytes(key: CryptoKey, b64: string): Promise<Uint8Array> {
  const raw = fromB64(b64);
  const plain = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: ab(raw.slice(0, IV_BYTES)) },
    key,
    ab(raw.slice(IV_BYTES)),
  );
  return new Uint8Array(plain);
}

const VERIFIER_PLAINTEXT = 'thought-vault';

export function makeVerifier(vaultKey: CryptoKey): Promise<string> {
  return encryptBytes(vaultKey, enc.encode(VERIFIER_PLAINTEXT));
}

export async function checkVerifier(
  verifierB64: string,
  vaultKey: CryptoKey,
): Promise<boolean> {
  try {
    return dec.decode(await decryptBytes(vaultKey, verifierB64)) === VERIFIER_PLAINTEXT;
  } catch {
    return false;
  }
}

export function encryptPayload(vaultKey: CryptoKey, payload: unknown): Promise<string> {
  return encryptBytes(vaultKey, enc.encode(JSON.stringify(payload)));
}

export async function decryptPayload<T>(
  vaultKey: CryptoKey,
  cipherB64: string,
): Promise<T> {
  return JSON.parse(dec.decode(await decryptBytes(vaultKey, cipherB64))) as T;
}

// --- password generator ------------------------------------------

const POOLS = {
  lower: 'abcdefghijklmnopqrstuvwxyz',
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  number: '23456789',
  symbol: '!@#$%^&*-_=+?',
};

export function randomPassword(opts: {
  length: number;
  numbers: boolean;
  symbols: boolean;
}): string {
  let pool = POOLS.lower + POOLS.upper;
  if (opts.numbers) pool += POOLS.number;
  if (opts.symbols) pool += POOLS.symbol;

  const out: string[] = [];
  const max = 256 - (256 % pool.length); // reject bytes that would bias modulo
  while (out.length < opts.length) {
    for (const byte of randomBytes(opts.length * 2)) {
      if (byte >= max) continue;
      out.push(pool[byte % pool.length]!);
      if (out.length === opts.length) break;
    }
  }
  return out.join('');
}
