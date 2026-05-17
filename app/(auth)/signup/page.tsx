import Link from "next/link"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { Sparkles } from "lucide-react"
import { auth } from "@/auth"
import { AuthForm } from "@/components/auth/AuthForm"

export default async function SignupPage() {
  const session = await auth()
  if (session?.user) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#fafaf9] px-6 py-12">
      <Link href="/" className="mb-10 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-white">
          <Sparkles className="h-4 w-4" />
        </span>
        <span className="text-lg font-semibold tracking-tight">Тичер AI</span>
      </Link>

      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-center text-2xl font-semibold tracking-tight text-zinc-900">
          Создать аккаунт
        </h1>
        <p className="mt-2 text-center text-sm text-zinc-500">
          Первые 3 эссе — бесплатно, без карты.
        </p>

        <div className="mt-8">
          <Suspense>
            <AuthForm mode="signup" />
          </Suspense>
        </div>

        <p className="mt-6 text-center text-xs leading-5 text-zinc-500">
          Регистрируясь, ты соглашаешься с условиями использования и политикой конфиденциальности.
        </p>
      </div>

      <Link href="/" className="mt-6 text-sm text-zinc-500 hover:text-zinc-900">
        ← На главную
      </Link>
    </div>
  )
}
