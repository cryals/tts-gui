# NTTS GUI

Desktop Electron client for the NTTS API.

It provides a simple interface for:

- loading available voices
- creating custom voices from reference audio
- synthesizing speech
- previewing and saving generated audio

![ntts gui](https://cdn.discordapp.com/attachments/1490023521219248178/1490023521429094539/image.png?ex=69d28c0a&is=69d13a8a&hm=817aac0dffa70b961c4b582e8cc6b6b85e65a77133a434292276db2b3ccf3b2d&)

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

## Author

Made by AL-S.  
API provided by FDev.

## License

AGPL-3.0. See [LICENSE](./LICENSE).
