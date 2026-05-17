import {
  CheckCircle2,
  AlertTriangle,
  BookOpenCheck,
  Lightbulb,
  Languages,
  Award,
  Type,
  Quote,
} from "lucide-react"
import type { EssayReview, EssayReviewCorrection } from "@/lib/kie"

type Props = {
  review: EssayReview
  topic: string
  content: string
  wordCount: number
}

export function ReviewReport({ review, topic, content, wordCount }: Props) {
  return (
    <div className="space-y-8">
      <ScoreHeader score={review.score} level={review.estimatedLevel} summary={review.summary} />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Stat label="Слов" value={wordCount.toString()} />
        <Stat label="Уровень по ИИ" value={review.estimatedLevel} />
        <Stat label="Замечаний" value={review.corrections.length.toString()} />
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {review.strengths.length > 0 && (
          <BulletCard
            title="Сильные стороны"
            color="emerald"
            icon={<CheckCircle2 className="h-4 w-4" />}
            items={review.strengths}
          />
        )}
        {review.weaknesses.length > 0 && (
          <BulletCard
            title="Зоны роста"
            color="amber"
            icon={<AlertTriangle className="h-4 w-4" />}
            items={review.weaknesses}
          />
        )}
      </div>

      {review.corrections.length > 0 && <CorrectionsSection items={review.corrections} />}

      {review.vocabularySuggestions.length > 0 && (
        <VocabularySection items={review.vocabularySuggestions} />
      )}

      {review.advice && <AdviceCard advice={review.advice} />}

      <EssayPreview topic={topic} content={content} />
    </div>
  )
}

function ScoreHeader({
  score,
  level,
  summary,
}: {
  score: number
  level: string
  summary: string
}) {
  const tone =
    score >= 85
      ? { ring: "stroke-emerald-500", text: "text-emerald-600", bg: "bg-emerald-50" }
      : score >= 70
        ? { ring: "stroke-blue-500", text: "text-blue-600", bg: "bg-blue-50" }
        : score >= 55
          ? { ring: "stroke-amber-500", text: "text-amber-600", bg: "bg-amber-50" }
          : { ring: "stroke-rose-500", text: "text-rose-600", bg: "bg-rose-50" }

  const radius = 52
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-8">
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
        <div className="relative flex-shrink-0">
          <svg width="140" height="140" viewBox="0 0 120 120" className="-rotate-90">
            <circle cx="60" cy="60" r={radius} className="fill-none stroke-zinc-100" strokeWidth="10" />
            <circle
              cx="60"
              cy="60"
              r={radius}
              className={`fill-none ${tone.ring} transition-[stroke-dashoffset] duration-700`}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-4xl font-semibold ${tone.text}`}>{score}</span>
            <span className="text-xs text-zinc-500">из 100</span>
          </div>
        </div>

        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <span className={`inline-flex items-center gap-1.5 rounded-full ${tone.bg} px-3 py-1 text-xs font-semibold ${tone.text}`}>
              <Award className="h-3.5 w-3.5" />
              Уровень {level}
            </span>
          </div>
          <h2 className="mt-3 text-xl font-semibold tracking-tight text-zinc-900">Оценка эссе</h2>
          {summary && <p className="mt-2 text-[15px] leading-7 text-zinc-700">{summary}</p>}
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5">
      <p className="text-xs font-semibold tracking-[0.18em] text-zinc-500 uppercase">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-zinc-900">{value}</p>
    </div>
  )
}

function BulletCard({
  title,
  items,
  icon,
  color,
}: {
  title: string
  items: string[]
  icon: React.ReactNode
  color: "emerald" | "amber"
}) {
  const colors =
    color === "emerald"
      ? { border: "border-emerald-200", bg: "bg-emerald-50/50", icon: "text-emerald-600", iconBg: "bg-emerald-100" }
      : { border: "border-amber-200", bg: "bg-amber-50/50", icon: "text-amber-600", iconBg: "bg-amber-100" }

  return (
    <div className={`rounded-2xl border ${colors.border} ${colors.bg} p-6`}>
      <div className="flex items-center gap-2">
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${colors.iconBg} ${colors.icon}`}>
          {icon}
        </span>
        <h3 className="text-base font-semibold text-zinc-900">{title}</h3>
      </div>
      <ul className="mt-4 space-y-2 text-[14px] leading-6 text-zinc-800">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2">
            <span className={colors.icon}>•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

