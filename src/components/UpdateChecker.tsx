import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Typography,
  Box,
  Alert,
} from "@mui/material";
import { CloudDownloadRounded, SystemUpdateRounded } from "@mui/icons-material";

type UpdateInfo = {
  version: string;
  releaseDate?: string;
  releaseNotes?: string;
};

type DownloadProgress = {
  percent: number;
  transferred: number;
  total: number;
};

export default function UpdateChecker() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [updateReady, setUpdateReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!window.updater) return;

    // Listen for update available
    window.updater.onUpdateAvailable((info: UpdateInfo) => {
      setUpdateInfo(info);
      setUpdateAvailable(true);
    });

    // Listen for download progress
    window.updater.onDownloadProgress((progress: DownloadProgress) => {
      setDownloadProgress(Math.round(progress.percent));
    });

    // Listen for update downloaded
    window.updater.onUpdateDownloaded((info: UpdateInfo) => {
      setDownloading(false);
      setUpdateReady(true);
      setUpdateInfo(info);
    });

    // Listen for errors
    window.updater.onError((err: { message: string }) => {
      setError(err.message);
      setDownloading(false);
    });
  }, []);

  const handleDownload = async () => {
    setDownloading(true);
    setError(null);
    try {
      const result = await window.updater.downloadUpdate();
      if (!result.success) {
        setError(result.error || "Не удалось скачать обновление");
        setDownloading(false);
      }
    } catch (err) {
      setError(String(err));
      setDownloading(false);
    }
  };

  const handleInstall = () => {
    window.updater.installUpdate();
  };

  const handleClose = () => {
    setUpdateAvailable(false);
    setUpdateReady(false);
    setError(null);
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  if (!updateAvailable && !updateReady) return null;

  return (
    <Dialog open={updateAvailable || updateReady} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <SystemUpdateRounded />
        {updateReady ? "Обновление готово!" : "Доступно обновление!"}
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {updateInfo && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Новая версия <strong>{updateInfo.version}</strong> доступна для установки.
            </Typography>
            {updateInfo.releaseDate && (
              <Typography variant="body2" color="text.secondary">
                Дата релиза: {new Date(updateInfo.releaseDate).toLocaleDateString("ru-RU")}
              </Typography>
            )}
          </Box>
        )}

        {downloading && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Загрузка обновления... {downloadProgress}%
            </Typography>
            <LinearProgress variant="determinate" value={downloadProgress} />
          </Box>
        )}

        {updateReady && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Обновление загружено и готово к установке. Приложение будет перезапущено.
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        {!updateReady && !downloading && (
          <>
            <Button onClick={handleClose}>Позже</Button>
            <Button
              variant="contained"
              startIcon={<CloudDownloadRounded />}
              onClick={handleDownload}
              disabled={downloading}
            >
              Скачать
            </Button>
          </>
        )}
        {updateReady && (
          <>
            <Button onClick={handleClose}>Отмена</Button>
            <Button variant="contained" startIcon={<SystemUpdateRounded />} onClick={handleInstall}>
              Установить и перезапустить
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
