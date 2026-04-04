import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("desktop", {
  getRuntimeInfo: () => ipcRenderer.invoke("desktop:get-runtime-info"),
  openExternal: (url) => ipcRenderer.invoke("desktop:open-external", url),
  pickAudioFile: () => ipcRenderer.invoke("desktop:pick-audio-file"),
  saveAudio: (payload) => ipcRenderer.invoke("desktop:save-audio", payload),
});
