import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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
};

export default function UpdateChecker() {
  const { t, i18n } = useTranslation();
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
        setError(result.error || t("updater.downloadFailed"));
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


  if (!updateAvailable && !updateReady) return null;

  return (
    <Dialog open={updateAvailable || updateReady} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <SystemUpdateRounded />
        {updateReady ? t("updater.updateReady") : t("updater.updateAvailable")}
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
              {t("updater.newVersion")} <strong>{updateInfo.version}</strong> {t("updater.availableForInstall")}
            </Typography>
            {updateInfo.releaseDate && (
              <Typography variant="body2" color="text.secondary">
                {t("updater.releaseDate")} {new Date(updateInfo.releaseDate).toLocaleDateString(i18n.language === "ru" ? "ru-RU" : i18n.language === "uk" ? "uk-UA" : "en-US")}
              </Typography>
            )}
          </Box>
        )}

        {downloading && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              {t("updater.downloading")} {downloadProgress}%
            </Typography>
            <LinearProgress variant="determinate" value={downloadProgress} />
          </Box>
        )}

        {updateReady && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {t("updater.updateDownloaded")}

          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        {!updateReady && !downloading && (
          <>
            <Button onClick={handleClose}>{t("updater.laterButton")}</Button>
            <Button
              variant="contained"
              startIcon={<CloudDownloadRounded />}
              onClick={handleDownload}
              disabled={downloading}
            >
              {t("updater.downloadButton")}
            </Button>
          </>
        )}
        {updateReady && (
          <>
            <Button onClick={handleClose}>{t("updater.cancelButton")}</Button>
            <Button variant="contained" startIcon={<SystemUpdateRounded />} onClick={handleInstall}>
              {t("updater.installButton")}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
