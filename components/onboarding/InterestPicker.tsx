"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Check } from "lucide-react"
import { INTERESTS, type InterestSlug } from "@/lib/interests"
import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils"

const MIN_INTERESTS = 3

type Props = {
  initialInterests?: InterestSlug[]
}

export function InterestPicker({ initialInterests = [] }: Props) {
  const router = useRouter()
  const [selected, setSelected] = useState<Set<InterestSlug>>(new Set(initialInterests))
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
        body: JSON.stringify({ interests: Array.from(selected) }),
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
    <div className="mx-auto w-full max-w-4xl pb-32 sm:pb-0">
      <div className="text-center">
        <p className="text-xs font-semibold tracking-[0.2em] text-zinc-500 uppercase">Шаг 1 из 1</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl md:text-4xl">
          Выбери свои интересы
        </h1>
        <p className="mt-3 text-sm text-zinc-600 sm:text-base">
          Минимум {MIN_INTERESTS}. ИИ будет генерировать эссе на выбранные тобой темы.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:grid-cols-3 lg:grid-cols-4">
        {INTERESTS.map((interest) => {
          const Icon = interest.icon
          const isActive = selected.has(interest.slug)
          return (
            <button
              key={interest.slug}
              type="button"
              onClick={() => toggle(interest.slug)}
              className={cn(
                "group relative cursor-pointer rounded-2xl border bg-white p-4 text-left transition-all sm:p-5",
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
              <h3 className="mt-3 text-[14px] font-semibold text-zinc-900 sm:mt-4 sm:text-[15px]">{interest.label}</h3>
              <p className="mt-1 text-[12px] leading-5 text-zinc-500 sm:text-[13px]">{interest.description}</p>
            </button>
          )
        })}
      </div>

      {error && (
        <p className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-center text-sm text-red-700">{error}</p>
      )}

      {/* Десктоп: статичная кнопка снизу. */}
      <div className="mt-8 hidden items-center justify-between gap-4 sm:flex">
        <p className="text-sm text-zinc-500">
          Выбрано: <span className="font-semibold text-zinc-900">{selected.size}</span> / 12
        </p>
        <Button onClick={submit} disabled={isPending} size="lg">
          {isPending ? "Сохраняем…" : "Перейти в приложение"}
        </Button>
      </div>

      {/* Мобила: фиксированная панель снизу с CTA, чтобы не скроллить вниз. */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur sm:hidden">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-zinc-500">
            Выбрано: <span className="font-semibold text-zinc-900">{selected.size}</span> / 12
          </p>
          <Button onClick={submit} disabled={isPending} size="md">
            {isPending ? "Сохраняем…" : "Продолжить"}
          </Button>
        </div>
      </div>
    </div>
  )
}
