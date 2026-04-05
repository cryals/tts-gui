export default {
  translation: {
    // App Header
    header: {
      tokenPlaceholder: "Bearer token",
      refreshButton: "Refresh",
    },

    // Tabs
    tabs: {
      voices: "Voices",
      custom: "Custom Voice",
      synthesis: "Speech Synthesis",
    },

    // Tab Descriptions
    tabDescriptions: {
      voices: "Load available voices, inspect speaker IDs and send any voice straight to the synthesis tab.",
      custom: "Set the speaker name, add a reference audio file and upload it to the NTTS API.",
      synthesis: "Select a speaker, choose audio format and effect, then generate and listen to the result.",
    },

    // Voices Tab
    voicesTab: {
      title: "Voice Library",
      allVoices: "All Voices",
      description: "System voices and your uploaded custom voices.",
      loadButton: "Load voices",
      systemVoices: "System Voices",
      customVoices: "Custom Voices",
      noVoicesYet: "No voices loaded yet.",
      noCustomVoices: "No custom voices yet.",
      sourceLabel: "Source",
      useButton: "Use",
      deleteButton: "Delete",
    },

    // Custom Voice Tab
    customTab: {
      title: "Create Custom Voice",
      description: "Create Voice by Reference",
      speakerNameLabel: "Speaker name",
      speakerNamePlaceholder: "aaron",
      speakerNameHint: "The speaker name will be used as the API identifier for synthesis and deletion.",
      dropAudioHere: "Drop audio here",
      chooseManually: "Or choose a file manually",
      chooseFileButton: "Choose file",
      clearButton: "Clear",
      uploadButton: "Upload voice",
    },

    // Synthesis Tab
    synthesisTab: {
      title: "Speech Synthesis",
      description: "Generate audio from text, listen to it in place and save the result to a file.",
      speakerLabel: "Speaker",
      speakerPlaceholder: "Select a voice",
      formatLabel: "Format",
      effectLabel: "Effect",
      noEffect: "No effect",
      textLabel: "Text",
      textPlaceholder: "Enter text for synthesis",
      loadEffectsButton: "Load effects",
      generateButton: "Generate audio",
      generatedAudio: "Generated Audio",
      downloadButton: "Download",
    },

    // Audio Player
    audioPlayer: {
      generatedAudio: "Generated Audio",
      speed: "Speed:",
      download: "Download",
      loadingError: "Failed to load audio",
    },

    // Update Checker
    updater: {
      updateAvailable: "Update Available!",
      updateReady: "Update Ready!",
      newVersion: "New version",
      availableForInstall: "is available for installation.",
      releaseDate: "Release date:",
      downloading: "Downloading update...",
      updateDownloaded: "Update downloaded and ready to install. The application will be restarted.",
      laterButton: "Later",
      downloadButton: "Download",
      cancelButton: "Cancel",
      installButton: "Install and Restart",
      downloadFailed: "Failed to download update",
    },

    // Footer
    footer: {
      madeBy: "Made by AL-S. API provided by FDev.",
      nttsWebsite: "NTTS Website",
      nttsTelegram: "NTTS Telegram",
      nttsDiscord: "NTTS Discord",
      nttsBoosty: "NTTS Boosty",
      developerBoosty: "Developer Boosty",
    },

    // Notifications
    notifications: {
      enterToken: "Please enter API token.",
      voicesLoaded: "Voices loaded.",
      voicesLoadFailed: "Failed to load voices: {{error}}",
      effectsLoaded: "Effects loaded.",
      effectsLoadFailed: "Failed to load effects: {{error}}",
      audioGenerated: "Audio generated.",
      audioGenerateFailed: "Failed to synthesize speech: {{error}}",
      selectVoiceAndText: "Select a voice and enter text.",
      voiceNameAndFileRequired: "Voice name and audio file are required.",
      voiceAdded: "Voice added.",
      voiceAddFailed: "Failed to create voice: {{error}}",
      voiceDeleted: "Voice deleted.",
      voiceDeleteFailed: "Failed to delete voice: {{error}}",
      confirmDelete: "Delete voice {{name}}?",
      filePickFailed: "Failed to pick file: {{error}}",
      fileSaved: "File saved: {{path}}",
      audioDownloadFailed: "Failed to download audio: {{error}}",
      authError: "Authorization error. Check your token.",
      networkError: "Network error. Check your connection.",
      serverError: "Server error. Try again later.",
    },

    // Error Boundary
    errorBoundary: {
      title: "Interface crashed",
      description: "Below is the renderer error text. No more white screen.",
    },

    // Language Selector
    language: {
      label: "Language",
      en: "English",
      ru: "Русский",
      uk: "Українська",
    },
  },
};
