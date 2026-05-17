"use client"

import Link from "next/link"
import { useState, useTransition } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/Button"

type Mode = "login" | "signup"

type Props = {
  mode: Mode
}

export function AuthForm({ mode }: Props) {
  const router = useRouter()
  const search = useSearchParams()
  const callbackUrl = search.get("callbackUrl") || "/dashboard"

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      if (mode === "signup") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          setError(data?.error || "Не удалось зарегистрироваться")
          return
        }
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (!result || result.error) {
        setError(mode === "login" ? "Неверный email или пароль" : "Не удалось войти")
        return
      }

      // После регистрации отправляем на онбординг, после логина — куда просили (по умолчанию dashboard).
      router.push(mode === "signup" ? "/onboarding" : callbackUrl)
      router.refresh()
    })
  }

  const onGoogle = () => {
    setError(null)
    void signIn("google", { callbackUrl: mode === "signup" ? "/onboarding" : callbackUrl })
  }

  return (
    <div className="w-full">
      <form onSubmit={onSubmit} className="space-y-4">
        {mode === "signup" && (
          <Field
            label="Имя"
            type="text"
            value={name}
            onChange={setName}
            placeholder="Алексей"
            autoComplete="name"
          />
        )}
        <Field
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          autoComplete="email"
          required
        />
        <Field
          label="Пароль"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="Минимум 6 символов"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          required
          minLength={6}
        />

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
        )}

        <Button type="submit" disabled={pending} size="lg" className="w-full">
          {pending
            ? mode === "signup"
              ? "Создаём аккаунт…"
              : "Входим…"
            : mode === "signup"
              ? "Создать аккаунт"
              : "Войти"}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-zinc-200" />
        <span className="text-xs text-zinc-400">или</span>
        <span className="h-px flex-1 bg-zinc-200" />
      </div>

      <button
        type="button"
        onClick={onGoogle}
        className="flex h-12 w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-zinc-300 bg-white px-5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50"
      >
        <GoogleIcon />
        Продолжить с Google
      </button>

      <p className="mt-6 text-center text-sm text-zinc-500">
        {mode === "login" ? (
          <>
            Нет аккаунта?{" "}
            <Link href="/signup" className="font-medium text-zinc-900 hover:underline">
              Зарегистрироваться
            </Link>
          </>
        ) : (
          <>
            Уже есть аккаунт?{" "}
            <Link href="/login" className="font-medium text-zinc-900 hover:underline">
              Войти
            </Link>
          </>
        )}
      </p>
    </div>
  )
}

type FieldProps = {
  label: string
  type: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  minLength?: number
  autoComplete?: string
}

function Field({ label, type, value, onChange, placeholder, required, minLength, autoComplete }: FieldProps) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-zinc-800">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        className="mt-1.5 h-11 w-full rounded-xl border border-zinc-300 bg-white px-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
      />
    </label>
  )
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        d="M21.6 12.227c0-.709-.064-1.39-.182-2.045H12v3.868h5.382a4.6 4.6 0 0 1-1.995 3.018v2.51h3.232c1.89-1.74 2.981-4.305 2.981-7.351Z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.7 0 4.964-.895 6.619-2.422l-3.232-2.51c-.895.6-2.04.955-3.387.955-2.605 0-4.81-1.76-5.595-4.123H3.064v2.59A9.996 9.996 0 0 0 12 22Z"
        fill="#34A853"
      />
      <path
        d="M6.405 13.9a6.003 6.003 0 0 1 0-3.8V7.51H3.064a10.005 10.005 0 0 0 0 8.98l3.341-2.59Z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.977c1.468 0 2.786.505 3.823 1.495l2.867-2.868C16.96 2.99 14.695 2 12 2 8.087 2 4.71 4.243 3.064 7.51l3.341 2.59C7.19 7.737 9.395 5.977 12 5.977Z"
        fill="#EA4335"
      />
    </svg>
  )
}
