import { app, BrowserWindow, dialog, ipcMain, nativeTheme, shell } from "electron";
import { autoUpdater } from "electron-updater";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mkdir, readFile, writeFile } from "node:fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = !app.isPackaged;
const rendererUrl = process.env.ELECTRON_RENDERER_URL ?? "http://localhost:5173";
const appIconPath = path.join(__dirname, "..", "src", "assets", "icon.png");

app.setName("NTTS GUI");

// Configure auto-updater
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

let mainWindow = null;

function createWindow() {
  const win = new BrowserWindow({
    width: 1560,
    height: 1024,
    minWidth: 1220,
    minHeight: 820,
    backgroundColor: "#0f141a",
    title: "NTTS API GUI",
    icon: appIconPath,
    autoHideMenuBar: true,
    show: false,
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
    titleBarOverlay:
      process.platform === "win32" || process.platform === "linux"
        ? {
            color: "#0f141a",
            symbolColor: "#f1efe7",
            height: 36,
          }
        : false,
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow = win;

  win.once("ready-to-show", () => {
    win.show();
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//.test(url)) {
      void shell.openExternal(url);
    }

    return { action: "deny" };
  });

  win.webContents.on("will-navigate", (event, url) => {
    if (url !== win.webContents.getURL()) {
      event.preventDefault();
      if (/^https?:\/\//.test(url)) {
        void shell.openExternal(url);
      }
    }
  });

  if (isDev) {
    void win.loadURL(rendererUrl);
    return win;
  }

  void win.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  return win;
}

const singleInstanceLock = app.requestSingleInstanceLock();

if (!singleInstanceLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    const [existingWindow] = BrowserWindow.getAllWindows();
    if (!existingWindow) {
      return;
    }

    if (existingWindow.isMinimized()) {
      existingWindow.restore();
    }

    existingWindow.focus();
  });

  app.whenReady().then(() => {
    nativeTheme.themeSource = "dark";
    createWindow();

    // Check for updates after window is created (only in production)
    if (!isDev) {
      setTimeout(() => {
        autoUpdater.checkForUpdates().catch((err) => {
          console.error("Failed to check for updates:", err);
        });
      }, 3000);
    }

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

ipcMain.handle("desktop:get-runtime-info", () => ({
  platform: process.platform,
  version: app.getVersion(),
  appName: app.getName(),
  isPackaged: app.isPackaged,
}));

ipcMain.handle("desktop:open-external", async (_event, url) => {
  if (typeof url !== "string" || !/^https?:\/\//.test(url)) {
    throw new Error("Invalid URL");
  }

  await shell.openExternal(url);
});

ipcMain.handle("desktop:pick-audio-file", async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: "Select voice sample",
    properties: ["openFile"],
    filters: [
      {
        name: "Audio",
        extensions: ["wav", "ogg", "mp3", "flac", "m4a", "aac"],
      },
      {
        name: "All files",
        extensions: ["*"],
      },
    ],
  });

  if (canceled || !filePaths[0]) {
    return { canceled: true };
  }

  const filePath = filePaths[0];
  const buffer = await readFile(filePath);

  return {
    canceled: false,
    file: {
      path: filePath,
      name: path.basename(filePath),
      size: buffer.byteLength,
      data: Array.from(buffer),
      mimeType: "application/octet-stream",
    },
  };
});

ipcMain.handle("desktop:save-audio", async (_event, payload) => {
  const { defaultPath, data } = payload ?? {};

  if (typeof defaultPath !== "string" || !data) {
    throw new Error("Invalid audio payload");
  }

  const { canceled, filePath } = await dialog.showSaveDialog({
    defaultPath,
    filters: [
      { name: "Audio", extensions: ["wav", "ogg", "mp3"] },
      { name: "All files", extensions: ["*"] },
    ],
  });

  if (canceled || !filePath) {
    return { canceled: true };
  }

  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, Buffer.from(data));

  return { canceled: false, filePath };
});

// Auto-updater IPC handlers
ipcMain.handle("updater:check-for-updates", async () => {
  if (isDev) {
    return { available: false, message: "Updates disabled in development mode" };
  }

  try {
    const result = await autoUpdater.checkForUpdates();
    return {
      available: result && result.updateInfo.version !== app.getVersion(),
      updateInfo: result?.updateInfo,
    };
  } catch (error) {
    console.error("Check for updates failed:", error);
    return { available: false, error: error.message };
  }
});

ipcMain.handle("updater:download-update", async () => {
  if (isDev) {
    return { success: false, message: "Updates disabled in development mode" };
  }

  try {
    await autoUpdater.downloadUpdate();
    return { success: true };
  } catch (error) {
    console.error("Download update failed:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("updater:install-update", () => {
  if (isDev) {
    return;
  }
  autoUpdater.quitAndInstall(false, true);
});

// Auto-updater events
autoUpdater.on("update-available", (info) => {
  console.log("Update available:", info.version);
  if (mainWindow) {
    mainWindow.webContents.send("updater:update-available", {
      version: info.version,
      releaseDate: info.releaseDate,
      releaseNotes: info.releaseNotes,
    });
  }
});

autoUpdater.on("update-not-available", () => {
  console.log("Update not available");
});

autoUpdater.on("download-progress", (progress) => {
  console.log(`Download progress: ${progress.percent}%`);
  if (mainWindow) {
    mainWindow.webContents.send("updater:download-progress", {
      percent: progress.percent,
      transferred: progress.transferred,
      total: progress.total,
    });
  }
});

autoUpdater.on("update-downloaded", (info) => {
  console.log("Update downloaded:", info.version);
  if (mainWindow) {
    mainWindow.webContents.send("updater:update-downloaded", {
      version: info.version,
    });
  }
});

autoUpdater.on("error", (error) => {
  console.error("Auto-updater error:", error);
  if (mainWindow) {
    mainWindow.webContents.send("updater:error", {
      message: error.message,
    });
  }
});
