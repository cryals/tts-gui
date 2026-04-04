import { Component, useEffect, useMemo, useRef, useState, type DragEvent, type ReactNode } from "react";
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
  Divider,
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
  CloudDownloadRounded,
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

type Voice = {
  name: string;
  description: string;
  source: string;
  gender: string;
  speakers: string[];
};

type VoicesResponse = {
  voices: Voice[];
  custom_voices: Voice[];
};

type RuntimeInfo = {
  appName: string;
  platform: string;
  version: string;
  isPackaged: boolean;
};

type Notice = {
  message: string;
  severity: "success" | "error" | "info";
};

type TabValue = "voices" | "custom" | "synthesis";

const API_BASE = "https://ntts.fdev.team/api/v1/tts";
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
              Интерфейс упал
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              Ниже текст ошибки renderer. Белого экрана больше не будет.
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

  const headers = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
    }),
    [token],
  );

  useEffect(() => {
    const savedToken = window.localStorage.getItem("ntts-token");
    const savedSpeaker = window.localStorage.getItem("ntts-speaker");
    const savedText = window.localStorage.getItem("ntts-text");

    if (savedToken) setToken(savedToken);
    if (savedSpeaker) setSelectedSpeaker(savedSpeaker);
    if (savedText) setText(savedText);

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
    if (token.trim()) {
      window.localStorage.setItem("ntts-token", token);
    } else {
      window.localStorage.removeItem("ntts-token");
    }
  }, [token]);

  useEffect(() => {
    if (selectedSpeaker) {
      window.localStorage.setItem("ntts-speaker", selectedSpeaker);
    }
  }, [selectedSpeaker]);

  useEffect(() => {
    window.localStorage.setItem("ntts-text", text);
  }, [text]);

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const notify = (message: string, severity: Notice["severity"] = "info") => {
    setNotice({ message, severity });
  };

  const ensureToken = () => {
    if (token.trim()) return true;
    notify("Введите токен API.", "error");
    return false;
  };

  const readJson = async <T,>(response: Response): Promise<T> => {
    const payload = (await response.json()) as T & { message?: string };
    if (!response.ok) {
      throw new Error(payload.message ?? "Ошибка API.");
    }
    return payload;
  };

  const fetchVoices = async () => {
    if (!ensureToken()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/speakers`, { headers });
      const data = await readJson<unknown>(response);
      const normalized = normalizeVoicesResponse(data);
      console.log("voices.loaded", normalized);
      setVoices(normalized);
      notify("Голоса загружены.", "success");
    } catch (error) {
      notify(`Не удалось загрузить голоса: ${String(error)}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEffects = async () => {
    if (!ensureToken()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/effects`, { headers });
      const data = await readJson<{ effects?: string[] }>(response);
      setEffects(data.effects ?? []);
      notify("Эффекты загружены.", "success");
    } catch (error) {
      notify(`Не удалось загрузить эффекты: ${String(error)}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAll = async () => {
    if (!ensureToken()) return;
    await Promise.all([fetchVoices(), fetchEffects()]);
  };

  const synthesizeSpeech = async () => {
    if (!ensureToken()) return;
    if (!selectedSpeaker || !text.trim()) {
      notify("Выберите голос и введите текст.", "error");
      return;
    }

    setIsLoading(true);
    try {
      if (audioUrl) URL.revokeObjectURL(audioUrl);

      const params = new URLSearchParams({
        speaker: selectedSpeaker,
        text: text.trim(),
        ext: format,
      });

      if (selectedEffect) {
        params.set("effect", selectedEffect);
      }

      const response = await fetch(`${API_BASE}?${params.toString()}`, { headers });
      if (!response.ok) {
        throw new Error("Ошибка синтеза.");
      }

      const blob = await response.blob();
      setAudioUrl(URL.createObjectURL(blob));
      notify("Аудио сгенерировано.", "success");
    } catch (error) {
      notify(`Не удалось синтезировать речь: ${String(error)}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const addCustomVoice = async () => {
    if (!ensureToken()) return;
    if (!newVoiceName.trim() || !audioFile) {
      notify("Нужны имя голоса и аудиофайл.", "error");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("audio", audioFile);
      formData.append("speaker_name", newVoiceName.trim());

      const response = await fetch(`${API_BASE}/speakers`, {
        method: "POST",
        headers,
        body: formData,
      });

      const data = await readJson<{ message?: string }>(response);
      setNewVoiceName("");
      setAudioFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await fetchVoices();
      notify(data.message ?? "Голос добавлен.", "success");
    } catch (error) {
      notify(`Не удалось создать голос: ${String(error)}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteVoice = async (speakerName: string) => {
    if (!ensureToken()) return;
    if (!window.confirm(`Удалить голос ${speakerName}?`)) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/speakers/${speakerName}`, {
        method: "DELETE",
        headers,
      });

      const data = await readJson<{ message?: string }>(response);
      await fetchVoices();
      notify(data.message ?? "Голос удален.", "success");
    } catch (error) {
      notify(`Не удалось удалить голос: ${String(error)}`, "error");
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
      notify(`Не удалось выбрать файл: ${String(error)}`, "error");
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
          notify(`Файл сохранен: ${result.filePath}`, "success");
        }
        return;
      }

      const link = document.createElement("a");
      link.href = audioUrl;
      link.download = fileName;
      link.click();
    } catch (error) {
      notify(`Не удалось скачать аудио: ${String(error)}`, "error");
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
    p: { xs: 2, md: 2.5 },
  };

  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ minHeight: "100vh" }}>
          <AppBar position="sticky">
            <Toolbar sx={{ gap: 2, py: 1.25, flexWrap: "wrap" }}>
              <Box sx={{ display: "flex", alignItems: "center", minWidth: 0 }}>
                <Box
                  component="img"
                  src={tallLogoImage}
                  alt="NTTS"
                  sx={{ height: 24, width: "auto", objectFit: "contain", display: "block" }}
                />
              </Box>
              <TextField
                hiddenLabel
                size="small"
                placeholder="Bearer token"
                value={token}
                onChange={(event) => setToken(event.target.value)}
                type={showToken ? "text" : "password"}
                sx={{ flex: 1, minWidth: 260, maxWidth: 760 }}
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
                Refresh
              </Button>
            </Toolbar>
          </AppBar>

          <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 }, display: "grid", gap: 2 }}>
            <Card>
              <CardContent sx={{ p: 0 }}>
                <Tabs value={activeTab} onChange={(_, value: TabValue) => setActiveTab(value)} variant="scrollable">
                  <Tab value="voices" label="Voices" />
                  <Tab value="custom" label="Custom Voice" />
                  <Tab value="synthesis" label="Speech Synthesis" />
                </Tabs>
              </CardContent>
            </Card>

            <Card>
              <CardContent sx={{ ...sectionCardSx, pb: { xs: 2, md: 2.5 } }}>
                <Stack spacing={0.75}>
                  <Typography variant="h6">
                    {activeTab === "voices"
                      ? "Voice Library"
                      : activeTab === "custom"
                        ? "Create Custom Voice"
                        : "Synthesis Workspace"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {activeTab === "voices"
                      ? "Load available voices, inspect speaker IDs and send any voice straight to the synthesis tab."
                      : activeTab === "custom"
                        ? "Set the speaker name, add a reference audio file and upload it to the NTTS API."
                        : "Select a speaker, choose audio format and effect, then generate and listen to the result."}
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
                      <Typography variant="h6">All Voices</Typography>
                      <Typography variant="body2" color="text.secondary">
                        System voices and your uploaded custom voices.
                      </Typography>
                    </Stack>
                    <Button variant="outlined" startIcon={<RefreshRounded />} onClick={fetchVoices} disabled={isLoading}>
                      Load voices
                    </Button>
                  </Stack>

                  <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
                    <Paper sx={{ border: "1px solid #343b43", borderRadius: 2, overflow: "hidden" }}>
                      <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid #343b43" }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <LibraryMusicRounded fontSize="small" />
                          <Typography variant="subtitle1">System Voices</Typography>
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
                                voice.source ? `Source: ${voice.source}` : "",
                                voice.description || "",
                              ]
                                .filter(Boolean)
                                .join(" • ")}
                            />
                          </ListItemButton>
                        ))}
                        {!voices.voices.length && (
                          <Box sx={{ px: 2, py: 1.5 }}>
                            <Typography color="text.secondary">No voices loaded yet.</Typography>
                          </Box>
                        )}
                      </List>
                    </Paper>

                    <Paper sx={{ border: "1px solid #343b43", borderRadius: 2, overflow: "hidden" }}>
                      <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid #343b43" }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <GraphicEqRounded fontSize="small" />
                          <Typography variant="subtitle1">Custom Voices</Typography>
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
                            <Stack direction="row" spacing={1}>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => {
                                  setSelectedSpeaker(voice.speakers[0]);
                                  setActiveTab("synthesis");
                                }}
                              >
                                Use
                              </Button>
                              <IconButton color="error" onClick={() => deleteVoice(voice.speakers[0])}>
                                <DeleteOutlineRounded />
                              </IconButton>
                            </Stack>
                          </ListItemButton>
                        ))}
                        {!voices.custom_voices.length && (
                          <Box sx={{ px: 2, py: 1.5 }}>
                            <Typography color="text.secondary">No custom voices yet.</Typography>
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
                      <Typography variant="h6">Create Voice by Reference</Typography>
                      <Typography variant="body2" color="text.secondary">
                        The speaker name will be used as the API identifier for synthesis and deletion.
                      </Typography>
                    </Stack>

                    <TextField
                      label="Speaker name"
                      value={newVoiceName}
                      onChange={(event) => setNewVoiceName(event.target.value)}
                      placeholder="aaron"
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
                        <UploadFileRounded />
                        <Typography>Drop audio here</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Or choose a file manually
                        </Typography>
                        {audioFile && (
                          <Chip
                            label={`${audioFile.name} • ${(audioFile.size / 1024 / 1024).toFixed(2)} MB`}
                            variant="outlined"
                          />
                        )}
                        <Stack direction="row" spacing={1}>
                          <Button variant="outlined" startIcon={<FolderOpenRounded />} onClick={chooseAudioFile}>
                            Choose file
                          </Button>
                          <Button variant="outlined" onClick={() => setAudioFile(null)} disabled={!audioFile}>
                            Clear
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
                        Upload voice
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
                      <Typography variant="h6">Speech Synthesis</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Generate audio from text, listen to it in place and save the result to a file.
                      </Typography>
                    </Stack>

                    <FormControl fullWidth variant="filled">
                      <InputLabel id="speaker-label">Speaker</InputLabel>
                      <Select
                        labelId="speaker-label"
                        value={selectedSpeaker}
                        onChange={(event) => setSelectedSpeaker(event.target.value)}
                      >
                        <MenuItem value="">Select a voice</MenuItem>
                        {allVoices.map((voice) => (
                          <MenuItem key={voice.speakers[0]} value={voice.speakers[0]}>
                            {(voice.name || voice.speakers[0]) + " • " + voice.speakers[0]}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "180px 1fr" } }}>
                      <FormControl fullWidth variant="filled">
                        <InputLabel id="format-label">Format</InputLabel>
                        <Select labelId="format-label" value={format} onChange={(event) => setFormat(event.target.value)}>
                          <MenuItem value="wav">wav</MenuItem>
                          <MenuItem value="ogg">ogg</MenuItem>
                        </Select>
                      </FormControl>

                      <FormControl fullWidth variant="filled">
                        <InputLabel id="effect-label">Effect</InputLabel>
                        <Select
                          labelId="effect-label"
                          value={selectedEffect}
                          onChange={(event) => setSelectedEffect(event.target.value)}
                        >
                          <MenuItem value="">No effect</MenuItem>
                          {effects.map((effect) => (
                            <MenuItem key={effect} value={effect}>
                              {effect}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>

                    <TextField
                      label="Text"
                      multiline
                      minRows={8}
                      value={text}
                      onChange={(event) => setText(event.target.value)}
                      placeholder="Enter text for synthesis"
                    />

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                      <Button variant="outlined" startIcon={<WavesRounded />} onClick={fetchEffects} disabled={isLoading}>
                        Load effects
                      </Button>
                      <Button variant="contained" startIcon={<PlayArrowRounded />} onClick={synthesizeSpeech} disabled={isLoading}>
                        Generate audio
                      </Button>
                    </Stack>

                    {audioUrl && (
                      <Paper sx={{ p: 2, border: "1px solid #343b43", borderRadius: 2, backgroundColor: "#1f242b" }}>
                        <Stack spacing={2}>
                          <Typography variant="subtitle1">Generated Audio</Typography>
                          <audio controls src={audioUrl} style={{ width: "100%" }} />
                          <Box>
                            <Button variant="outlined" startIcon={<CloudDownloadRounded />} onClick={downloadAudio}>
                              Download
                            </Button>
                          </Box>
                        </Stack>
                      </Paper>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            )}

            <Paper
              sx={{
                px: 2,
                py: 1.25,
                border: "1px solid #2d333b",
                borderRadius: 2,
                backgroundColor: "#20252b",
              }}
            >
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={1}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", md: "center" }}
              >
                <Typography variant="body2" sx={{ color: "#838c96" }}>
                  Made by AL-S. API provided by FDev.
                </Typography>
                <Stack direction="row" spacing={0.25} flexWrap="wrap" useFlexGap>
                  <Button size="small" color="inherit" variant="text" endIcon={<OpenInNewRounded />} onClick={() => openExternal("https://ntts.fdev.team")}>
                    Website
                  </Button>
                  <Button size="small" color="inherit" variant="text" endIcon={<OpenInNewRounded />} onClick={() => openExternal("https://t.me/Technorch")}>
                    Telegram Bot
                  </Button>
                  <Button size="small" color="inherit" variant="text" endIcon={<OpenInNewRounded />} onClick={() => openExternal("https://discord.gg")}>
                    Discord
                  </Button>
                  <Button size="small" color="inherit" variant="text" endIcon={<OpenInNewRounded />} onClick={() => openExternal("https://boosty.to")}>
                    Boosty
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          </Container>

          {isLoading ? <LinearProgress /> : null}

          <Snackbar
            open={Boolean(notice)}
            autoHideDuration={4000}
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
