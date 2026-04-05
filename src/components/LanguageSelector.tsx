import { useTranslation } from "react-i18next";
import { Chip, Stack } from "@mui/material";

const languages = [
  { code: "en", key: "language.en", flag: "🇬🇧", label: "EN" },
  { code: "ru", key: "language.ru", flag: "🇷🇺", label: "RU" },
  { code: "uk", key: "language.uk", flag: "🇺🇦", label: "UK" },
];

const normalizeLanguage = (language: string) => language.split("-")[0];

export default function LanguageSelector({ compact = false }: { compact?: boolean }) {
  const { i18n, t } = useTranslation();
  const currentLanguage = normalizeLanguage(i18n.resolvedLanguage ?? i18n.language);

  const handleLanguageChange = (langCode: string) => {
    if (langCode === currentLanguage) return;
    void i18n.changeLanguage(langCode);
  };

  if (compact) {
    return (
      <Stack direction="row" spacing={0.5}>
        {languages.map((lang) => (
          <Chip
            key={lang.code}
            label={`${lang.flag} ${lang.label}`}
            onClick={() => handleLanguageChange(lang.code)}
            size="small"
            sx={{
              fontSize: 11,
              height: 24,
              fontWeight: currentLanguage === lang.code ? 700 : 500,
              cursor: "pointer",
              ...(currentLanguage === lang.code
                ? {
                    backgroundColor: "primary.main",
                    color: "primary.contrastText",
                    "&:hover": {
                      backgroundColor: "primary.main",
                    },
                  }
                : {
                    backgroundColor: "transparent",
                    color: "text.secondary",
                    border: "1px solid",
                    borderColor: "divider",
                    "&:hover": {
                      backgroundColor: "action.hover",
                      color: "text.primary",
                    },
                  }),
            }}
          />
        ))}
      </Stack>
    );
  }

  // Full-size version (ToggleButtonGroup) kept for potential larger layouts
  const { ToggleButton, ToggleButtonGroup } = require("@mui/material");
  const { LanguageRounded } = require("@mui/icons-material");

  return (
    <ToggleButtonGroup
      value={currentLanguage}
      exclusive
      onChange={(_event: React.MouseEvent<HTMLElement>, langCode: string | null) => {
        if (!langCode || langCode === currentLanguage) return;
        void i18n.changeLanguage(langCode);
      }}
      size="small"
      aria-label={i18n.t("language.label")}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        overflow: "hidden",
        backgroundColor: "background.paper",
      }}
    >
      {languages.map((lang) => (
        <ToggleButton
          key={lang.code}
          value={lang.code}
          aria-label={i18n.t(lang.key)}
          sx={{
            px: 1,
            minWidth: { xs: 44, sm: 52 },
            gap: 0.5,
            border: 0,
            "&.Mui-selected": {
              bgcolor: "primary.main",
              color: "primary.contrastText",
            },
          }}
        >
          <LanguageRounded sx={{ fontSize: 16, display: { xs: "none", sm: "inline-flex" } }} />
          <span>{lang.flag}</span>
          <span style={{ fontSize: 12, fontWeight: 700 }}>{lang.code.toUpperCase()}</span>
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
