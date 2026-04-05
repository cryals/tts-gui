export default {
  translation: {
    // App Header
    header: {
      tokenPlaceholder: "Bearer токен",
      refreshButton: "Обновить",
    },

    // Tabs
    tabs: {
      voices: "Голоса",
      custom: "Свой голос",
      synthesis: "Синтез речи",
    },

    // Tab Descriptions
    tabDescriptions: {
      voices: "Загрузите доступные голоса, просмотрите ID спикеров и отправьте любой голос прямо на вкладку синтеза.",
      custom: "Укажите имя спикера, добавьте референсный аудиофайл и загрузите его в NTTS API.",
      synthesis: "Выберите спикера, формат аудио и эффект, затем сгенерируйте и прослушайте результат.",
    },

    // Voices Tab
    voicesTab: {
      title: "Библиотека голосов",
      allVoices: "Все голоса",
      description: "Системные голоса и ваши загруженные кастомные голоса.",
      loadButton: "Загрузить голоса",
      systemVoices: "Системные голоса",
      customVoices: "Кастомные голоса",
      noVoicesYet: "Голоса еще не загружены.",
      noCustomVoices: "Пока нет кастомных голосов.",
      sourceLabel: "Источник",
      useButton: "Выбрать",
      deleteButton: "Удалить",
    },

    // Custom Voice Tab
    customTab: {
      title: "Создать кастомный голос",
      description: "Создание голоса по референсу",
      speakerNameLabel: "Имя спикера",
      speakerNamePlaceholder: "aaron",
      speakerNameHint: "Имя спикера будет использоваться как идентификатор API для синтеза и удаления.",
      dropAudioHere: "Перетащите аудио сюда",
      chooseManually: "Или выберите файл вручную",
      chooseFileButton: "Выбрать файл",
      clearButton: "Очистить",
      uploadButton: "Загрузить голос",
    },

    // Synthesis Tab
    synthesisTab: {
      title: "Синтез речи",
      description: "Сгенерируйте аудио из текста, прослушайте его на месте и сохраните результат в файл.",
      speakerLabel: "Спикер",
      speakerPlaceholder: "Выберите голос",
      formatLabel: "Формат",
      effectLabel: "Эффект",
      noEffect: "Без эффекта",
      textLabel: "Текст",
      textPlaceholder: "Введите текст для синтеза",
      loadEffectsButton: "Загрузить эффекты",
      generateButton: "Сгенерировать аудио",
      generatedAudio: "Сгенерированное аудио",
      downloadButton: "Скачать",
    },

    // Audio Player
    audioPlayer: {
      generatedAudio: "Сгенерированное аудио",
      speed: "Скорость:",
      download: "Скачать",
      loadingError: "Ошибка загрузки аудио",
    },

    // Update Checker
    updater: {
      updateAvailable: "Доступно обновление!",
      updateReady: "Обновление готово!",
      newVersion: "Новая версия",
      availableForInstall: "доступна для установки.",
      releaseDate: "Дата релиза:",
      downloading: "Загрузка обновления...",
      updateDownloaded: "Обновление загружено и готово к установке. Приложение будет перезапущено.",
      laterButton: "Позже",
      downloadButton: "Скачать",
      cancelButton: "Отмена",
      installButton: "Установить и перезапустить",
      downloadFailed: "Не удалось скачать обновление",
    },

    // Footer
    footer: {
      madeBy: "Сделано AL-S. API предоставлено FDev.",
      nttsWebsite: "NTTS Website",
      nttsTelegram: "NTTS Telegram",
      nttsDiscord: "NTTS Discord",
      nttsBoosty: "NTTS Boosty",
      developerBoosty: "Developer Boosty",
    },

    // Notifications
    notifications: {
      enterToken: "Введите токен API.",
      voicesLoaded: "Голоса загружены.",
      voicesLoadFailed: "Не удалось загрузить голоса: {{error}}",
      effectsLoaded: "Эффекты загружены.",
      effectsLoadFailed: "Не удалось загрузить эффекты: {{error}}",
      audioGenerated: "Аудио сгенерировано.",
      audioGenerateFailed: "Не удалось синтезировать речь: {{error}}",
      selectVoiceAndText: "Выберите голос и введите текст.",
      voiceNameAndFileRequired: "Нужны имя голоса и аудиофайл.",
      voiceAdded: "Голос добавлен.",
      voiceAddFailed: "Не удалось создать голос: {{error}}",
      voiceDeleted: "Голос удален.",
      voiceDeleteFailed: "Не удалось удалить голос: {{error}}",
      confirmDelete: "Удалить голос {{name}}?",
      filePickFailed: "Не удалось выбрать файл: {{error}}",
      fileSaved: "Файл сохранен: {{path}}",
      audioDownloadFailed: "Не удалось скачать аудио: {{error}}",
      authError: "Ошибка авторизации. Проверьте токен.",
      networkError: "Ошибка сети. Проверьте подключение.",
      serverError: "Ошибка сервера. Попробуйте позже.",
    },

    // Error Boundary
    errorBoundary: {
      title: "Интерфейс упал",
      description: "Ниже текст ошибки renderer. Белого экрана больше не будет.",
    },

    // Language Selector
    language: {
      label: "Язык",
      en: "English",
      ru: "Русский",
      uk: "Українська",
    },
  },
};
