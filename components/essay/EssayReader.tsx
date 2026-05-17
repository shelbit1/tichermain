"use client"

import { useState, useRef, useEffect } from "react"
import { Loader2 } from "lucide-react"

type Props = {
  content: string
}

type ActiveWord = {
  key: string
  word: string
  translation: string | null
  loading: boolean
  rect: DOMRect
}

const cleanForApi = (raw: string) => raw.replace(/[^A-Za-z'\-]+/g, "")

export function EssayReader({ content }: Props) {
  const [active, setActive] = useState<ActiveWord | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setActive(null)
    const onClickOutside = (e: MouseEvent) => {
      if (!(e.target instanceof Element)) return
      if (!e.target.closest("[data-word-button]") && !e.target.closest("[data-word-tooltip]")) {
        setActive(null)
      }
    }
    window.addEventListener("scroll", onScroll, true)
    document.addEventListener("click", onClickOutside)
    return () => {
      window.removeEventListener("scroll", onScroll, true)
      document.removeEventListener("click", onClickOutside)
    }
  }, [])

  const handleWordClick = async (e: React.MouseEvent<HTMLButtonElement>, raw: string, key: string) => {
    e.stopPropagation()
    const word = cleanForApi(raw)
    if (!word) return

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setActive({ key, word, translation: null, loading: true, rect })

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word }),
      })
      const data = await res.json()
      setActive((prev) =>
        prev && prev.key === key
          ? { ...prev, translation: data.translation || "—", loading: false }
          : prev
      )
    } catch {
      setActive((prev) =>
        prev && prev.key === key
          ? { ...prev, translation: "Ошибка перевода", loading: false }
          : prev
      )
    }
  }

  const paragraphs = content.split(/\n{2,}|\r\n{2,}/).filter((p) => p.trim().length > 0)

  return (
    <div ref={containerRef} className="relative">
      <div className="space-y-5 text-[17px] leading-8 text-zinc-800">
        {paragraphs.map((para, pi) => {
          const tokens = para.split(/(\s+)/)
          return (
            <p key={pi}>
              {tokens.map((tok, ti) => {
                if (/^\s+$/.test(tok)) return <span key={ti}>{tok}</span>
                if (!cleanForApi(tok)) return <span key={ti}>{tok}</span>
                const key = `${pi}-${ti}`
                const isActive = active?.key === key
                return (
                  <button
                    key={ti}
                    type="button"
                    data-word-button
                    onClick={(e) => handleWordClick(e, tok, key)}
                    className={`cursor-pointer rounded px-0.5 transition-colors ${
                      isActive
                        ? "bg-blue-200/70"
                        : "hover:bg-blue-100/60"
                    }`}
                  >
                    {tok}
                  </button>
                )
              })}
            </p>
          )
        })}
      </div>

      {active && <Tooltip data={active} />}
    </div>
  )
}

function Tooltip({ data }: { data: ActiveWord }) {
  const top = data.rect.top + window.scrollY - 44
  const left = data.rect.left + window.scrollX + data.rect.width / 2

  return (
    <div
      data-word-tooltip
      style={{ top, left, transform: "translate(-50%, 0)" }}
      className="pointer-events-none absolute z-30 rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white shadow-lg"
    >
      {data.loading ? (
        <span className="flex items-center gap-1.5">
          <Loader2 className="h-3 w-3 animate-spin" />
          Перевод…
        </span>
      ) : (
        <span>{data.translation}</span>
      )}
      <span className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-zinc-900" />
    </div>
  )
}
