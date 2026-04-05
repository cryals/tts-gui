# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Desktop Electron client for the NTTS API (text-to-speech service). Single-page React application with Material-UI components that provides:
- Voice library browsing (system and custom voices)
- Custom voice creation from reference audio
- Speech synthesis with effects
- Audio preview and file saving

## Architecture

**Electron + React + Vite stack:**
- `electron/main.mjs` - Main process, window management, IPC handlers for native dialogs
- `electron/preload.mjs` - Context bridge exposing `window.desktop` API to renderer
- `src/app/App.tsx` - Main React app component with UI logic
- `src/main.tsx` - React entry point

**Services Layer:**
- `src/services/api.ts` - API service with caching, retry logic, request deduplication
- `src/services/storage.ts` - LocalStorage wrapper with debounced saves

**Components:**
- `src/components/AudioPlayer.tsx` - Enhanced audio player with controls, progress, volume, speed

**Types:**
- `src/types/api.ts` - TypeScript type definitions

**Key patterns:**
- API requests cached with 1-hour TTL in localStorage
- Exponential backoff retry (3 attempts: 1s, 2s, 4s delays)
- Request deduplication prevents concurrent duplicate calls
- Text saves debounced to 1 second to reduce localStorage writes
- Error categorization (auth/network/validation/server)
- Native file dialogs via IPC when running in Electron, fallback to web inputs
- Material-UI dark theme with custom GitHub-inspired color palette

**IPC channels:**
- `desktop:get-runtime-info` - Platform and version info
- `desktop:open-external` - Open URLs in system browser
- `desktop:pick-audio-file` - Native file picker for audio uploads
- `desktop:save-audio` - Native save dialog for generated audio

## Development Commands

```bash
# Install dependencies
npm install

# Run development build (starts Vite dev server + Electron)
npm run dev

# Build web assets only
npm run build:web

# Build desktop application (all platforms)
npm run build

# Platform-specific builds
npm run dist:linux
npm run dist:win
npm run dist:mac
```

## Important Notes

- The `@` alias resolves to `./src` directory (configured in vite.config.ts)
- React and Tailwind plugins are required in vite.config.ts even if Tailwind isn't actively used (Make requirement)
- Never add `.css`, `.tsx`, or `.ts` to `assetsInclude` in Vite config
- `scripts/fix-plist.mjs` runs post-install to fix macOS packaging issues
- UI text is in Russian (interface language for target users)
- Single-instance lock prevents multiple app windows
- Dark theme is forced via `nativeTheme.themeSource = "dark"`

## API Integration

All API endpoints require `Authorization: Bearer <token>` header:
- `GET /speakers` - Fetch available voices (returns `voices` and `custom_voices` arrays)
- `POST /speakers` - Upload custom voice (FormData with `audio` file and `speaker_name`)
- `DELETE /speakers/:name` - Delete custom voice
- `GET /effects` - Fetch available audio effects
- `GET /?speaker=X&text=Y&ext=Z&effect=W` - Synthesize speech (returns audio blob)

**Caching behavior:**
- Voices and effects cached for 1 hour in localStorage
- Cache automatically invalidated after POST/DELETE operations
- Manual cache clear via "Обновить" (Refresh) button

**Error handling:**
- 401/403 → "Ошибка авторизации" (auth error)
- Network errors → "Ошибка сети" (network error)
- 400/422 → Validation error with API message
- 500+ → "Ошибка сервера" (server error)

Voice objects are normalized via `normalizeVoice()` to handle API response variations.

## Code Quality

- Use the API service (`src/services/api.ts`) for all API calls, never inline fetch
- Use the storage service (`src/services/storage.ts`) for localStorage operations
- Error handling should use `handleApiError()` for consistent user feedback
- All new components should follow MUI styling patterns with responsive breakpoints (xs, sm, md)
- Add proper TypeScript types, import from `src/types/api.ts`
