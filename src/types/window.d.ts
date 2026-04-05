declare global {
  interface Window {
    desktop?: {
      getRuntimeInfo: () => Promise<{
        appName: string;
        platform: string;
        version: string;
        isPackaged: boolean;
      }>;
      openExternal: (url: string) => Promise<void>;
      pickAudioFile: () => Promise<{
        canceled: boolean;
        file?: {
          path: string;
          name: string;
          size: number;
          data: number[];
          mimeType: string;
        };
      }>;
      saveAudio: (payload: {
        defaultPath: string;
        data: number[];
      }) => Promise<{
        canceled: boolean;
        filePath?: string;
      }>;
    };
    updater?: {
      checkForUpdates: () => Promise<{
        available: boolean;
        updateInfo?: any;
        error?: string;
      }>;
      downloadUpdate: () => Promise<{
        success: boolean;
        error?: string;
      }>;
      installUpdate: () => void;
      onUpdateAvailable: (callback: (info: any) => void) => void;
      onDownloadProgress: (callback: (progress: any) => void) => void;
      onUpdateDownloaded: (callback: (info: any) => void) => void;
      onError: (callback: (error: any) => void) => void;
    };
  }
}

export {};
