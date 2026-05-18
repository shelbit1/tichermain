"use client"

import { useState } from "react"
import { FileText, Hand } from "lucide-react"

const SENTENCES: { text: string; clickable?: { word: string; translation: string } }[] = [
  {
    text: "Remote work has transformed the modern workplace dramatically.",
    clickable: { word: "Remote", translation: "удалённый" },
  },
  { text: "Millions of employees now enjoy the flexibility to work from anywhere in the world." },
  { text: "This shift has created both opportunities and significant challenges for businesses." },
]

export function EssaySample() {
  const [activeWord, setActiveWord] = useState<string | null>("Remote")

  return (
    <div className="relative rounded-2xl border border-zinc-200 bg-white p-5 text-left shadow-sm sm:p-7">
      <p className="text-[11px] font-semibold tracking-[0.18em] text-zinc-400 uppercase">Пример эссе</p>

      <div className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1">
        <FileText className="h-4 w-4 text-zinc-500" />
        <span className="text-sm text-zinc-500">Тема:</span>
        <span className="text-sm font-semibold text-zinc-900">The Future of Remote Work</span>
        <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
          B2
        </span>
      </div>

      <div className="mt-5 space-y-3 text-[15px] leading-7 text-zinc-800">
        {SENTENCES.map((s, i) => (
          <p key={i}>
            {s.clickable ? (
              <>
                <span className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setActiveWord(activeWord === s.clickable!.word ? null : s.clickable!.word)
                    }
                    className="cursor-pointer rounded bg-blue-100/70 px-0.5 transition-colors hover:bg-blue-200/70"
                  >
                    {s.clickable.word}
                  </button>
                  {activeWord === s.clickable.word && (
                    <span className="absolute -top-9 left-0 z-10 rounded-md bg-blue-600 px-2.5 py-1 text-xs font-medium text-white shadow-md">
                      {s.clickable.translation}
                      <span className="absolute -bottom-1 left-4 h-2 w-2 rotate-45 bg-blue-600" />
                    </span>
                  )}
                </span>
                {s.text.slice(s.clickable.word.length)}
              </>
            ) : (
              s.text
            )}
          </p>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-2 text-xs text-zinc-500">
        <Hand className="h-3.5 w-3.5" />
        Нажми на любое слово, чтобы увидеть перевод (DeepL)
      </div>
    </div>
  )
}
