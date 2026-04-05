import type { CacheEntry } from "../types/api";

const STORAGE_KEYS = {
  TOKEN: "ntts-token",
  SPEAKER: "ntts-speaker",
  TEXT: "ntts-text",
  VOICES_CACHE: "ntts-voices-cache",
  EFFECTS_CACHE: "ntts-effects-cache",
} as const;

type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

// Debounced text save
let textSaveTimeout: NodeJS.Timeout | null = null;

export const storage = {
  get(key: StorageKey): string | null {
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      console.error("localStorage.getItem failed:", error);
      return null;
    }
  },

  set(key: StorageKey, value: string): void {
    try {
      window.localStorage.setItem(key, value);
    } catch (error) {
      console.error("localStorage.setItem failed:", error);
    }
  },

  remove(key: StorageKey): void {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error("localStorage.removeItem failed:", error);
    }
  },

  getCache<T>(key: StorageKey): T | null {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return null;

      const entry: CacheEntry<T> = JSON.parse(raw);
      const now = Date.now();

      if (now - entry.timestamp > entry.ttl) {
        window.localStorage.removeItem(key);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.error("localStorage.getCache failed:", error);
      return null;
    }
  },

  setCache<T>(key: StorageKey, data: T, ttl: number): void {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl,
      };
      window.localStorage.setItem(key, JSON.stringify(entry));
    } catch (error) {
      console.error("localStorage.setCache failed:", error);
    }
  },

  // Debounced text save (1 second delay)
  saveTextDebounced(text: string): void {
    if (textSaveTimeout) {
      clearTimeout(textSaveTimeout);
    }

    textSaveTimeout = setTimeout(() => {
      storage.set(STORAGE_KEYS.TEXT, text);
    }, 1000);
  },

  // Immediate save for critical data
  saveToken(token: string): void {
    if (token.trim()) {
      storage.set(STORAGE_KEYS.TOKEN, token);
    } else {
      storage.remove(STORAGE_KEYS.TOKEN);
    }
  },

  saveSpeaker(speaker: string): void {
    if (speaker) {
      storage.set(STORAGE_KEYS.SPEAKER, speaker);
    }
  },

  // Load initial data
  loadToken(): string {
    return storage.get(STORAGE_KEYS.TOKEN) || "";
  },

  loadSpeaker(): string {
    return storage.get(STORAGE_KEYS.SPEAKER) || "";
  },

  loadText(): string {
    return storage.get(STORAGE_KEYS.TEXT) || "";
  },
};

export { STORAGE_KEYS };
