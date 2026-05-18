// Клиент KIE AI — нативный Anthropic Messages API.
// Док: https://docs.kie.ai/market/claude/claude-sonnet-4-6

const KIE_ENDPOINT = "https://api.kie.ai/claude/v1/messages"

export type GenerateEssayParams = {
  topic: string
  level: string // A1..C2
}

export type GeneratedEssay = {
  title: string
  content: string
}

type AnthropicResponse = {
  role?: string
  type?: string
  stop_reason?: string
  model?: string
  usage?: Record<string, unknown>
  content?: Array<{ type: string; text?: string }>
  error?: { message?: string; type?: string }
}

// Безопасное превью ответа KIE для логов: без ключей, без длинных текстов.
function describeKieResponse(data: AnthropicResponse, label: string) {
  return {
    label,
    model: data.model,
    stop_reason: data.stop_reason,
    usage: data.usage,
    contentBlocks: Array.isArray(data.content)
      ? data.content.map((c) => ({
          type: c?.type,
          textLength: typeof c?.text === "string" ? c.text.length : 0,
        }))
      : null,
  }
}

export async function generateEssay({ topic, level }: GenerateEssayParams): Promise<GeneratedEssay> {
  const apiKey = process.env.KIE_AI_API_KEY
  const model = process.env.KIE_AI_MODEL || "claude-sonnet-4-6"
  if (!apiKey) throw new Error("KIE_AI_API_KEY is not configured")

  const systemPrompt =
    "You are an English teacher creating reading material for language learners. " +
    "Always answer strictly in valid JSON with keys `title` and `content`. " +
    "No markdown, no commentary, no code fences."

  const userPrompt =
    `Write a ${level}-level English essay on: "${topic}".\n` +
    `Length: 200-300 words. Use vocabulary appropriate for ${level} learners.\n` +
    `Split the essay into 3-5 short paragraphs separated by blank lines.\n` +
    `Return JSON: {"title": "...", "content": "..."} (content is the essay text).`

  const res = await fetch(KIE_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      stream: false,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`KIE AI error ${res.status}: ${text}`)
  }

  const data = (await res.json()) as AnthropicResponse

  if (data.error) {
    throw new Error(`KIE AI error: ${data.error.message || data.error.type}`)
  }

  const raw = data.content?.find((c) => c.type === "text")?.text
  if (typeof raw !== "string" || raw.length === 0) {
    console.error("[kie.generate] empty text content", describeKieResponse(data, "generate"))
    throw new Error("KIE AI returned no text content")
  }

  const cleaned = raw
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim()

  try {
    const parsed = JSON.parse(cleaned) as { title?: string; content?: string }
    if (parsed.title && parsed.content) {
      return { title: parsed.title.trim(), content: parsed.content.trim() }
    }
  } catch {
    // fallback ниже
  }

  const firstLine = raw.trim().split("\n")[0] || topic
  return { title: firstLine.slice(0, 80), content: raw.trim() }
}

// ─────────────────────────────────────────────────────────────────────────────
// Проверка эссе пользователя — структурированный JSON-отчёт.
// ─────────────────────────────────────────────────────────────────────────────

export type EssayReviewCorrection = {
  original: string
  corrected: string
  explanation: string
  // тип ошибки для UI-подсветки
  type: "grammar" | "vocabulary" | "spelling" | "style" | "punctuation"
}

export type EssayReviewVocab = {
  original: string
  better: string
  reason: string
}

export type EssayReview = {
  score: number // 0–100
  estimatedLevel: "A1" | "A2" | "B1" | "B2" | "C1" | "C2"
  summary: string // 1–2 предложения общей оценки
  strengths: string[]
  weaknesses: string[]
  corrections: EssayReviewCorrection[]
  vocabularySuggestions: EssayReviewVocab[]
  advice: string // совет на 2–3 предложения
}

export type ReviewEssayParams = {
  topic: string
  userLevel: string
  essay: string
}

