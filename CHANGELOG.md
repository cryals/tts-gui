# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- **Auto-Update System**: Automatic update checking and installation
  - Update notification dialog on app start
  - Download progress indicator
  - One-click install and restart
  - Only checks for updates in production builds

### Changed
- Updated GitHub Actions workflow to support version tags (v1.0.0)
- Added publish configuration for GitHub releases

## [1.0.0] - 2026-04-05

### Added
- **API Service Layer**: Request caching with 1-hour TTL for voices and effects
- **Retry Logic**: Exponential backoff retry (3 attempts) for failed API requests
- **Request Deduplication**: Prevents concurrent duplicate API calls
- **Enhanced Audio Player**: 
  - Playback controls with play/pause
  - Progress bar with time display
  - Volume control slider
  - Playback speed control (0.5x to 2x)
  - Keyboard shortcuts (Space = play/pause, Arrow keys = seek)
- **Debounced Text Saving**: Text input now saves to localStorage after 1 second of inactivity
- **Error Categorization**: Better error messages for auth, network, validation, and server errors
- **Responsive Design Improvements**:
  - Added `sm` breakpoints throughout for better tablet experience
  - Responsive token input field sizing
  - Responsive icon sizing
  - Better button layouts on mobile
  - Improved spacing and padding across all screen sizes

### Changed
- Increased error notification duration from 4s to 6s
- Improved Russian translations throughout the interface
- Logo now scales responsively (20px on mobile, 24px on desktop)
- Voice grid now uses 2 columns on tablets (sm breakpoint)
- Format field width is now responsive (120px on sm, 140px on md)

### Fixed
- Audio player no longer uses inline styles
- Proper cleanup of blob URLs when audio changes
- Better touch targets for mobile devices
- Consistent spacing in button stacks

### Technical
- Extracted API logic into `/src/services/api.ts`
- Extracted storage logic into `/src/services/storage.ts`
- Created type definitions in `/src/types/api.ts`
- Created AudioPlayer component in `/src/components/AudioPlayer.tsx`
- Improved code organization and maintainability

## [0.0.1] - 2026-04-04

### Added
- Initial release
- Basic NTTS API integration
- Voice library browsing
- Custom voice creation
- Speech synthesis
- Audio preview and download
