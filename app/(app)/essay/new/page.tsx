import { redirect } from "next/navigation"
import { Suspense } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { getAccessState } from "@/lib/subscription"
import { isValidLevel, type EnglishLevel, type InterestSlug } from "@/lib/interests"
import { NewEssayForm } from "@/components/essay/NewEssayForm"
import { LinkButton } from "@/components/ui/Button"

export default async function NewEssayPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { interests: true, level: true, onboardedAt: true },
  })
  if (!user) redirect("/login")
  if (!user.onboardedAt) redirect("/onboarding")

  const access = await getAccessState(session.user.id)

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900">
        <ArrowLeft className="h-4 w-4" />
        Назад
      </Link>

      <h1 className="mt-6 text-3xl font-semibold tracking-tight text-zinc-900">Новое эссе</h1>
      <p className="mt-2 text-base text-zinc-600">
        ИИ напишет эссе под выбранную тему и уровень. Длина 200–300 слов.
      </p>

      {!access.canGenerate ? (
        <div className="mt-10 rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <p className="text-base font-semibold text-amber-900">
            Лимит бесплатных эссе исчерпан
          </p>
          <p className="mt-2 text-sm text-amber-900/90">
            Оформи Premium — получишь 1 день бесплатного триала, потом 490 ₽/мес.
          </p>
          <div className="mt-5">
            <LinkButton href="/subscription">Оформить подписку</LinkButton>
          </div>
        </div>
      ) : (
        <div className="mt-10">
          <Suspense>
            <NewEssayForm
              defaultLevel={(isValidLevel(user.level) ? user.level : "B1") as EnglishLevel}
              userInterests={user.interests as InterestSlug[]}
            />
          </Suspense>
        </div>
      )}
    </div>
  )
}