const CORRECTION_META: Record<
  EssayReviewCorrection["type"],
  { label: string; bg: string; text: string }
> = {
  grammar: { label: "Грамматика", bg: "bg-rose-50", text: "text-rose-700" },
  vocabulary: { label: "Лексика", bg: "bg-purple-50", text: "text-purple-700" },
  spelling: { label: "Орфография", bg: "bg-orange-50", text: "text-orange-700" },
  style: { label: "Стиль", bg: "bg-sky-50", text: "text-sky-700" },
  punctuation: { label: "Пунктуация", bg: "bg-indigo-50", text: "text-indigo-700" },
}

function CorrectionsSection({ items }: { items: EssayReviewCorrection[] }) {
  return (
    <section>
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700">
          <BookOpenCheck className="h-4 w-4" />
        </span>
        <h3 className="text-lg font-semibold tracking-tight text-zinc-900">Что исправить</h3>
        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
          {items.length}
        </span>
      </div>

      <div className="mt-5 space-y-3">
        {items.map((c, i) => {
          const meta = CORRECTION_META[c.type]
          return (
            <div key={i} className="rounded-2xl border border-zinc-200 bg-white p-5">
              <span className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold ${meta.bg} ${meta.text}`}>
                {meta.label}
              </span>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-rose-50 px-3 py-2">
                  <p className="text-[11px] font-semibold tracking-wide text-rose-700 uppercase">было</p>
                  <p className="mt-1 text-sm text-zinc-900 line-through decoration-rose-400/60">
                    {c.original}
                  </p>
                </div>
                <div className="rounded-lg bg-emerald-50 px-3 py-2">
                  <p className="text-[11px] font-semibold tracking-wide text-emerald-700 uppercase">стало</p>
                  <p className="mt-1 text-sm font-medium text-zinc-900">{c.corrected}</p>
                </div>
              </div>
              {c.explanation && (
                <p className="mt-3 text-sm leading-6 text-zinc-700">{c.explanation}</p>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

function VocabularySection({ items }: { items: EssayReview["vocabularySuggestions"] }) {
  return (
    <section>
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700">
          <Languages className="h-4 w-4" />
        </span>
        <h3 className="text-lg font-semibold tracking-tight text-zinc-900">Прокачай словарь</h3>
      </div>

      <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {items.map((v, i) => (
          <li key={i} className="rounded-2xl border border-zinc-200 bg-white p-5">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="rounded bg-zinc-100 px-2 py-0.5 font-medium text-zinc-700">{v.original}</span>
              <span className="text-zinc-400">→</span>
              <span className="rounded bg-blue-50 px-2 py-0.5 font-semibold text-blue-700">{v.better}</span>
            </div>
            {v.reason && <p className="mt-2 text-sm leading-6 text-zinc-600">{v.reason}</p>}
          </li>
        ))}
      </ul>
    </section>
  )
}

function AdviceCard({ advice }: { advice: string }) {
  return (
    <section className="rounded-2xl border border-blue-200 bg-blue-50/60 p-6">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
          <Lightbulb className="h-4 w-4" />
        </span>
        <h3 className="text-base font-semibold text-zinc-900">Совет от ИИ</h3>
      </div>
      <p className="mt-3 text-[15px] leading-7 text-zinc-800">{advice}</p>
    </section>
  )
}

function EssayPreview({ topic, content }: { topic: string; content: string }) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6">
      <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-zinc-500 uppercase">
        <Quote className="h-3.5 w-3.5" />
        Твой текст
      </div>
      <div className="mt-3 flex items-center gap-2 text-sm text-zinc-600">
        <Type className="h-4 w-4" />
        <span>Тема: {topic}</span>
      </div>
      <p className="mt-4 whitespace-pre-wrap text-[15px] leading-7 text-zinc-800">{content}</p>
    </section>
  )
}
