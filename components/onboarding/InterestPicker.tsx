"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Check } from "lucide-react"
import { INTERESTS, ENGLISH_LEVELS, type EnglishLevel, type InterestSlug } from "@/lib/interests"
import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils"

const MIN_INTERESTS = 3

type Props = {
  initialInterests?: InterestSlug[]
  initialLevel?: EnglishLevel
}

export function InterestPicker({ initialInterests = [], initialLevel = "B1" }: Props) {
  const router = useRouter()
  const [selected, setSelected] = useState<Set<InterestSlug>>(new Set(initialInterests))
  const [level, setLevel] = useState<EnglishLevel>(initialLevel)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const toggle = (slug: InterestSlug) => {
    setError(null)
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(slug)) next.delete(slug)
      else next.add(slug)
      return next
    })
  }

  const submit = () => {
    if (selected.size < MIN_INTERESTS) {
      setError(`Выбери минимум ${MIN_INTERESTS} интереса`)
      return
    }
    startTransition(async () => {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interests: Array.from(selected), level }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data?.error || "Не удалось сохранить. Попробуй ещё раз.")
        return
      }
      router.push("/dashboard")
      router.refresh()
    })
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="text-center">
        <p className="text-xs font-semibold tracking-[0.2em] text-zinc-500 uppercase">Шаг 1 из 1</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          Выбери свои интересы
        </h1>
        <p className="mt-3 text-base text-zinc-600">
          Минимум {MIN_INTERESTS}. ИИ будет генерировать эссе на выбранные тобой темы.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {INTERESTS.map((interest) => {
          const Icon = interest.icon
          const isActive = selected.has(interest.slug)
          return (
            <button
              key={interest.slug}
              type="button"
              onClick={() => toggle(interest.slug)}
              className={cn(
                "group relative cursor-pointer rounded-2xl border bg-white p-5 text-left transition-all",
                isActive
                  ? "border-blue-500 ring-2 ring-blue-500/20"
                  : "border-zinc-200 hover:border-zinc-300"
              )}
            >
              {isActive && (
                <span className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white">
                  <Check className="h-3 w-3" />
                </span>
              )}
              <span className={cn("flex h-9 w-9 items-center justify-center rounded-lg", interest.accent)}>
                <Icon className={cn("h-4.5 w-4.5", interest.iconColor)} />
              </span>
              <h3 className="mt-4 text-[15px] font-semibold text-zinc-900">{interest.label}</h3>
              <p className="mt-1 text-[13px] leading-5 text-zinc-500">{interest.description}</p>
            </button>
          )
        })}
      </div>

      <div className="mt-10 rounded-2xl border border-zinc-200 bg-white p-6">
        <p className="text-sm font-semibold text-zinc-900">Уровень английского</p>
        <p className="mt-1 text-sm text-zinc-500">Эссе будут адаптированы под твой уровень.</p>
        <div className="mt-4 flex flex-wrap gap-2">
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
        <p className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-center text-sm text-red-700">{error}</p>
      )}

      <div className="mt-8 flex items-center justify-between gap-4">
        <p className="text-sm text-zinc-500">
          Выбрано: <span className="font-semibold text-zinc-900">{selected.size}</span> / 12
        </p>
        <Button onClick={submit} disabled={isPending} size="lg">
          {isPending ? "Сохраняем…" : "Перейти в приложение"}
        </Button>
      </div>
    </div>
  )
}
