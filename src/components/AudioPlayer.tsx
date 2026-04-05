import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  LinearProgress,
  Paper,
  Slider,
  Stack,
  Typography,
  MenuItem,
  Select,
  FormControl,
} from "@mui/material";
import {
  CloudDownloadRounded,
  PauseRounded,
  PlayArrowRounded,
  VolumeUpRounded,
  VolumeOffRounded,
} from "@mui/icons-material";

type AudioPlayerProps = {
  audioUrl: string;
  onDownload: () => void;
};

export default function AudioPlayer({ audioUrl, onDownload }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    const handleError = () => {
      setHasError(true);
      setIsLoading(false);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);
    audio.addEventListener("canplay", handleCanPlay);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("canplay", handleCanPlay);
    };
  }, [audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.playbackRate = playbackRate;
  }, [playbackRate]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.muted = isMuted;
  }, [isMuted]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (event.code === "Space") {
        event.preventDefault();
        togglePlayPause();
      } else if (event.code === "ArrowLeft") {
        event.preventDefault();
        seek(currentTime - 5);
      } else if (event.code === "ArrowRight") {
        event.preventDefault();
        seek(currentTime + 5);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentTime]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(() => setHasError(true));
      setIsPlaying(true);
    }
  };

  const seek = (time: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = Math.max(0, Math.min(time, duration));
  };

  const handleProgressChange = (_event: Event, value: number | number[]) => {
    seek(value as number);
  };

  const handleVolumeChange = (_event: Event, value: number | number[]) => {
    setVolume((value as number) / 100);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const formatTime = (seconds: number): string => {
    if (!isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (hasError) {
    return (
      <Paper
        sx={{
          p: { xs: 1.5, md: 2 },
          border: "1px solid #343b43",
          borderRadius: 2,
          backgroundColor: "#1f242b",
        }}
      >
        <Typography color="error">Ошибка загрузки аудио</Typography>
      </Paper>
    );
  }

  return (
    <Paper
      sx={{
        p: { xs: 1.5, md: 2 },
        border: "1px solid #343b43",
        borderRadius: 2,
        backgroundColor: "#1f242b",
      }}
    >
      <Stack spacing={2}>
        <Typography variant="subtitle1">Сгенерированное аудио</Typography>

        <audio ref={audioRef} src={audioUrl} preload="metadata" style={{ display: "none" }} />

        {isLoading && <LinearProgress />}

        {!isLoading && (
          <>
            <Stack direction="row" spacing={1} alignItems="center">
              <IconButton
                onClick={togglePlayPause}
                color="primary"
                sx={{ width: { xs: 44, md: 48 }, height: { xs: 44, md: 48 } }}
              >
                {isPlaying ? <PauseRounded /> : <PlayArrowRounded />}
              </IconButton>

              <Box sx={{ flex: 1, px: 1 }}>
                <Slider
                  value={currentTime}
                  max={duration}
                  onChange={handleProgressChange}
                  sx={{
                    "& .MuiSlider-thumb": {
                      width: { xs: 12, md: 16 },
                      height: { xs: 12, md: 16 },
                    },
                  }}
                />
              </Box>

              <Typography variant="body2" sx={{ minWidth: { xs: 80, md: 100 }, textAlign: "right" }}>
                {formatTime(currentTime)} / {formatTime(duration)}
              </Typography>
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ xs: "stretch", sm: "center" }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ flex: { sm: 1 } }}>
                <IconButton onClick={toggleMute} size="small">
                  {isMuted ? <VolumeOffRounded /> : <VolumeUpRounded />}
                </IconButton>
                <Slider
                  value={isMuted ? 0 : volume * 100}
                  onChange={handleVolumeChange}
                  sx={{ maxWidth: { xs: "100%", sm: 120 } }}
                />
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="body2" sx={{ minWidth: 80 }}>
                  Скорость:
                </Typography>
                <FormControl size="small" sx={{ minWidth: 80 }}>
                  <Select
                    value={playbackRate}
                    onChange={(e) => setPlaybackRate(Number(e.target.value))}
                    sx={{ fontSize: "0.875rem" }}
                  >
                    <MenuItem value={0.5}>0.5x</MenuItem>
                    <MenuItem value={0.75}>0.75x</MenuItem>
                    <MenuItem value={1}>1x</MenuItem>
                    <MenuItem value={1.25}>1.25x</MenuItem>
                    <MenuItem value={1.5}>1.5x</MenuItem>
                    <MenuItem value={2}>2x</MenuItem>
                  </Select>
                </FormControl>
              </Stack>

              <Button
                variant="outlined"
                startIcon={<CloudDownloadRounded />}
                onClick={onDownload}
                sx={{ minWidth: { xs: "100%", sm: "auto" } }}
              >
                Скачать
              </Button>
            </Stack>
          </>
        )}
      </Stack>
    </Paper>
  );
}
