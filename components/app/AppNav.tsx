import Link from "next/link"
import { Sparkles } from "lucide-react"
import { signOut } from "@/auth"
import type { AccessState } from "@/lib/subscription"
import { FREE_ESSAY_LIMIT } from "@/lib/subscription"

type Props = {
  user: { name?: string | null; email?: string | null; image?: string | null }
  access: AccessState
}

export function AppNav({ user, access }: Props) {
  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200/70 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="text-base font-semibold tracking-tight">Тичер AI</span>
        </Link>

        <div className="flex items-center gap-4">
          <SubscriptionBadge access={access} />

          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {user.image ? (
              <img
                src={user.image}
                alt={user.name || ""}
                width={32}
                height={32}
                className="h-8 w-8 rounded-full border border-zinc-200"
              />
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200 text-xs font-semibold text-zinc-600">
                {(user.name || user.email || "?").slice(0, 1).toUpperCase()}
              </span>
            )}
          </div>

          <form
            action={async () => {
              "use server"
              await signOut({ redirectTo: "/" })
            }}
          >
            <button
              type="submit"
              className="cursor-pointer text-sm text-zinc-500 hover:text-zinc-900"
            >
              Выйти
            </button>
          </form>
        </div>
      </div>
    </header>
  )
}

function SubscriptionBadge({ access }: { access: AccessState }) {
  if (access.isTrial) {
    const hoursLeft =
      access.trialEndsAt &&
      Math.max(0, Math.round((access.trialEndsAt.getTime() - Date.now()) / 3_600_000))
    return (
      <Link
        href="/subscription"
        className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800 hover:bg-amber-100"
      >
        Триал · осталось {hoursLeft ?? 24} ч.
      </Link>
    )
  }
  if (access.isPaid) {
    return (
      <Link
        href="/subscription"
        className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
      >
        Premium активен
      </Link>
    )
  }
  return (
    <Link
      href="/subscription"
      className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-200"
    >
      {access.essaysRemaining} / {FREE_ESSAY_LIMIT} бесплатных
    </Link>
  )
}
