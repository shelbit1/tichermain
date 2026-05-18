"use client"

import { useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { INTERESTS, ENGLISH_LEVELS, type EnglishLevel, type InterestSlug } from "@/lib/interests"
import { LANGUAGES, DEFAULT_LANGUAGE, type LanguageSlug } from "@/lib/languages"
import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils"

type Props = {
  defaultLevel: EnglishLevel
  userInterests: InterestSlug[]
}

export function NewEssayForm({ defaultLevel, userInterests }: Props) {
  const router = useRouter()
  const search = useSearchParams()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const initialInterest = (() => {
    const fromQuery = search.get("interest") as InterestSlug | null
    if (fromQuery && userInterests.includes(fromQuery)) return fromQuery
    if (fromQuery && INTERESTS.some((i) => i.slug === fromQuery)) return fromQuery
    return userInterests[0] || INTERESTS[0].slug
  })()

  const [interest, setInterest] = useState<InterestSlug>(initialInterest)
  const [level, setLevel] = useState<EnglishLevel>(defaultLevel)
  const [language, setLanguage] = useState<LanguageSlug>(DEFAULT_LANGUAGE)
  const [topic, setTopic] = useState("")

  const visibleInterests = userInterests.length > 0
    ? INTERESTS.filter((i) => userInterests.includes(i.slug))
    : INTERESTS

  const submit = () => {
    setError(null)
    startTransition(async () => {
      const res = await fetch("/api/essay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interest, level, language, topic: topic.trim() || undefined }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data?.error || "Не удалось сгенерировать. Попробуй ещё раз.")
        return
      }
      router.push(`/essay/${data.id}`)
      router.refresh()
    })
  }

  return (
    <div className="space-y-8">
      <div>
        <label className="text-sm font-semibold text-zinc-900">Тема (необязательно)</label>
        <p className="mt-1 text-sm text-zinc-500">
          Оставь пустым — ИИ выберет случайную тему из выбранной категории.
        </p>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Например: The history of jazz music"
          maxLength={120}
          className="mt-3 h-12 w-full rounded-xl border border-zinc-300 bg-white px-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      <div>
        <label className="text-sm font-semibold text-zinc-900">Категория</label>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {visibleInterests.map((i) => {
            const Icon = i.icon
            const active = interest === i.slug
            return (
              <button
                key={i.slug}
                type="button"
                onClick={() => setInterest(i.slug)}
                className={cn(
                  "cursor-pointer rounded-xl border bg-white p-4 text-left transition-colors",
                  active
                    ? "border-blue-500 ring-2 ring-blue-500/20"
                    : "border-zinc-200 hover:border-zinc-300"
                )}
              >
                <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg", i.accent)}>
                  <Icon className={cn("h-4 w-4", i.iconColor)} />
                </span>
                <p className="mt-3 text-sm font-semibold text-zinc-900">{i.label}</p>
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-zinc-900">Язык эссе</label>
        <p className="mt-1 text-sm text-zinc-500">
          Текст эссе будет на выбранном языке. Перевод слов и разбор — на русском.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.slug}
              type="button"
              onClick={() => setLanguage(lang.slug)}
              className={cn(
                "h-10 cursor-pointer rounded-lg border px-4 text-sm font-medium transition-colors",
                language === lang.slug
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400"
              )}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-zinc-900">Уровень</label>
        <div className="mt-3 flex flex-wrap gap-2">
          {ENGLISH_LEVELS.map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => setLevel(lvl)}
              className={cn(
                "h-10 cursor-pointer rounded-lg border px-5 text-sm font-medium transition-colors",
                level === lvl
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400"
              )}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <Button size="lg" onClick={submit} disabled={pending} className="w-full sm:w-auto">
        {pending ? "Генерирую эссе…" : "Сгенерировать эссе"}
      </Button>

      {pending && (
        <p className="text-center text-sm text-zinc-500 sm:text-left">
          Это займёт 10–20 секунд
        </p>
      )}
    </div>
  )
}
