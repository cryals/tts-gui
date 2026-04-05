import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("desktop", {
  getRuntimeInfo: () => ipcRenderer.invoke("desktop:get-runtime-info"),
  openExternal: (url) => ipcRenderer.invoke("desktop:open-external", url),
  pickAudioFile: () => ipcRenderer.invoke("desktop:pick-audio-file"),
  saveAudio: (payload) => ipcRenderer.invoke("desktop:save-audio", payload),
});

contextBridge.exposeInMainWorld("updater", {
  checkForUpdates: () => ipcRenderer.invoke("updater:check-for-updates"),
  downloadUpdate: () => ipcRenderer.invoke("updater:download-update"),
  installUpdate: () => ipcRenderer.invoke("updater:install-update"),
  onUpdateAvailable: (callback) => {
    ipcRenderer.on("updater:update-available", (_event, info) => callback(info));
  },
  onDownloadProgress: (callback) => {
    ipcRenderer.on("updater:download-progress", (_event, progress) => callback(progress));
  },
  onUpdateDownloaded: (callback) => {
    ipcRenderer.on("updater:update-downloaded", (_event, info) => callback(info));
  },
  onError: (callback) => {
    ipcRenderer.on("updater:error", (_event, error) => callback(error));
  },
});
