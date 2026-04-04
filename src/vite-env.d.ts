/// <reference types="vite/client" />

declare global {
  interface Window {
    desktop?: {
      getRuntimeInfo?: () => Promise<{
        appName: string;
        platform: string;
        version: string;
        isPackaged: boolean;
      }>;
      openExternal?: (url: string) => Promise<void>;
      pickAudioFile?: () => Promise<
        | {
            canceled: true;
          }
        | {
            canceled: false;
            file: {
              path: string;
              name: string;
              size: number;
              data: number[];
              mimeType: string;
            };
          }
      >;
      saveAudio?: (payload: {
        defaultPath: string;
        data: number[];
      }) => Promise<{
        canceled: boolean;
        filePath?: string;
      }>;
    };
  }
}

export {};
