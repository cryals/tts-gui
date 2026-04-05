import { Component, useEffect, useMemo, useRef, useState, type DragEvent, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import {
  Alert,
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  CssBaseline,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  LinearProgress,
  List,
  ListItemButton,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  ThemeProvider,
  Toolbar,
  Typography,
  createTheme,
} from "@mui/material";
import {
  DeleteOutlineRounded,
  FolderOpenRounded,
  GraphicEqRounded,
  LibraryMusicRounded,
  OpenInNewRounded,
  PlayArrowRounded,
  RefreshRounded,
  UploadFileRounded,
  VisibilityOffRounded,
  VisibilityRounded,
  WavesRounded,
} from "@mui/icons-material";
import tallLogoImage from "../assets/tall-logo.png";
import AudioPlayer from "../components/AudioPlayer";
import UpdateChecker from "../components/UpdateChecker";
import LanguageSelector from "../components/LanguageSelector";
import { api } from "../services/api";
import { storage } from "../services/storage";
import type { Voice, VoicesResponse, RuntimeInfo, Notice, ApiError } from "../types/api";

type TabValue = "voices" | "custom" | "synthesis";

const EMPTY_VOICES: VoicesResponse = { voices: [], custom_voices: [] };

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#7fb3ff",
      contrastText: "#0f141a",
    },
    secondary: {
      main: "#98c379",
    },
    background: {
      default: "#1b1f24",
      paper: "#22272e",
    },
    text: {
      primary: "#e6edf3",
      secondary: "#9da7b3",
    },
    divider: "#343b43",
    error: {
      main: "#f47067",
    },
    success: {
      main: "#7ee787",
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: '"Noto Sans", "Segoe UI", "Roboto", sans-serif',
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#1b1f24",
        },
        "#root": {
          minHeight: "100vh",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#22272e",
          backgroundImage: "none",
          borderBottom: "1px solid #343b43",
          boxShadow: "none",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "#22272e",
          backgroundImage: "none",
          border: "1px solid #343b43",
          boxShadow: "none",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          boxShadow: "none",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: 42,
          borderRadius: 10,
          boxShadow: "none",
          paddingInline: 14,
        },
        contained: {
          boxShadow: "none",
        },
      },
    },
    MuiFilledInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: "#2a3038",
          border: "1px solid #3a424c",
          "&:hover": {
            backgroundColor: "#2a3038",
          },
          "&.Mui-focused": {
            backgroundColor: "#2a3038",
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "filled",
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          minHeight: 44,
          textTransform: "none",
          fontWeight: 600,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 2,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          paddingBlock: 10,
          paddingInline: 12,
        },
      },
    },
  },
});

function bytesToFile(payload: { name: string; data: number[]; mimeType: string }) {
  return new File([new Uint8Array(payload.data)], payload.name, {
    type: payload.mimeType,
  });
}

function normalizeVoice(input: unknown, index: number, options?: { preferNameAsSpeaker?: boolean }): Voice {
  if (typeof input === "string") {
    const value = input.trim();
    return {
      name: value,
      description: "",
      source: "",
      gender: "",
      speakers: [value || `voice_${index + 1}`],
    };
  }

  const voice =
    typeof input === "object" && input !== null
      ? (input as Partial<Voice> & {
          speaker?: string;
          id?: string;
          speaker_name?: string;
          slug?: string;
          key?: string;
        })
      : {};
  const speakersFromArray = Array.isArray(voice.speakers)
    ? voice.speakers.filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    : [];
  const trimmedName = typeof voice.name === "string" ? voice.name.trim() : "";
  const directSpeakerCandidates = [voice.speaker_name, voice.speaker, voice.id, voice.slug, voice.key]
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter(Boolean);
  const fallbackSpeaker =
    directSpeakerCandidates[0] ||
    (options?.preferNameAsSpeaker && trimmedName ? trimmedName : "") ||
    `voice_${index + 1}`;

  return {
    name: trimmedName || directSpeakerCandidates[0] || "",
    description: typeof voice.description === "string" ? voice.description : "",
    source: typeof voice.source === "string" ? voice.source : "",
    gender: typeof voice.gender === "string" ? voice.gender : "",
    speakers: speakersFromArray.length ? speakersFromArray : [fallbackSpeaker],
  };
}

