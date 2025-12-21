// Simple encryption for localStorage data
// Note: This is client-side protection only - not truly secure

const STORAGE_KEY = 'tmovie_enc_';

// Simple XOR cipher with rotating key - updated for Unicode support
const xorEncrypt = (text: string, key: string): string => {
  const encoder = new TextEncoder();
  const textBytes = encoder.encode(text);
  const keyBytes = encoder.encode(key);

  let binary = '';
  for (let i = 0; i < textBytes.length; i++) {
    const charCode = textBytes[i] ^ keyBytes[i % keyBytes.length];
    binary += String.fromCharCode(charCode);
  }

  return btoa(binary);
};

const xorDecrypt = (encoded: string, key: string): string => {
  try {
    const binary = atob(encoded);
    const keyBytes = new TextEncoder().encode(key);
    const decryptedBytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
      decryptedBytes[i] = binary.charCodeAt(i) ^ keyBytes[i % keyBytes.length];
    }

    return new TextDecoder().decode(decryptedBytes);
  } catch (error) {
    console.error('Decryption error:', error);
    return '';
  }
};

// Generate a device-specific key
const getDeviceKey = (): string => {
  const stored = localStorage.getItem('_dk');
  if (stored) return stored;

  const key = Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  localStorage.setItem('_dk', key);
  return key;
};

export const secureStorage = {
  set: <T>(key: string, value: T): void => {
    try {
      const deviceKey = getDeviceKey();
      const json = JSON.stringify(value);
      const encrypted = xorEncrypt(json, deviceKey);
      localStorage.setItem(STORAGE_KEY + key, encrypted);
    } catch (error) {
      console.error('Storage set error:', error);
    }
  },

  get: <T>(key: string, defaultValue: T): T => {
    try {
      const encrypted = localStorage.getItem(STORAGE_KEY + key);
      if (!encrypted) return defaultValue;

      const deviceKey = getDeviceKey();
      const decrypted = xorDecrypt(encrypted, deviceKey);
      if (!decrypted) return defaultValue;

      return JSON.parse(decrypted) as T;
    } catch {
      return defaultValue;
    }
  },

  remove: (key: string): void => {
    localStorage.removeItem(STORAGE_KEY + key);
  },

  clear: (): void => {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(STORAGE_KEY))
      .forEach((k) => localStorage.removeItem(k));
  },
};

// Rate limiting (client-side - easily bypassed but adds friction)
interface RateLimitEntry {
  count: number;
  timestamp: number;
  blocked: boolean;
}

const rateLimits: Record<string, RateLimitEntry> = {};

export const rateLimit = {
  check: (action: string, maxAttempts = 10, windowMs = 60000): boolean => {
    const now = Date.now();
    const entry = rateLimits[action];

    if (!entry || now - entry.timestamp > windowMs) {
      rateLimits[action] = { count: 1, timestamp: now, blocked: false };
      return true;
    }

    if (entry.blocked && now - entry.timestamp < windowMs * 5) {
      return false;
    }

    entry.count++;

    if (entry.count > maxAttempts) {
      entry.blocked = true;
      return false;
    }

    return true;
  },

  reset: (action: string): void => {
    delete rateLimits[action];
  },
};

// Session token generation
export const generateSessionToken = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Array.from(crypto.getRandomValues(new Uint8Array(8)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `${timestamp}-${random}`;
};
