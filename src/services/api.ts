import type { VoicesResponse, ApiError } from "../types/api";
import { storage, STORAGE_KEYS } from "./storage";

const API_BASE = "https://ntts.fdev.team/api/v1/tts";
const REQUEST_TIMEOUT = 30000; // 30 seconds
const CACHE_TTL = 3600000; // 1 hour
const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 4000]; // Exponential backoff

// Track in-flight requests to prevent duplicates
const inFlightRequests = new Map<string, Promise<any>>();

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function categorizeError(status?: number): ApiError["type"] {
  if (!status) return "network";
  if (status === 401 || status === 403) return "auth";
  if (status === 400 || status === 422) return "validation";
  if (status >= 500) return "server";
  return "unknown";
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number = REQUEST_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries: number = MAX_RETRIES
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, options);

      // Don't retry on client errors (4xx except 429)
      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        return response;
      }

      // Success or server error that we'll retry
      if (response.ok || attempt === retries - 1) {
        return response;
      }

      // Wait before retry
      if (attempt < retries - 1) {
        await sleep(RETRY_DELAYS[attempt]);
      }
    } catch (error) {
      lastError = error as Error;

      // Don't retry on abort
      if (error instanceof Error && error.name === "AbortError") {
        throw error;
      }

      // Wait before retry
      if (attempt < retries - 1) {
        await sleep(RETRY_DELAYS[attempt]);
      }
    }
  }

  throw lastError || new Error("Request failed after retries");
}

async function readJson<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as T & { message?: string };
  if (!response.ok) {
    const error: ApiError = {
      message: payload.message ?? "Ошибка API.",
      status: response.status,
      type: categorizeError(response.status),
    };
    throw error;
  }
  return payload;
}

function getHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
  };
}

// Deduplication wrapper
async function dedupedRequest<T>(key: string, fn: () => Promise<T>): Promise<T> {
  if (inFlightRequests.has(key)) {
    return inFlightRequests.get(key)!;
  }

  const promise = fn().finally(() => {
    inFlightRequests.delete(key);
  });

  inFlightRequests.set(key, promise);
  return promise;
}

export const api = {
  async fetchVoices(token: string, useCache: boolean = true): Promise<VoicesResponse> {
    // Check cache first
    if (useCache) {
      const cached = storage.getCache<VoicesResponse>(STORAGE_KEYS.VOICES_CACHE);
      if (cached) {
        return cached;
      }
    }

    return dedupedRequest("fetchVoices", async () => {
      const response = await fetchWithRetry(`${API_BASE}/speakers`, {
        headers: getHeaders(token),
      });

      const data = await readJson<VoicesResponse>(response);

      // Cache the result
      storage.setCache(STORAGE_KEYS.VOICES_CACHE, data, CACHE_TTL);

      return data;
    });
  },

  async fetchEffects(token: string, useCache: boolean = true): Promise<string[]> {
    // Check cache first
    if (useCache) {
      const cached = storage.getCache<string[]>(STORAGE_KEYS.EFFECTS_CACHE);
      if (cached) {
        return cached;
      }
    }

    return dedupedRequest("fetchEffects", async () => {
      const response = await fetchWithRetry(`${API_BASE}/effects`, {
        headers: getHeaders(token),
      });

      const data = await readJson<{ effects?: string[] }>(response);
      const effects = data.effects ?? [];

      // Cache the result
      storage.setCache(STORAGE_KEYS.EFFECTS_CACHE, effects, CACHE_TTL);

      return effects;
    });
  },

  async synthesizeSpeech(
    token: string,
    speaker: string,
    text: string,
    format: string,
    effect?: string
  ): Promise<Blob> {
    const params = new URLSearchParams({
      speaker,
      text: text.trim(),
      ext: format,
    });

    if (effect) {
      params.set("effect", effect);
    }

    const response = await fetchWithRetry(`${API_BASE}?${params.toString()}`, {
      headers: getHeaders(token),
    });

    if (!response.ok) {
      const error: ApiError = {
        message: "Ошибка синтеза.",
        status: response.status,
        type: categorizeError(response.status),
      };
      throw error;
    }

    return response.blob();
  },

  async addCustomVoice(token: string, speakerName: string, audioFile: File): Promise<{ message?: string }> {
    const formData = new FormData();
    formData.append("audio", audioFile);
    formData.append("speaker_name", speakerName.trim());

    const response = await fetchWithRetry(`${API_BASE}/speakers`, {
      method: "POST",
      headers: getHeaders(token),
      body: formData,
    });

    const data = await readJson<{ message?: string }>(response);

    // Invalidate voices cache
    storage.remove(STORAGE_KEYS.VOICES_CACHE);

    return data;
  },

  async deleteVoice(token: string, speakerName: string): Promise<{ message?: string }> {
    const response = await fetchWithRetry(`${API_BASE}/speakers/${speakerName}`, {
      method: "DELETE",
      headers: getHeaders(token),
    });

    const data = await readJson<{ message?: string }>(response);

    // Invalidate voices cache
    storage.remove(STORAGE_KEYS.VOICES_CACHE);

    return data;
  },

  // Manual cache invalidation
  clearCache(): void {
    storage.remove(STORAGE_KEYS.VOICES_CACHE);
    storage.remove(STORAGE_KEYS.EFFECTS_CACHE);
  },
};