const REVIEW_SYSTEM_PROMPT = `You are an expert English teacher and CEFR-certified examiner.
You will receive a short essay written by a learner. Your job is to assess it and produce a strict JSON report.

Rules:
- Reply with VALID JSON only. No markdown, no code fences, no commentary.
- All explanations MUST be written in RUSSIAN.
- All "original", "corrected", and "better" fields stay in English.
- score is an integer 0..100 (0=incoherent, 100=native fluent).
- estimatedLevel is one of A1, A2, B1, B2, C1, C2.
- corrections: list each meaningful error you find. Quote the exact original phrase from the user's essay. Provide the corrected version and a short Russian explanation. Limit to the 10 most important issues. type ∈ {grammar, vocabulary, spelling, style, punctuation}.
- vocabularySuggestions: 3–6 ways to upgrade vocabulary or phrasing (each with original word/phrase from the essay and a stronger alternative + short Russian "reason").
- strengths and weaknesses: 2–4 bullet points each, in Russian.
- advice: 2–3 actionable sentences in Russian.

Response shape:
{
  "score": 78,
  "estimatedLevel": "B1",
  "summary": "...",
  "strengths": ["..."],
  "weaknesses": ["..."],
  "corrections": [{ "original": "...", "corrected": "...", "explanation": "...", "type": "grammar" }],
  "vocabularySuggestions": [{ "original": "...", "better": "...", "reason": "..." }],
  "advice": "..."
}`

export async function reviewEssay({ topic, userLevel, essay }: ReviewEssayParams): Promise<EssayReview> {
  const apiKey = process.env.KIE_AI_API_KEY
  const model = process.env.KIE_AI_MODEL || "claude-sonnet-4-6"
  if (!apiKey) throw new Error("KIE_AI_API_KEY is not configured")

  const userPrompt =
    `Topic the essay was supposed to be about: "${topic}".\n` +
    `Self-declared CEFR level of the author: ${userLevel}.\n\n` +
    `=== ESSAY ===\n${essay.trim()}\n=== END ===\n\n` +
    `Produce the JSON report now.`

  const res = await fetch(KIE_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      stream: false,
      max_tokens: 2048,
      system: REVIEW_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`KIE AI review error ${res.status}: ${text}`)
  }

  const data = (await res.json()) as AnthropicResponse
  if (data.error) {
    throw new Error(`KIE AI review error: ${data.error.message || data.error.type}`)
  }

  const raw = data.content?.find((c) => c.type === "text")?.text
  if (typeof raw !== "string" || raw.length === 0) {
    console.error("[kie.review] empty text content", describeKieResponse(data, "review"))
    throw new Error("KIE AI review returned no text content")
  }

  const cleaned = raw
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim()

  let parsed: Partial<EssayReview>
  try {
    parsed = JSON.parse(cleaned) as Partial<EssayReview>
  } catch (err) {
    console.error("[kie.review] failed to parse JSON", { raw, err })
    throw new Error("Не удалось разобрать ответ ИИ")
  }

  return normalizeReview(parsed)
}

const ALLOWED_TYPES: EssayReviewCorrection["type"][] = [
  "grammar",
  "vocabulary",
  "spelling",
  "style",
  "punctuation",
]
const ALLOWED_LEVELS: EssayReview["estimatedLevel"][] = ["A1", "A2", "B1", "B2", "C1", "C2"]

function normalizeReview(p: Partial<EssayReview>): EssayReview {
  const score = clamp(Math.round(Number(p.score) || 0), 0, 100)
  const estimatedLevel = ALLOWED_LEVELS.includes(p.estimatedLevel as EssayReview["estimatedLevel"])
    ? (p.estimatedLevel as EssayReview["estimatedLevel"])
    : "B1"

  return {
    score,
    estimatedLevel,
    summary: typeof p.summary === "string" ? p.summary : "",
    strengths: toStringArray(p.strengths),
    weaknesses: toStringArray(p.weaknesses),
    corrections: Array.isArray(p.corrections)
      ? p.corrections
          .map((c) => {
            const item = c as Partial<EssayReviewCorrection>
            return {
              original: String(item.original ?? "").slice(0, 500),
              corrected: String(item.corrected ?? "").slice(0, 500),
              explanation: String(item.explanation ?? "").slice(0, 600),
              type: ALLOWED_TYPES.includes(item.type as EssayReviewCorrection["type"])
                ? (item.type as EssayReviewCorrection["type"])
                : "grammar",
            }
          })
          .filter((c) => c.original.length > 0 && c.corrected.length > 0)
          .slice(0, 15)
      : [],
    vocabularySuggestions: Array.isArray(p.vocabularySuggestions)
      ? p.vocabularySuggestions
          .map((v) => {
            const item = v as Partial<EssayReviewVocab>
            return {
              original: String(item.original ?? "").slice(0, 200),
              better: String(item.better ?? "").slice(0, 200),
              reason: String(item.reason ?? "").slice(0, 400),
            }
          })
          .filter((v) => v.original.length > 0 && v.better.length > 0)
          .slice(0, 8)
      : [],
    advice: typeof p.advice === "string" ? p.advice : "",
  }
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((v): v is string => typeof v === "string" && v.trim().length > 0)
    .map((v) => v.slice(0, 300))
    .slice(0, 6)
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}
