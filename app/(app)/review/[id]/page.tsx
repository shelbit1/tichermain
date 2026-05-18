import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { ArrowLeft, Plus } from "lucide-react"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import type { EssayReview } from "@/lib/kie"
import { LinkButton } from "@/components/ui/Button"
import { ReviewReport } from "@/components/review/ReviewReport"

export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const written = await prisma.writtenEssay.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      sourceEssayId: true,
      topic: true,
      content: true,
      review: true,
      score: true,
      estimatedLevel: true,
      wordCount: true,
      createdAt: true,
    },
  })

  if (!written || written.userId !== session.user.id) notFound()

  const review = written.review as unknown as EssayReview

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900">
        <ArrowLeft className="h-4 w-4" />
        К списку
      </Link>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-zinc-500 uppercase">Отчёт</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
            Проверка эссе
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {new Date(written.createdAt).toLocaleString("ru-RU")}
          </p>
        </div>
        {written.sourceEssayId && (
          <LinkButton href={`/essay/${written.sourceEssayId}/write`} variant="outline" className="w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            Написать ещё
          </LinkButton>
        )}
      </div>

      <div className="mt-8 sm:mt-10">
        <ReviewReport
          review={review}
          topic={written.topic}
          content={written.content}
          wordCount={written.wordCount}
        />
      </div>
    </div>
  )
}
