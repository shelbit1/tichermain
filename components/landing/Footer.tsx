import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-zinc-200/70 bg-white py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
        <p className="text-sm text-zinc-500">© {new Date().getFullYear()} Тичер AI</p>
        <div className="flex items-center gap-6 text-sm text-zinc-500">
          <Link href="/login" className="hover:text-zinc-900">Войти</Link>
          <a href="#pricing" className="hover:text-zinc-900">Подписка</a>
          <a href="mailto:support@ticher.ai" className="hover:text-zinc-900">Поддержка</a>
        </div>
      </div>
    </footer>
  )
}
