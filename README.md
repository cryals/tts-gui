# NTTS GUI

Desktop Electron client for the NTTS API.

It provides a simple interface for:

- loading available voices
- creating custom voices from reference audio
- synthesizing speech
- previewing and saving generated audio

![ntts gui](https://cdn.discordapp.com/attachments/1490023521219248178/1490023521429094539/image.png?ex=69d28c0a&is=69d13a8a&hm=817aac0dffa70b961c4b582e8cc6b6b85e65a77133a434292276db2b3ccf3b2d&)

## Features

- **Voice Library**: Browse system voices and custom voices with detailed information
- **Custom Voice Creation**: Upload reference audio to create personalized voices
- **Speech Synthesis**: Generate audio from text with various effects
- **Enhanced Audio Player**: 
  - Playback controls with progress bar
  - Volume and speed adjustment
  - Keyboard shortcuts (Space, Arrow keys)
- **Smart Caching**: Voices and effects are cached for faster loading
- **Automatic Retry**: Failed requests are automatically retried with exponential backoff
- **Responsive Design**: Works well on different screen sizes
- **Native File Dialogs**: Native OS file pickers and save dialogs

## Development

Install dependencies:

```bash
npm install
```

Run the development build:

```bash
npm run dev
```

## Build

Build the desktop application:

```bash
npm run build
```

Platform-specific builds:

```bash
npm run dist:linux
npm run dist:win
npm run dist:mac
```

## API Documentation

For API usage and authentication, visit: https://ntts.fdev.team

You'll need a Bearer token to use the application. Get your token from the NTTS website.

## Keyboard Shortcuts

- **Space**: Play/Pause audio
- **Left Arrow**: Seek backward 5 seconds
- **Right Arrow**: Seek forward 5 seconds

## Troubleshooting

### "Ошибка авторизации" (Authorization Error)
- Check that your Bearer token is correct
- Make sure the token hasn't expired

### "Ошибка сети" (Network Error)
- Check your internet connection
- Verify the API is accessible at https://ntts.fdev.team

### Voices not loading
- Click "Обновить" (Refresh) to clear cache and reload
- Check your token is valid

## Author

Made by AL-S.  
API provided by FDev.

## License

AGPL-3.0. See [LICENSE](./LICENSE).
