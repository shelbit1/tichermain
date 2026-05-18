import Link from "next/link"
import { redirect } from "next/navigation"
import { Plus, BookOpen, Sparkles, PenLine } from "lucide-react"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { INTERESTS, getInterest, type InterestSlug } from "@/lib/interests"
import { getAccessState, FREE_ESSAY_LIMIT } from "@/lib/subscription"
import { LinkButton } from "@/components/ui/Button"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, level: true, interests: true, onboardedAt: true },
  })
  if (!user) redirect("/login")
  if (!user.onboardedAt) redirect("/onboarding")

  const [essays, reviews, access] = await Promise.all([
    prisma.essay.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 9,
      select: { id: true, title: true, level: true, interest: true, createdAt: true },
    }),
    prisma.writtenEssay.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        topic: true,
        score: true,
        estimatedLevel: true,
        wordCount: true,
        createdAt: true,
      },
    }),
    getAccessState(session.user.id),
  ])

  const userInterests = user.interests
    .map((slug) => getInterest(slug as InterestSlug))
    .filter((i): i is NonNullable<typeof i> => Boolean(i))

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-semibold tracking-[0.2em] text-zinc-500 uppercase">
          Уровень {user.level}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
          Привет{user.name ? `, ${user.name.split(" ")[0]}` : ""}!
        </h1>
        <p className="mt-1 text-sm text-zinc-600 sm:text-base">
          {access.isPaid
            ? "Premium активен. Создавай и проверяй эссе без ограничений."
            : `Бесплатных действий осталось: ${access.essaysRemaining} из ${FREE_ESSAY_LIMIT}.`}
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center">
        <LinkButton href="/essay/new" size="lg" className="w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          Новое эссе
        </LinkButton>
        {!access.isPaid && (
          <LinkButton href="/subscription" variant="outline" size="lg" className="w-full sm:w-auto">
            <Sparkles className="h-4 w-4" />
            Получить Premium
          </LinkButton>
        )}
      </div>

      {/* Сетка интересов пользователя — быстрый старт по теме */}
      <section className="mt-10 sm:mt-14">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-zinc-900 sm:text-xl">Твои интересы</h2>
          <Link href="/onboarding" className="text-sm text-zinc-500 hover:text-zinc-900">
            Изменить
          </Link>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {userInterests.length > 0
            ? userInterests.map((interest) => (
                <Link
                  key={interest.slug}
                  href={`/essay/new?interest=${interest.slug}`}
                  className="group rounded-2xl border border-zinc-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-zinc-300"
                >
                  <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${interest.accent}`}>
                    <interest.icon className={`h-4.5 w-4.5 ${interest.iconColor}`} />
                  </span>
                  <h3 className="mt-4 text-[15px] font-semibold text-zinc-900">{interest.label}</h3>
                  <p className="mt-1 text-[13px] leading-5 text-zinc-500">{interest.description}</p>
                </Link>
              ))
            : INTERESTS.slice(0, 4).map((interest) => (
                <Link
                  key={interest.slug}
                  href={`/essay/new?interest=${interest.slug}`}
                  className="rounded-2xl border border-zinc-200 bg-white p-5 hover:border-zinc-300"
                >
                  <h3 className="text-[15px] font-semibold text-zinc-900">{interest.label}</h3>
                  <p className="mt-1 text-[13px] leading-5 text-zinc-500">{interest.description}</p>
                </Link>
              ))}
        </div>
      </section>

      {reviews.length > 0 && (
        <section className="mt-10 sm:mt-14">
          <h2 className="text-lg font-semibold tracking-tight text-zinc-900 sm:text-xl">Мои проверки</h2>
          <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((r) => {
              const tone =
                r.score >= 85
                  ? "text-emerald-600 bg-emerald-50"
                  : r.score >= 70
                    ? "text-blue-600 bg-blue-50"
                    : r.score >= 55
                      ? "text-amber-600 bg-amber-50"
                      : "text-rose-600 bg-rose-50"
              return (
                <li key={r.id}>
                  <Link
                    href={`/review/${r.id}`}
                    className="block h-full rounded-2xl border border-zinc-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-zinc-300"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <PenLine className="h-4 w-4 text-zinc-400" />
                        {r.estimatedLevel && (
                          <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                            {r.estimatedLevel}
                          </span>
                        )}
                      </div>
                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold ${tone}`}
                      >
                        {r.score}
                      </span>
                    </div>
                    <h3 className="mt-3 text-[15px] font-semibold leading-6 text-zinc-900 line-clamp-2">
                      {r.topic}
                    </h3>
                    <p className="mt-2 text-xs text-zinc-500">
                      {r.wordCount} слов ·{" "}
                      {new Date(r.createdAt).toLocaleDateString("ru-RU", {
                        day: "numeric",
                        month: "long",
                      })}
                    </p>
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      <section className="mt-10 sm:mt-14">
        <h2 className="text-lg font-semibold tracking-tight text-zinc-900 sm:text-xl">История эссе</h2>
        {essays.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center">
            <BookOpen className="mx-auto h-8 w-8 text-zinc-400" />
            <p className="mt-3 text-sm text-zinc-600">Пока нет ни одного эссе. Создай первое!</p>
          </div>
        ) : (
          <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {essays.map((essay) => {
              const interest = essay.interest ? getInterest(essay.interest as InterestSlug) : null
              return (
                <li key={essay.id}>
                  <Link
                    href={`/essay/${essay.id}`}
                    className="block h-full rounded-2xl border border-zinc-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-zinc-300"
                  >
                    <div className="flex items-center gap-2">
                      {essay.level && (
                        <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                          {essay.level}
                        </span>
                      )}
                      {interest && (
                        <span className="text-[11px] text-zinc-500">{interest.label}</span>
                      )}
                    </div>
                    <h3 className="mt-3 text-[15px] font-semibold leading-6 text-zinc-900 line-clamp-2">
                      {essay.title}
                    </h3>
                    <p className="mt-2 text-xs text-zinc-500">
                      {new Date(essay.createdAt).toLocaleDateString("ru-RU", {
                        day: "numeric",
                        month: "long",
                      })}
                    </p>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
