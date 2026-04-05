export type Voice = {
  name: string;
  description: string;
  source: string;
  gender: string;
  speakers: string[];
};

export type VoicesResponse = {
  voices: Voice[];
  custom_voices: Voice[];
};

export type RuntimeInfo = {
  appName: string;
  platform: string;
  version: string;
  isPackaged: boolean;
};

export type Notice = {
  message: string;
  severity: "success" | "error" | "info";
};

export type ApiError = {
  message: string;
  status?: number;
  type: "auth" | "network" | "validation" | "server" | "unknown";
};

export type CacheEntry<T> = {
  data: T;
  timestamp: number;
  ttl: number;
};
