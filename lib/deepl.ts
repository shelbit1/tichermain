// DeepL Free API: перевод одного слова или фразы EN → RU.
// Ключи free-аккаунта имеют суффикс `:fx`.

const DEEPL_FREE_URL = "https://api-free.deepl.com/v2/translate"
const DEEPL_PRO_URL = "https://api.deepl.com/v2/translate"

function deeplEndpoint() {
  const key = process.env.DEEPL_API_KEY || ""
  return key.endsWith(":fx") ? DEEPL_FREE_URL : DEEPL_PRO_URL
}

export async function translateWord(word: string, targetLang: string = "RU"): Promise<string> {
  const apiKey = process.env.DEEPL_API_KEY
  if (!apiKey) throw new Error("DEEPL_API_KEY is not configured")

  const res = await fetch(deeplEndpoint(), {
    method: "POST",
    headers: {
      Authorization: `DeepL-Auth-Key ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: [word],
      source_lang: "EN",
      target_lang: targetLang,
    }),
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
