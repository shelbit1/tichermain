"use client"

import Link from "next/link"
import { useId, useState, useTransition } from "react"
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
  const agreementId = useId()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (mode === "signup" && !agreed) {
      setError("Чтобы продолжить, прими условия использования и политику конфиденциальности.")
      return
    }

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

        {mode === "signup" && (
          <label htmlFor={agreementId} className="flex cursor-pointer items-start gap-3 pt-1">
            <input
              id={agreementId}
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              required
              className="mt-0.5 h-4 w-4 cursor-pointer rounded border-zinc-300 text-blue-600 focus:ring-blue-500/30"
            />
            <span className="text-sm leading-5 text-zinc-600">
              Я принимаю{" "}
              <Link href="/privacy" target="_blank" className="font-medium text-zinc-900 hover:underline">
                Политику конфиденциальности
              </Link>{" "}
              и{" "}
              <Link href="/terms" target="_blank" className="font-medium text-zinc-900 hover:underline">
                Условия использования
              </Link>
              .
            </span>
          </label>
        )}

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
        )}

        <Button
          type="submit"
          disabled={pending || (mode === "signup" && !agreed)}
          size="lg"
          className="w-full"
        >
          {pending
            ? mode === "signup"
              ? "Создаём аккаунт…"
              : "Входим…"
            : mode === "signup"
              ? "Создать аккаунт"
              : "Войти"}
        </Button>
      </form>

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
