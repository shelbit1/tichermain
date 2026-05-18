import Link from "next/link"
import { Sparkles } from "lucide-react"
import { LinkButton } from "@/components/ui/Button"

export function Navbar() {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-zinc-200/70 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="flex flex-shrink-0 items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="text-base font-semibold tracking-tight">Тичер AI</span>
        </Link>

        <nav className="hidden gap-8 text-sm text-zinc-600 md:flex">
          <a href="#features" className="hover:text-zinc-900">Возможности</a>
          <a href="#how" className="hover:text-zinc-900">Как работает</a>
          <a href="#pricing" className="hover:text-zinc-900">Цены</a>
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <LinkButton href="/login" variant="ghost" size="sm">Войти</LinkButton>
          </div>
          <LinkButton href="/signup" size="sm">
            <span className="hidden sm:inline">Начать бесплатно</span>
            <span className="sm:hidden">Начать</span>
          </LinkButton>
        </div>
      </div>
    </header>
  )
}
