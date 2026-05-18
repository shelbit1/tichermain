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
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/dashboard" className="flex flex-shrink-0 items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="text-base font-semibold tracking-tight">Тичер AI</span>
        </Link>

        <div className="flex min-w-0 items-center gap-2 sm:gap-4">
          <SubscriptionBadge access={access} />

          {/* eslint-disable-next-line @next/next/no-img-element */}
          {user.image ? (
            <img
              src={user.image}
              alt={user.name || ""}
              width={32}
              height={32}
              className="h-8 w-8 flex-shrink-0 rounded-full border border-zinc-200"
            />
          ) : (
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-zinc-200 text-xs font-semibold text-zinc-600">
              {(user.name || user.email || "?").slice(0, 1).toUpperCase()}
            </span>
          )}

          <form
            action={async () => {
              "use server"
              await signOut({ redirectTo: "/" })
            }}
          >
            <button
              type="submit"
              className="hidden cursor-pointer text-sm text-zinc-500 hover:text-zinc-900 sm:block"
            >
              Выйти
            </button>
            <button
              type="submit"
              className="cursor-pointer rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 sm:hidden"
              aria-label="Выйти"
            >
              <LogoutIcon />
            </button>
          </form>
        </div>
      </div>
    </header>
  )
}

function SubscriptionBadge({ access }: { access: AccessState }) {
  const baseClass =
    "truncate rounded-full px-2.5 py-1 text-[11px] font-medium sm:px-3 sm:text-xs"

  if (access.isTrial) {
    const hoursLeft =
      access.trialEndsAt &&
      Math.max(0, Math.round((access.trialEndsAt.getTime() - Date.now()) / 3_600_000))
    return (
      <Link
        href="/subscription"
        className={`${baseClass} bg-amber-50 text-amber-800 hover:bg-amber-100`}
      >
        <span className="hidden sm:inline">Триал · осталось </span>
        <span className="sm:hidden">Триал · </span>
        {hoursLeft ?? 24}ч
      </Link>
    )
  }
  if (access.isPaid) {
    return (
      <Link
        href="/subscription"
        className={`${baseClass} bg-emerald-50 text-emerald-700 hover:bg-emerald-100`}
      >
        <span className="hidden sm:inline">Premium активен</span>
        <span className="sm:hidden">Premium</span>
      </Link>
    )
  }
  return (
    <Link
      href="/subscription"
      className={`${baseClass} bg-zinc-100 text-zinc-700 hover:bg-zinc-200`}
    >
      {access.essaysRemaining}/{FREE_ESSAY_LIMIT}
      <span className="hidden sm:inline"> бесплатных</span>
    </Link>
  )
}

function LogoutIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}