function normalizeVoicesResponse(input: unknown): VoicesResponse {
  const payload =
    typeof input === "object" && input !== null
      ? (input as Partial<VoicesResponse> & { customVoices?: unknown[] })
      : {};
  const voices = Array.isArray(payload.voices)
    ? payload.voices.map((voice, index) => normalizeVoice(voice, index))
    : [];
  const rawCustomVoices = Array.isArray(payload.custom_voices)
    ? payload.custom_voices
    : Array.isArray(payload.customVoices)
      ? payload.customVoices
      : [];
  const customVoices = rawCustomVoices.map((voice, index) =>
    normalizeVoice(voice, index, { preferNameAsSpeaker: true }),
  );

  return {
    voices,
    custom_voices: customVoices,
  };
}

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; message: string }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: unknown) {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : String(error),
    };
  }

  componentDidCatch(error: unknown, errorInfo: unknown) {
    console.error("Renderer crashed", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ minHeight: "100vh", bgcolor: "background.default", p: 3 }}>
          <Paper sx={{ maxWidth: 900, mx: "auto", p: 3, border: "1px solid #343b43", borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              {i18n.t("errorBoundary.title")}
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              {i18n.t("errorBoundary.description")}
            </Typography>
            <Paper sx={{ p: 2, bgcolor: "#1f242b", border: "1px solid #343b43", borderRadius: 2 }}>
              <Typography component="pre" sx={{ m: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                {this.state.message}
              </Typography>
            </Paper>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  const { t } = useTranslation();
  const [token, setToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [activeTab, setActiveTab] = useState<TabValue>("voices");
  const [voices, setVoices] = useState<VoicesResponse>(EMPTY_VOICES);
  const [effects, setEffects] = useState<string[]>([]);
  const [selectedSpeaker, setSelectedSpeaker] = useState("");
  const [selectedEffect, setSelectedEffect] = useState("");
  const [format, setFormat] = useState("wav");
  const [text, setText] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [runtimeInfo, setRuntimeInfo] = useState<RuntimeInfo | null>(null);
  const [newVoiceName, setNewVoiceName] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const allVoices = useMemo(
    () => [...voices.voices, ...voices.custom_voices],
    [voices.custom_voices, voices.voices],
  );

  useEffect(() => {
    setToken(storage.loadToken());
    setSelectedSpeaker(storage.loadSpeaker());
    setText(storage.loadText());

    window.desktop?.getRuntimeInfo?.().then(setRuntimeInfo).catch(() => undefined);
  }, []);

  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      console.error("window.error", event.error ?? event.message);
    };
    const onRejection = (event: PromiseRejectionEvent) => {
      console.error("unhandledrejection", event.reason);
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  useEffect(() => {
    storage.saveToken(token);
  }, [token]);

  useEffect(() => {
    storage.saveSpeaker(selectedSpeaker);
  }, [selectedSpeaker]);

  useEffect(() => {
    storage.saveTextDebounced(text);
  }, [text]);

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const notify = (message: string, severity: Notice["severity"] = "info") => {
    setNotice({ message, severity });
  };

  const handleApiError = (error: unknown) => {
    if (typeof error === "object" && error !== null && "type" in error) {
      const apiError = error as ApiError;
      switch (apiError.type) {
        case "auth":
          notify(t("notifications.authError"), "error");
          break;
        case "network":
          notify(t("notifications.networkError"), "error");
          break;
        case "validation":
          notify(apiError.message, "error");
          break;
        case "server":
          notify(t("notifications.serverError"), "error");
          break;
        default:
          notify(apiError.message, "error");
      }
    } else {
      notify(String(error), "error");
    }
  };

  const ensureToken = () => {
    if (token.trim()) return true;
    notify(t("notifications.enterToken"), "error");
    return false;
  };

  const fetchVoices = async (useCache: boolean = true) => {
    if (!ensureToken()) return;

    setIsLoading(true);
    try {
      const data = await api.fetchVoices(token, useCache);
      const normalized = normalizeVoicesResponse(data);
      console.log("voices.loaded", normalized);
      setVoices(normalized);
      notify(t("notifications.voicesLoaded"), "success");
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEffects = async (useCache: boolean = true) => {
    if (!ensureToken()) return;

    setIsLoading(true);
    try {
      const effects = await api.fetchEffects(token, useCache);
      setEffects(effects);
      notify(t("notifications.effectsLoaded"), "success");
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAll = async () => {
    if (!ensureToken()) return;
    api.clearCache();
    await Promise.all([fetchVoices(false), fetchEffects(false)]);
  };

  const synthesizeSpeech = async () => {
    if (!ensureToken()) return;
    if (!selectedSpeaker || !text.trim()) {
      notify(t("notifications.selectVoiceAndText"), "error");
      return;
    }

    setIsLoading(true);
    try {
      if (audioUrl) URL.revokeObjectURL(audioUrl);

      const blob = await api.synthesizeSpeech(token, selectedSpeaker, text, format, selectedEffect);
      setAudioUrl(URL.createObjectURL(blob));
      notify(t("notifications.audioGenerated"), "success");
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const addCustomVoice = async () => {
    if (!ensureToken()) return;
    if (!newVoiceName.trim() || !audioFile) {
      notify(t("notifications.voiceNameAndFileRequired"), "error");
      return;
    }

    setIsLoading(true);
    try {
      const data = await api.addCustomVoice(token, newVoiceName, audioFile);
      setNewVoiceName("");
      setAudioFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await fetchVoices(false);
      notify(data.message ?? t("notifications.voiceAdded"), "success");
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteVoice = async (speakerName: string) => {
    if (!ensureToken()) return;
    if (!window.confirm(t("notifications.confirmDelete", { name: speakerName }))) return;

    setIsLoading(true);
    try {
      const data = await api.deleteVoice(token, speakerName);
      await fetchVoices(false);
      notify(data.message ?? t("notifications.voiceDeleted"), "success");
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const chooseAudioFile = async () => {
    if (!window.desktop?.pickAudioFile) {
      fileInputRef.current?.click();
      return;
    }

    try {
      const result = await window.desktop.pickAudioFile();
      if (result.canceled) return;
      const file = bytesToFile(result.file);
      setAudioFile(file);
      if (!newVoiceName.trim()) {
        setNewVoiceName(file.name.replace(/\.[^/.]+$/, "").replace(/\s+/g, "_"));
      }
    } catch (error) {
      handleApiError(error);
    }
  };

  const onDropAudio = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0] ?? null;
    if (!file) return;
    setAudioFile(file);
    if (!newVoiceName.trim()) {
      setNewVoiceName(file.name.replace(/\.[^/.]+$/, "").replace(/\s+/g, "_"));
    }
  };

  const downloadAudio = async () => {
    if (!audioUrl) return;

    const fileName = `ntts_${selectedSpeaker || "audio"}_${Date.now()}.${format}`;
    try {
      const response = await fetch(audioUrl);
      const arrayBuffer = await response.arrayBuffer();

      if (window.desktop?.saveAudio) {
        const result = await window.desktop.saveAudio({
          defaultPath: fileName,
          data: Array.from(new Uint8Array(arrayBuffer)),
        });
        if (!result.canceled) {
          notify(t("notifications.fileSaved", { path: result.filePath }), "success");
        }
        return;
      }

      const link = document.createElement("a");
      link.href = audioUrl;
      link.download = fileName;
      link.click();
    } catch (error) {
      handleApiError(error);
    }
  };

  const openExternal = (url: string) => {
    if (window.desktop?.openExternal) {
      window.desktop.openExternal(url).catch(() => window.open(url, "_blank", "noopener,noreferrer"));
      return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  };

  const sectionCardSx = {
    p: { xs: 2, sm: 2.25, md: 2.5 },
  };

  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <UpdateChecker />
        <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
          <AppBar position="sticky">
            <Toolbar sx={{ gap: 2, py: 1.25, flexWrap: "wrap" }}>
              <Box sx={{ display: "flex", alignItems: "center", minWidth: 0 }}>
                <Box
                  component="img"
                  src={tallLogoImage}
                  alt="NTTS"
                  sx={{ height: { xs: 20, md: 24 }, width: "auto", objectFit: "contain", display: "block" }}
                />
              </Box>
              <TextField
                hiddenLabel
                size="small"
                placeholder={t("header.tokenPlaceholder")}
                value={token}
                onChange={(event) => setToken(event.target.value)}
                type={showToken ? "text" : "password"}
                sx={{ flex: 1, minWidth: { xs: 200, sm: 260 }, maxWidth: { sm: 760 } }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowToken((value) => !value)} edge="end">
                        {showToken ? <VisibilityOffRounded /> : <VisibilityRounded />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button variant="contained" startIcon={<RefreshRounded />} onClick={refreshAll} disabled={isLoading}>
                {t("header.refreshButton")}
              </Button>
            </Toolbar>
          </AppBar>

          <Container maxWidth="lg" sx={{ flex: 1, display: "flex", flexDirection: "column", py: { xs: 2, sm: 2.5, md: 3 } }}>
            <Box sx={{ display: "grid", gap: 2, flex: 1 }}>
            <Card>
              <CardContent sx={{ p: 0 }}>
                <Tabs value={activeTab} onChange={(_, value: TabValue) => setActiveTab(value)} variant="scrollable">
                  <Tab value="voices" label={t("tabs.voices")} />
                  <Tab value="custom" label={t("tabs.custom")} />
                  <Tab value="synthesis" label={t("tabs.synthesis")} />
                </Tabs>
              </CardContent>
            </Card>

            <Card>
              <CardContent sx={{ ...sectionCardSx, pb: { xs: 2, md: 2.5 } }}>
                <Stack spacing={0.75}>
                  <Typography variant="h6">
                    {activeTab === "voices"
                      ? t("voicesTab.title")
                      : activeTab === "custom"
                        ? t("customTab.title")
                        : t("synthesisTab.title")}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {activeTab === "voices"
                      ? t("tabDescriptions.voices")
                      : activeTab === "custom"
                        ? t("tabDescriptions.custom")
                        : t("tabDescriptions.synthesis")}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>

            {activeTab === "voices" && (
              <Card>
                <CardContent sx={sectionCardSx}>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    spacing={1.5}
                    sx={{ mb: 2 }}
                  >
                    <Stack spacing={0.5}>
                      <Typography variant="h6">{t("voicesTab.allVoices")}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t("voicesTab.description")}
                      </Typography>
                    </Stack>
                    <Button variant="outlined" startIcon={<RefreshRounded />} onClick={fetchVoices} disabled={isLoading}>
                      {t("voicesTab.loadButton")}
                    </Button>
                  </Stack>

                  <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
                    <Paper sx={{ border: "1px solid #343b43", borderRadius: 2, overflow: "hidden" }}>
                      <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid #343b43" }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <LibraryMusicRounded fontSize="small" />
                          <Typography variant="subtitle1">{t("voicesTab.systemVoices")}</Typography>
                          <Chip size="small" label={voices.voices.length} />
                        </Stack>
                      </Box>
                      <List dense sx={{ p: 1 }}>
                        {voices.voices.map((voice) => (
                          <ListItemButton
                            key={voice.speakers[0]}
                            onClick={() => {
                              setSelectedSpeaker(voice.speakers[0]);
                              setActiveTab("synthesis");
                            }}
                          >
                            <ListItemText
                              primary={voice.name || voice.speakers[0]}
                              secondary={[
                                voice.speakers[0],
                                voice.source ? `${t("voicesTab.sourceLabel")}: ${voice.source}` : "",
                                voice.description || "",
                              ]
                                .filter(Boolean)
                                .join(" • ")}
                            />
                          </ListItemButton>
                        ))}
                        {!voices.voices.length && (
                          <Box sx={{ px: 2, py: 1.5 }}>
                            <Typography color="text.secondary">{t("voicesTab.noVoicesYet")}</Typography>
                          </Box>
                        )}
                      </List>
                    </Paper>

                    <Paper sx={{ border: "1px solid #343b43", borderRadius: 2, overflow: "hidden" }}>
                      <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid #343b43" }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <GraphicEqRounded fontSize="small" />
                          <Typography variant="subtitle1">{t("voicesTab.customVoices")}</Typography>
                          <Chip size="small" label={voices.custom_voices.length} />
                        </Stack>
                      </Box>
                      <List dense sx={{ p: 1 }}>
                        {voices.custom_voices.map((voice) => (
                          <ListItemButton key={voice.speakers[0]}>
                            <ListItemText
                              primary={voice.name || voice.speakers[0]}
                              secondary={[voice.speakers[0], voice.description || ""].filter(Boolean).join(" • ")}
                            />
                            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => {
                                  setSelectedSpeaker(voice.speakers[0]);
                                  setActiveTab("synthesis");
                                }}
                              >
                                {t("voicesTab.useButton")}
                              </Button>
                              <IconButton color="error" size="small" onClick={() => deleteVoice(voice.speakers[0])}>
                                <DeleteOutlineRounded />
                              </IconButton>
                            </Stack>
                          </ListItemButton>
                        ))}
                        {!voices.custom_voices.length && (
                          <Box sx={{ px: 2, py: 1.5 }}>
                            <Typography color="text.secondary">{t("voicesTab.noCustomVoices")}</Typography>
                          </Box>
                        )}
                      </List>
                    </Paper>
                  </Box>
                </CardContent>
              </Card>
            )}

            {activeTab === "custom" && (
              <Card>
                <CardContent sx={sectionCardSx}>
                  <Stack spacing={2.5}>
                    <Stack spacing={0.5}>
                      <Typography variant="h6">{t("customTab.description")}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t("customTab.speakerNameHint")}
                      </Typography>
                    </Stack>

                    <TextField
                      label={t("customTab.speakerNameLabel")}
                      value={newVoiceName}
                      onChange={(event) => setNewVoiceName(event.target.value)}
                      placeholder={t("customTab.speakerNamePlaceholder")}
                    />

                    <Paper
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={onDropAudio}
                      sx={{
                        border: "1px dashed #4d5763",
                        borderRadius: 2,
                        p: { xs: 2.5, md: 3 },
                        textAlign: "center",
                        backgroundColor: "#1f242b",
                      }}
                    >
                      <Stack spacing={1.5} alignItems="center">
                        <UploadFileRounded sx={{ fontSize: { xs: 32, md: 40 } }} />
                        <Typography>{t("customTab.dropAudioHere")}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {t("customTab.chooseManually")}
                        </Typography>
                        {audioFile && (
                          <Chip
                            label={`${audioFile.name} • ${(audioFile.size / 1024 / 1024).toFixed(2)} MB`}
                            variant="outlined"
                          />
                        )}
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ width: { xs: "100%", sm: "auto" } }}>
                          <Button variant="outlined" startIcon={<FolderOpenRounded />} onClick={chooseAudioFile} fullWidth>
                            {t("customTab.chooseFileButton")}
                          </Button>
                          <Button variant="outlined" onClick={() => setAudioFile(null)} disabled={!audioFile} fullWidth>
                            {t("customTab.clearButton")}
                          </Button>
                        </Stack>
                      </Stack>
                      <input
                        ref={fileInputRef}
                        hidden
                        type="file"
                        accept="audio/*"
                        onChange={(event) => setAudioFile(event.target.files?.[0] ?? null)}
                      />
                    </Paper>

                    <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
                      <Button variant="contained" startIcon={<UploadFileRounded />} onClick={addCustomVoice} disabled={isLoading}>
                        {t("customTab.uploadButton")}
                      </Button>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            )}

            {activeTab === "synthesis" && (
              <Card>
                <CardContent sx={sectionCardSx}>
                  <Stack spacing={2.5}>
                    <Stack spacing={0.5}>
                      <Typography variant="h6">{t("synthesisTab.title")}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t("synthesisTab.description")}
                      </Typography>
                    </Stack>

                    <FormControl fullWidth variant="filled">
                      <InputLabel id="speaker-label">{t("synthesisTab.speakerLabel")}</InputLabel>
                      <Select
                        labelId="speaker-label"
                        value={selectedSpeaker}
                        onChange={(event) => setSelectedSpeaker(event.target.value)}
                      >
                        <MenuItem value="">{t("synthesisTab.speakerPlaceholder")}</MenuItem>
                        {allVoices.map((voice) => (
                          <MenuItem key={voice.speakers[0]} value={voice.speakers[0]}>
                            {(voice.name || voice.speakers[0]) + " • " + voice.speakers[0]}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "120px 1fr", md: "140px 1fr" } }}>
                      <FormControl fullWidth variant="filled">
                        <InputLabel id="format-label">{t("synthesisTab.formatLabel")}</InputLabel>
                        <Select labelId="format-label" value={format} onChange={(event) => setFormat(event.target.value)}>
                          <MenuItem value="wav">wav</MenuItem>
                          <MenuItem value="ogg">ogg</MenuItem>
                        </Select>
                      </FormControl>

                      <FormControl fullWidth variant="filled">
                        <InputLabel id="effect-label">{t("synthesisTab.effectLabel")}</InputLabel>
                        <Select
                          labelId="effect-label"
                          value={selectedEffect}
                          onChange={(event) => setSelectedEffect(event.target.value)}
                        >
                          <MenuItem value="">{t("synthesisTab.noEffect")}</MenuItem>
                          {effects.map((effect) => (
                            <MenuItem key={effect} value={effect}>
                              {effect}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>

                    <TextField
                      label={t("synthesisTab.textLabel")}
                      multiline
                      minRows={8}
                      value={text}
                      onChange={(event) => setText(event.target.value)}
                      placeholder={t("synthesisTab.textPlaceholder")}
                    />

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 1.5, sm: 1 }}>
                      <Button variant="outlined" startIcon={<WavesRounded />} onClick={fetchEffects} disabled={isLoading}>
                        {t("synthesisTab.loadEffectsButton")}
                      </Button>
                      <Button variant="contained" startIcon={<PlayArrowRounded />} onClick={synthesizeSpeech} disabled={isLoading}>
                        {t("synthesisTab.generateButton")}
                      </Button>
                    </Stack>

                    {audioUrl && <AudioPlayer audioUrl={audioUrl} onDownload={downloadAudio} />}
                  </Stack>
                </CardContent>
              </Card>
            )}

            </Box>
          </Container>

          <Box component="footer" sx={{ width: "100%", borderTop: "1px solid #2d333b", backgroundColor: "#20252b" }}>
            <Container maxWidth="lg">
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ py: 1, px: 2, flexWrap: { xs: "wrap", sm: "nowrap" }, gap: { xs: 1, sm: 1 } }}
              >
                <Typography variant="body2" sx={{ color: "#838c96", whiteSpace: "nowrap", fontSize: { xs: 11, sm: 12 } }}>
                  {t("footer.madeBy")}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ flexWrap: "nowrap", gap: 0.5 }}>
                  <LanguageSelector compact />
                  <Button size="small" color="inherit" sx={{ px: 0.5, minWidth: "auto", fontSize: 11, lineHeight: 1.2, height: 24 }} endIcon={<OpenInNewRounded sx={{ fontSize: 12 }} />} onClick={() => openExternal("https://ntts.fdev.team")}>
                    {t("footer.nttsWebsite")}
                  </Button>
                  <Button size="small" color="inherit" sx={{ px: 0.5, minWidth: "auto", fontSize: 11, lineHeight: 1.2, height: 24 }} endIcon={<OpenInNewRounded sx={{ fontSize: 12 }} />} onClick={() => openExternal("https://t.me/Technorch")}>
                    {t("footer.nttsTelegram")}
                  </Button>
                  <Button size="small" color="inherit" sx={{ px: 0.5, minWidth: "auto", fontSize: 11, lineHeight: 1.2, height: 24 }} endIcon={<OpenInNewRounded sx={{ fontSize: 12 }} />} onClick={() => openExternal("https://discord.gg")}>
                    {t("footer.nttsDiscord")}
                  </Button>
                  <Button size="small" color="inherit" sx={{ px: 0.5, minWidth: "auto", fontSize: 11, lineHeight: 1.2, height: 24 }} endIcon={<OpenInNewRounded sx={{ fontSize: 12 }} />} onClick={() => openExternal("https://boosty.to/fdevteam")}>
                    {t("footer.nttsBoosty")}
                  </Button>
                  <Button size="small" color="inherit" sx={{ px: 0.5, minWidth: "auto", fontSize: 11, lineHeight: 1.2, height: 24 }} endIcon={<OpenInNewRounded sx={{ fontSize: 12 }} />} onClick={() => openExternal("https://boosty.to/cryalsss")}>
                    {t("footer.developerBoosty")}
                  </Button>
                </Stack>
              </Stack>
            </Container>
          </Box>

          {isLoading ? <LinearProgress /> : null}

          <Snackbar
            open={Boolean(notice)}
            autoHideDuration={notice?.severity === "error" ? 6000 : 4000}
            onClose={() => setNotice(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          >
            <Alert severity={notice?.severity ?? "info"} variant="filled" onClose={() => setNotice(null)}>
              {notice?.message}
            </Alert>
          </Snackbar>
        </Box>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
