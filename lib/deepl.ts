// DeepL Free API: пословный/фразовый перевод исходного языка → RU.
// Ключи free-аккаунта имеют суффикс `:fx`.

const DEEPL_FREE_URL = "https://api-free.deepl.com/v2/translate"
const DEEPL_PRO_URL = "https://api.deepl.com/v2/translate"

function deeplEndpoint() {
  const key = process.env.DEEPL_API_KEY || ""
  return key.endsWith(":fx") ? DEEPL_FREE_URL : DEEPL_PRO_URL
}

export type TranslateWordOptions = {
  // Код DeepL: EN, ES, TR, ZH и т.д. Если null/undefined — DeepL автоопределит
  // (используется для языков без поддержки, например азербайджанский).
  sourceLang?: string | null
  targetLang?: string
}

export async function translateWord(
  word: string,
  options: TranslateWordOptions = {}
): Promise<string> {
  const apiKey = process.env.DEEPL_API_KEY
  if (!apiKey) throw new Error("DEEPL_API_KEY is not configured")

  const targetLang = options.targetLang || "RU"

  const body: Record<string, unknown> = {
    text: [word],
    target_lang: targetLang,
  }
  if (options.sourceLang) body.source_lang = options.sourceLang

  const res = await fetch(deeplEndpoint(), {
    method: "POST",
    headers: {
      Authorization: `DeepL-Auth-Key ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`DeepL error ${res.status}: ${text}`)
  }

  const data = await res.json()
  const translated = data?.translations?.[0]?.text
  if (typeof translated !== "string") {
    throw new Error("DeepL returned unexpected payload")
  }
  return translated
}
