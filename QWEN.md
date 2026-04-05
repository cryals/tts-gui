# QWEN.md — NTTS API GUI

## Project Overview

**NTTS API GUI** is a desktop Electron client for the NTTS (Neural Text-to-Speech) API. It provides a single-page React application with Material-UI components for:

- Browsing system and custom voice libraries
- Creating custom voices from reference audio files
- Synthesizing speech with various audio effects
- Previewing, playing, and saving generated audio

The application targets Russian-speaking users (UI text is in Russian by default) and supports English and Ukrainian via i18n.

**Tech Stack:** Electron 36 + React 18 + Vite 6 + Material-UI 7 + Tailwind CSS 4 + TypeScript

**API Endpoint:** `https://ntts.fdev.team/api/v1/tts` (requires Bearer token authentication)

---

## Directory Structure

```
ntts-api-gui/
├── electron/
│   ├── main.mjs            # Electron main process, IPC handlers, auto-updater
│   └── preload.mjs         # Context bridge exposing window.desktop API
├── src/
│   ├── app/
│   │   └── App.tsx         # Main React component (all UI logic)
│   ├── components/
│   │   ├── AudioPlayer.tsx # Enhanced audio player with controls
│   │   └── UpdateChecker.tsx
│   ├── services/
│   │   ├── api.ts          # API service (caching, retry, deduplication)
│   │   └── storage.ts      # LocalStorage wrapper with debounced saves
│   ├── types/
│   │   └── api.ts          # TypeScript type definitions
│   ├── locales/
│   │   ├── ru.ts           # Russian translations (default)
│   │   ├── en.ts           # English translations
│   │   └── uk.ts           # Ukrainian translations
│   ├── assets/             # Images, icons
│   ├── styles/             # Global styles
│   ├── i18n.ts             # i18next configuration
│   ├── main.tsx            # React entry point
│   └── vite-env.d.ts       # Vite environment types
├── build/                  # Build resources (icons, etc.)
├── release/                # electron-builder output
├── scripts/
│   └── fix-plist.mjs       # Post-install fix for macOS packaging
├── package.json
├── vite.config.ts
└── postcss.config.mjs
```

---

## Building and Running

### Install dependencies
```bash
npm install
```

### Development
```bash
npm run dev          # Starts Vite dev server + Electron concurrently
```

### Build
```bash
npm run build:web    # Build web assets only (Vite)
npm run build        # Build web + package Electron app (all platforms)
npm run dist         # Alias for npm run build
```

### Platform-specific builds
```bash
npm run dist:linux   # Linux: AppImage, deb, tar.gz
npm run dist:win     # Windows: NSIS, portable
npm run dist:mac     # macOS: DMG, ZIP
```

---

## Architecture

### Electron Main Process (`electron/main.mjs`)
- Creates BrowserWindow with dark theme, custom title bar
- Single-instance lock enforcement
- IPC handlers:
  - `desktop:get-runtime-info` — Platform and version info
  - `desktop:open-external` — Open URLs in system browser
  - `desktop:pick-audio-file` — Native file picker for audio uploads
  - `desktop:save-audio` — Native save dialog for generated audio
  - `updater:check-for-updates` — Check for updates
  - `updater:download-update` — Download update
  - `updater:install-update` — Install and restart
- Auto-updater with `electron-updater` (GitHub releases)

### API Service (`src/services/api.ts`)
All API calls go through this service — **never use inline `fetch`**:
- **Caching:** Voices and effects cached for 1 hour in localStorage
- **Retry logic:** Exponential backoff (3 attempts: 1s, 2s, 4s delays)
- **Request deduplication:** Prevents concurrent duplicate calls via `inFlightRequests` map
- **Timeout:** 30 seconds per request
- **Error categorization:** auth (401/403), network, validation (400/422), server (500+)

### Storage Service (`src/services/storage.ts`)
- Token, selected speaker, text persisted in localStorage
- Debounced text saves (1 second delay)
- Cache management with TTL support

### Key Patterns
- `@` alias resolves to `./src` (configured in `vite.config.ts`)
- Dark theme forced via `nativeTheme.themeSource = "dark"`
- React and Tailwind plugins are required in Vite config (Make requirement)
- Never add `.css`, `.tsx`, or `.ts` to `assetsInclude` in Vite config
- `scripts/fix-plist.mjs` runs post-install to fix macOS packaging issues

---

## API Endpoints

All endpoints require `Authorization: Bearer <token>` header:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/speakers` | Fetch available voices (returns `voices` and `custom_voices`) |
| POST | `/speakers` | Upload custom voice (FormData: `audio`, `speaker_name`) |
| DELETE | `/speakers/:name` | Delete custom voice |
| GET | `/effects` | Fetch available audio effects |
| GET | `/?speaker=X&text=Y&ext=Z&effect=W` | Synthesize speech (returns audio blob) |

---

## Code Quality Guidelines

- Use the API service (`src/services/api.ts`) for all API calls
- Use the storage service (`src/services/storage.ts`) for localStorage operations
- Error handling should use `handleApiError()` for consistent user feedback
- All components should follow MUI styling patterns with responsive breakpoints (xs, sm, md)
- Add proper TypeScript types, import from `src/types/api.ts`
- UI text uses i18next (`useTranslation()` hook), translations in `src/locales/`
