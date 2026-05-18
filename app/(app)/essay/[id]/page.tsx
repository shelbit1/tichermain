import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, PenLine } from "lucide-react"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { EssayReader } from "@/components/essay/EssayReader"
import { LinkButton } from "@/components/ui/Button"
import { getInterest, type InterestSlug } from "@/lib/interests"

export default async function EssayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const essay = await prisma.essay.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      content: true,
      level: true,
      interest: true,
      createdAt: true,
      userId: true,
    },
  })

  if (!essay || essay.userId !== session.user.id) notFound()

  const interest = essay.interest ? getInterest(essay.interest as InterestSlug) : null

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900">
        <ArrowLeft className="h-4 w-4" />
        К списку эссе
      </Link>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {essay.level && (
          <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
            {essay.level}
          </span>
        )}
        {interest && (
          <span className="text-xs text-zinc-500">{interest.label}</span>
        )}
        <span className="text-xs text-zinc-400">
          · {new Date(essay.createdAt).toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}
        </span>
      </div>

      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl md:text-4xl">
        {essay.title}
      </h1>

      <p className="mt-3 text-sm text-zinc-500">
        Нажми на любое слово, чтобы увидеть перевод через DeepL.
      </p>

      <div className="mt-8 sm:mt-10">
        <EssayReader content={essay.content} />
      </div>

      <div className="mt-12 rounded-2xl border border-zinc-200 bg-white p-5 sm:mt-14 sm:p-8">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-md">
            <h2 className="text-base font-semibold tracking-tight text-zinc-900 sm:text-lg">
              А теперь напиши своё эссе на эту тему
            </h2>
            <p className="mt-1 text-sm text-zinc-600">
              ИИ проверит грамматику, лексику и стиль, выставит балл и подскажет, что улучшить.
            </p>
          </div>
          <LinkButton href={`/essay/${essay.id}/write`} size="lg" className="w-full flex-shrink-0 sm:w-auto">
            <PenLine className="h-4 w-4" />
            Написать эссе
          </LinkButton>
        </div>
      </div>
    </div>
  )
}
