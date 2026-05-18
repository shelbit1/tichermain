"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/Button"

const MIN_WORDS = 30
const MAX_WORDS = 600

type Props = {
  sourceEssayId?: string
  topic: string
  // Русское название языка исходного эссе — показываем в placeholder.
  languageLabel: string
}

export function WriteEssayForm({ sourceEssayId, topic, languageLabel }: Props) {
  const router = useRouter()
  const [content, setContent] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const wordCount = useMemo(() => {
    const trimmed = content.trim()
    if (!trimmed) return 0
    // Для китайского считаем по CJK-иероглифам (нет пробелов между словами).
    if (languageLabel === "Китайский") {
      return Array.from(trimmed).filter((ch) => /[\u3400-\u9fff]/.test(ch)).length
    }
    return trimmed.split(/\s+/).filter(Boolean).length
  }, [content, languageLabel])
  const tooShort = wordCount > 0 && wordCount < MIN_WORDS
  const tooLong = wordCount > MAX_WORDS
  const canSubmit = wordCount >= MIN_WORDS && wordCount <= MAX_WORDS && !pending

  const submit = () => {
    setError(null)
    startTransition(async () => {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceEssayId, topic, content: content.trim() }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data?.error || "Не удалось проверить эссе. Попробуй ещё раз.")
        return
      }
      router.push(`/review/${data.id}`)
      router.refresh()
    })
  }

  return (
    <div>
      <div className="rounded-2xl border border-zinc-200 bg-white p-5">
        <p className="text-xs font-semibold tracking-[0.18em] text-zinc-500 uppercase">Тема</p>
        <p className="mt-2 text-base font-medium text-zinc-900">{topic}</p>
      </div>

      <div className="mt-6">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`Напиши эссе на языке: ${languageLabel}. Минимум 30 слов, максимум 600.`}
          rows={14}
          className="w-full rounded-2xl border border-zinc-300 bg-white px-5 py-4 text-[15px] leading-7 text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
        <div className="mt-2 flex items-center justify-between text-xs">
          <span
            className={
              tooShort || tooLong
                ? "text-rose-600"
                : wordCount >= MIN_WORDS
                  ? "text-emerald-600"
                  : "text-zinc-500"
            }
          >
            {wordCount} {languageLabel === "Китайский" ? "иероглифов" : "слов"}
            {tooShort && ` · нужно минимум ${MIN_WORDS}`}
            {tooLong && ` · максимум ${MAX_WORDS}`}
          </span>
          <span className="text-zinc-400">ИИ проверит грамматику, лексику и стиль</span>
        </div>
      </div>

      {error && (
        <p className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Button onClick={submit} disabled={!canSubmit} size="lg" className="w-full sm:w-auto">
          <Sparkles className="h-4 w-4" />
          {pending ? "Проверяю эссе…" : "Проверить с ИИ"}
        </Button>
        {pending && (
          <span className="text-center text-sm text-zinc-500 sm:text-left">
            Это займёт 10–20 секунд
          </span>
        )}
      </div>
    </div>
  )
}
