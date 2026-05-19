import { CreditCard } from "lucide-react"
import { cn } from "@/lib/utils"

// Пилюлька «Оплата через T-Pay» с иконкой карты. Без чужих SVG-логотипов —
// узнаваемый текстовый бейдж в фирменном жёлтом Т-Банка.
export function TPayBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-yellow-300/95 px-3 py-1 text-xs font-semibold text-zinc-900",
        className
      )}
    >
      <CreditCard className="h-3.5 w-3.5" />
      Оплата через T-Pay
    </span>
  )
}

// Кликабельная ссылка на tbank.ru — для футера, в едином стиле.
export function TBankLink({ className }: { className?: string }) {
  return (
    <a
      href="https://www.tbank.ru/"
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-yellow-300/95 px-3 py-1 text-xs font-semibold text-zinc-900 transition-colors hover:bg-yellow-300",
        className
      )}
    >
      Т-Банк
    </a>
  )
}
