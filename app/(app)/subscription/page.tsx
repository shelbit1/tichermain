import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowLeft, Check } from "lucide-react"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { getAccessState } from "@/lib/subscription"
import { CheckoutButton } from "@/components/subscription/CheckoutButton"

const PERKS = [
  "Неограниченная генерация эссе",
  "Все уровни сложности (A1–C2)",
  "Перевод слов через DeepL",
  "История и личный словарь",
  "Отслеживание прогресса",
]

export default async function SubscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const [sub, access, params] = await Promise.all([
    prisma.subscription.findUnique({ where: { userId: session.user.id } }),
    getAccessState(session.user.id),
    searchParams,
  ])

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900">
        <ArrowLeft className="h-4 w-4" />
        Назад
      </Link>

      <h1 className="mt-6 text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">Подписка</h1>

      {params.status === "success" && (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-sm font-semibold text-emerald-900">
            Платёж принят. Триал на 24 часа активирован.
          </p>
          <p className="mt-1 text-sm text-emerald-900/80">
            Списание 490 ₽ произойдёт автоматически по окончании триала, если не отменить подписку.
          </p>
        </div>
      )}
      {params.status === "fail" && (
        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-5">
          <p className="text-sm font-semibold text-rose-900">Платёж не прошёл</p>
          <p className="mt-1 text-sm text-rose-900/80">Попробуй ещё раз или используй другую карту.</p>
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-zinc-500 uppercase">Текущий план</p>
            <p className="mt-1 text-xl font-semibold text-zinc-900">
              {access.isTrial
                ? "Premium · триал"
                : access.isPaid
                  ? "Premium активен"
                  : "Free"}
            </p>
            {access.isTrial && access.trialEndsAt && (
              <p className="mt-1 text-sm text-zinc-500">
                Триал до {access.trialEndsAt.toLocaleString("ru-RU")}
              </p>
            )}
            {!access.isPaid && (
              <p className="mt-1 text-sm text-zinc-500">
                Использовано бесплатных эссе: {access.essaysUsed} / 3
              </p>
            )}
            {sub?.status === "ACTIVE" && sub.expiresAt && (
              <p className="mt-1 text-sm text-zinc-500">
                Следующее списание: {sub.expiresAt.toLocaleDateString("ru-RU")}
              </p>
            )}
          </div>
          {access.isPaid && (
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
              Активно
            </span>
          )}
        </div>
      </div>

      <div className="mt-8 rounded-2xl border-2 border-blue-500/70 bg-white p-6 sm:p-8">
        <p className="text-xs font-semibold tracking-[0.2em] text-zinc-600 uppercase">
          Тичер AI Premium
        </p>
        <div className="mt-4 flex items-end gap-2">
          <span className="text-2xl font-medium text-zinc-700">₽</span>
          <span className="text-5xl font-semibold tracking-tight text-zinc-900 sm:text-6xl">490</span>
          <span className="mb-2 text-sm text-zinc-500">/ месяц</span>
        </div>

        <p className="mt-3 inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
          1 день пробного периода — без списания
        </p>

        <ul className="mt-6 space-y-3 text-[15px] text-zinc-800">
          {PERKS.map((p) => (
            <li key={p} className="flex items-start gap-3">
              <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
              <span>{p}</span>
            </li>
          ))}
        </ul>

        {access.isPaid ? (
          <p className="mt-8 text-sm text-zinc-500">
            Подписка уже активна. Чтобы отменить — напиши в поддержку.
          </p>
        ) : (
          <div className="mt-8">
            <CheckoutButton />
            <p className="mt-3 text-center text-xs text-zinc-500">
              Карта привяжется, но первые 24 часа — бесплатно. В любой момент можно отменить.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
