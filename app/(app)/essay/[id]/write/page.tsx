import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { getAccessState } from "@/lib/subscription"
import { LinkButton } from "@/components/ui/Button"
import { WriteEssayForm } from "@/components/essay/WriteEssayForm"

export default async function WriteEssayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const essay = await prisma.essay.findUnique({
    where: { id },
    select: { id: true, title: true, topic: true, userId: true },
  })
  if (!essay || essay.userId !== session.user.id) notFound()

  const access = await getAccessState(session.user.id)

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <Link
        href={`/essay/${essay.id}`}
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900"
      >
        <ArrowLeft className="h-4 w-4" />К исходному эссе
      </Link>

      <h1 className="mt-6 text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">Напиши своё эссе</h1>
      <p className="mt-2 text-sm text-zinc-600 sm:text-base">
        Напиши эссе на эту же тему на английском. ИИ проверит грамматику, лексику и стиль, выставит оценку 0–100 и подскажет, что улучшить.
      </p>

      {!access.canGenerate ? (
        <div className="mt-10 rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <p className="text-base font-semibold text-amber-900">Лимит бесплатных проверок исчерпан</p>
          <p className="mt-2 text-sm text-amber-900/90">
            Оформи Premium — 1 день триала бесплатно, потом 490 ₽/мес.
          </p>
          <div className="mt-5">
            <LinkButton href="/subscription">Оформить подписку</LinkButton>
          </div>
        </div>
      ) : (
        <div className="mt-10">
          <WriteEssayForm sourceEssayId={essay.id} topic={essay.topic || essay.title} />
        </div>
      )}
    </div>
  )
}
