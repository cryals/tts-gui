export default {
  translation: {
    // App Header
    header: {
      tokenPlaceholder: "Bearer токен",
      refreshButton: "Оновити",
    },

    // Tabs
    tabs: {
      voices: "Голоси",
      custom: "Свій голос",
      synthesis: "Синтез мовлення",
    },

    // Tab Descriptions
    tabDescriptions: {
      voices: "Завантажте доступні голоси, перегляньте ID спікерів та надішліть будь-який голос прямо на вкладку синтезу.",
      custom: "Вкажіть ім'я спікера, додайте референсний аудіофайл та завантажте його в NTTS API.",
      synthesis: "Виберіть спікера, формат аудіо та ефект, потім згенеруйте та прослухайте результат.",
    },

    // Voices Tab
    voicesTab: {
      title: "Бібліотека голосів",
      allVoices: "Всі голоси",
      description: "Системні голоси та ваші завантажені кастомні голоси.",
      loadButton: "Завантажити голоси",
      systemVoices: "Системні голоси",
      customVoices: "Кастомні голоси",
      noVoicesYet: "Голоси ще не завантажені.",
      noCustomVoices: "Поки немає кастомних голосів.",
      sourceLabel: "Джерело",
      useButton: "Вибрати",
      deleteButton: "Видалити",
    },

    // Custom Voice Tab
    customTab: {
      title: "Створити кастомний голос",
      description: "Створення голосу за референсом",
      speakerNameLabel: "Ім'я спікера",
      speakerNamePlaceholder: "aaron",
      speakerNameHint: "Ім'я спікера буде використовуватися як ідентифікатор API для синтезу та видалення.",
      dropAudioHere: "Перетягніть аудіо сюди",
      chooseManually: "Або виберіть файл вручну",
      chooseFileButton: "Вибрати файл",
      clearButton: "Очистити",
      uploadButton: "Завантажити голос",
    },

    // Synthesis Tab
    synthesisTab: {
      title: "Синтез мовлення",
      description: "Згенеруйте аудіо з тексту, прослухайте його на місці та збережіть результат у файл.",
      speakerLabel: "Спікер",
      speakerPlaceholder: "Виберіть голос",
      formatLabel: "Формат",
      effectLabel: "Ефект",
      noEffect: "Без ефекту",
      textLabel: "Текст",
      textPlaceholder: "Введіть текст для синтезу",
      loadEffectsButton: "Завантажити ефекти",
      generateButton: "Згенерувати аудіо",
      generatedAudio: "Згенероване аудіо",
      downloadButton: "Завантажити",
    },

    // Audio Player
    audioPlayer: {
      generatedAudio: "Згенероване аудіо",
      speed: "Швидкість:",
      download: "Завантажити",
      loadingError: "Помилка завантаження аудіо",
    },

    // Update Checker
    updater: {
      updateAvailable: "Доступне оновлення!",
      updateReady: "Оновлення готове!",
      newVersion: "Нова версія",
      availableForInstall: "доступна для встановлення.",
      releaseDate: "Дата релізу:",
      downloading: "Завантаження оновлення...",
      updateDownloaded: "Оновлення завантажено та готове до встановлення. Додаток буде перезапущено.",
      laterButton: "Пізніше",
      downloadButton: "Завантажити",
      cancelButton: "Скасувати",
      installButton: "Встановити та перезапустити",
      downloadFailed: "Не вдалося завантажити оновлення",
    },

    // Footer
    footer: {
      madeBy: "Зроблено AL-S. API надано FDev.",
      nttsWebsite: "NTTS Website",
      nttsTelegram: "NTTS Telegram",
      nttsDiscord: "NTTS Discord",
      nttsBoosty: "NTTS Boosty",
      developerBoosty: "Developer Boosty",
    },

    // Notifications
    notifications: {
      enterToken: "Введіть токен API.",
      voicesLoaded: "Голоси завантажені.",
      voicesLoadFailed: "Не вдалося завантажити голоси: {{error}}",
      effectsLoaded: "Ефекти завантажені.",
      effectsLoadFailed: "Не вдалося завантажити ефекти: {{error}}",
      audioGenerated: "Аудіо згенеровано.",
      audioGenerateFailed: "Не вдалося синтезувати мовлення: {{error}}",
      selectVoiceAndText: "Виберіть голос та введіть текст.",
      voiceNameAndFileRequired: "Потрібні ім'я голосу та аудіофайл.",
      voiceAdded: "Голос додано.",
      voiceAddFailed: "Не вдалося створити голос: {{error}}",
      voiceDeleted: "Голос видалено.",
      voiceDeleteFailed: "Не вдалося видалити голос: {{error}}",
      confirmDelete: "Видалити голос {{name}}?",
      filePickFailed: "Не вдалося вибрати файл: {{error}}",
      fileSaved: "Файл збережено: {{path}}",
      audioDownloadFailed: "Не вдалося завантажити аудіо: {{error}}",
      authError: "Помилка авторизації. Перевірте токен.",
      networkError: "Помилка мережі. Перевірте підключення.",
      serverError: "Помилка сервера. Спробуйте пізніше.",
    },

    // Error Boundary
    errorBoundary: {
      title: "Інтерфейс впав",
      description: "Нижче текст помилки renderer. Білого екрану більше не буде.",
    },

    // Language Selector
    language: {
      label: "Мова",
      en: "English",
      ru: "Русский",
      uk: "Українська",
    },
  },
};
