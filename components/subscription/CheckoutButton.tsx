"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/Button"

type Props = {
  label?: string
}

export function CheckoutButton({ label = "Оформить подписку" }: Props) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const onClick = () => {
    setError(null)
    startTransition(async () => {
      const res = await fetch("/api/payment/init", { method: "POST" })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.paymentUrl) {
        setError(data?.error || "Не удалось перейти к оплате")
        return
      }
      window.location.href = data.paymentUrl
    })
  }

  return (
    <div className="w-full">
      <Button onClick={onClick} disabled={pending} size="lg" className="w-full">
        {pending ? "Создаём платёж…" : label}
      </Button>
      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
      )}
    </div>
  )
}
