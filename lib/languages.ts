// Языки, на которых ИИ генерирует эссе.
// UI всего софта — русский. Разбор/объяснения тоже всегда на русском.
// englishName используется в промпте для KIE, deeplSource — для пословного перевода.

export type LanguageSlug = "english" | "spanish" | "azerbaijani" | "turkish" | "chinese"

export type Language = {
  slug: LanguageSlug
  label: string // UI-надпись по-русски
  englishName: string // подставляем в промпты ИИ
  // Код языка для DeepL `source_lang`. Если null — у DeepL нет поддержки,
  // используем автоопределение.
  deeplSource: string | null
  // Языки без пробелов между словами (китайский). Для них пословный режим
  // в EssayReader разбивает текст не по словам, а по символам.
  charLevelTokenization?: boolean
}

export const LANGUAGES: Language[] = [
  {
    slug: "english",
    label: "Английский",
    englishName: "English",
    deeplSource: "EN",
  },
  {
    slug: "spanish",
    label: "Испанский",
    englishName: "Spanish",
    deeplSource: "ES",
  },
  {
    slug: "azerbaijani",
    label: "Азербайджанский",
    englishName: "Azerbaijani",
    deeplSource: null,
  },
  {
    slug: "turkish",
    label: "Турецкий",
    englishName: "Turkish",
    deeplSource: "TR",
  },
  {
    slug: "chinese",
    label: "Китайский",
    englishName: "Chinese (Simplified)",
    deeplSource: "ZH",
    charLevelTokenization: true,
  },
]

export const DEFAULT_LANGUAGE: LanguageSlug = "english"

const LANGUAGE_SLUGS = LANGUAGES.map((l) => l.slug)

export function isValidLanguageSlug(slug: string): slug is LanguageSlug {
  return (LANGUAGE_SLUGS as string[]).includes(slug)
}

export function getLanguage(slug: string): Language | undefined {
  return LANGUAGES.find((l) => l.slug === slug)
}

export function getLanguageOrDefault(slug: string | null | undefined): Language {
  const found = slug ? getLanguage(slug) : undefined
  return found || (getLanguage(DEFAULT_LANGUAGE) as Language)
}
