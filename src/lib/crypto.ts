// Simple encryption for localStorage data
// Note: This is client-side protection only - not truly secure

const STORAGE_KEY = 'tmovie_enc_';

// Simple XOR cipher with rotating key
const xorEncrypt = (text: string, key: string): string => {
  const textChars = text.split('').map((c) => c.charCodeAt(0));
  const keyChars = key.split('').map((c) => c.charCodeAt(0));
  
  const encrypted = textChars.map((char, i) => {
    const keyChar = keyChars[i % keyChars.length];
    return String.fromCharCode(char ^ keyChar);
  });
  
  return btoa(encrypted.join(''));
};

const xorDecrypt = (encoded: string, key: string): string => {
  try {
    const text = atob(encoded);
    const textChars = text.split('').map((c) => c.charCodeAt(0));
    const keyChars = key.split('').map((c) => c.charCodeAt(0));
    
    const decrypted = textChars.map((char, i) => {
      const keyChar = keyChars[i % keyChars.length];
      return String.fromCharCode(char ^ keyChar);
    });
    
    return decrypted.join('');
  } catch {
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
