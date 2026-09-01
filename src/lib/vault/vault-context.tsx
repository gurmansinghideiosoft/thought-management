'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  useRekeyVaultMutation,
  useSetupVaultMutation,
  useVaultKeystoreQuery,
} from '@/lib/api/api';
import {
  checkVerifier,
  DEFAULT_KDF,
  deriveMasterKey,
  encryptPayload,
  decryptPayload,
  generateVaultKey,
  makeVerifier,
  randomBytes,
  toB64,
  unwrapVaultKey,
  wrapVaultKey,
} from '@/lib/vault/crypto';

const IDLE_LOCK_MS = 10 * 60 * 1000;

export type VaultStatus = 'loading' | 'no-vault' | 'locked' | 'unlocked';

interface VaultApi {
  status: VaultStatus;
  setup: (masterPassword: string) => Promise<void>;
  unlock: (masterPassword: string) => Promise<void>;
  lock: () => void;
  rekey: (currentPassword: string, newPassword: string) => Promise<void>;
  /** Encrypt an item payload with the (unlocked) vault key. */
  seal: (payload: unknown) => Promise<string>;
  /** Decrypt an item's cipher with the (unlocked) vault key. */
  open: <T>(cipher: string) => Promise<T>;
}

const VaultContext = createContext<VaultApi | null>(null);

export function useVault(): VaultApi {
  const ctx = useContext(VaultContext);
  if (!ctx) throw new Error('useVault must be used within <VaultProvider>');
  return ctx;
}

export function VaultProvider({ children }: { children: React.ReactNode }) {
  const { data, isLoading } = useVaultKeystoreQuery();
  const keystore = data?.keystore ?? null;
  const [setupVault] = useSetupVaultMutation();
  const [rekeyVault] = useRekeyVaultMutation();

  // The unwrapped data key — memory only, never persisted anywhere.
  const [vaultKey, setVaultKey] = useState<CryptoKey | null>(null);

  const status: VaultStatus = isLoading
    ? 'loading'
    : keystore === null
      ? 'no-vault'
      : vaultKey
        ? 'unlocked'
        : 'locked';

  const lock = useCallback(() => setVaultKey(null), []);

  // Drop the key after a stretch of inactivity.
  useEffect(() => {
    if (!vaultKey) return;
    let timer = window.setTimeout(lock, IDLE_LOCK_MS);
    const bump = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(lock, IDLE_LOCK_MS);
    };
    for (const ev of ['pointerdown', 'keydown'] as const) {
      window.addEventListener(ev, bump, { passive: true });
    }
    return () => {
      window.clearTimeout(timer);
      for (const ev of ['pointerdown', 'keydown'] as const) {
        window.removeEventListener(ev, bump);
      }
    };
  }, [vaultKey, lock]);

  const setup = useCallback(
    async (masterPassword: string) => {
      const saltB64 = toB64(randomBytes(16));
      const masterKey = await deriveMasterKey(masterPassword, saltB64, DEFAULT_KDF);
      const key = await generateVaultKey();
      const protectedKey = await wrapVaultKey(key, masterKey);
      const verifier = await makeVerifier(key);
      await setupVault({
        kdfSalt: saltB64,
        kdfParams: DEFAULT_KDF,
        protectedKey,
        verifier,
      }).unwrap();
      setVaultKey(key);
    },
    [setupVault],
  );

  const unlock = useCallback(
    async (masterPassword: string) => {
      if (!keystore) throw new Error('No vault to unlock');
      const masterKey = await deriveMasterKey(
        masterPassword,
        keystore.kdfSalt,
        keystore.kdfParams,
      );
      let key: CryptoKey;
      try {
        key = await unwrapVaultKey(keystore.protectedKey, masterKey);
      } catch {
        throw new Error('Wrong master password');
      }
      if (!(await checkVerifier(keystore.verifier, key))) {
        throw new Error('Wrong master password');
      }
      setVaultKey(key);
    },
    [keystore],
  );

  const rekey = useCallback(
    async (currentPassword: string, newPassword: string) => {
      if (!keystore) throw new Error('No vault');
      // Re-derive the data key from the current password (works whether or not
      // we're already unlocked), then re-wrap it under the new one.
      const currentMaster = await deriveMasterKey(
        currentPassword,
        keystore.kdfSalt,
        keystore.kdfParams,
      );
      let key: CryptoKey;
      try {
        key = await unwrapVaultKey(keystore.protectedKey, currentMaster);
      } catch {
        throw new Error('Current master password is wrong');
      }
      const saltB64 = toB64(randomBytes(16));
      const newMaster = await deriveMasterKey(newPassword, saltB64, DEFAULT_KDF);
      await rekeyVault({
        kdfSalt: saltB64,
        kdfParams: DEFAULT_KDF,
        protectedKey: await wrapVaultKey(key, newMaster),
        verifier: await makeVerifier(key),
      }).unwrap();
      setVaultKey(key);
    },
    [keystore, rekeyVault],
  );

  const seal = useCallback(
    (payload: unknown) => {
      if (!vaultKey) throw new Error('Vault is locked');
      return encryptPayload(vaultKey, payload);
    },
    [vaultKey],
  );

  const open = useCallback(
    <T,>(cipher: string) => {
      if (!vaultKey) throw new Error('Vault is locked');
      return decryptPayload<T>(vaultKey, cipher);
    },
    [vaultKey],
  );

  const value = useMemo<VaultApi>(
    () => ({ status, setup, unlock, lock, rekey, seal, open }),
    [status, setup, unlock, lock, rekey, seal, open],
  );

  return <VaultContext.Provider value={value}>{children}</VaultContext.Provider>;
}
