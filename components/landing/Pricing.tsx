import { Check } from "lucide-react"
import { LinkButton } from "@/components/ui/Button"

const PERKS = [
  "Неограниченная генерация эссе",
  "Все уровни сложности (A1–C2)",
  "Перевод слов через DeepL",
  "История и личный словарь",
  "Отслеживание прогресса",
]

export function Pricing() {
  return (
    <section id="pricing" className="border-t border-zinc-200/70 bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <p className="text-center text-xs font-semibold tracking-[0.2em] text-zinc-500 uppercase">Цена</p>
        <h2 className="mt-3 text-center text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl md:text-4xl">
          Простая и честная подписка
        </h2>

        <div className="mt-10 rounded-2xl border-2 border-blue-500/70 bg-white p-6 shadow-sm sm:mt-12 sm:p-10">
          <p className="text-center text-xs font-semibold tracking-[0.2em] text-zinc-600 uppercase">
            Тичер AI Premium
          </p>
          <div className="mt-5 flex items-end justify-center gap-2">
            <span className="text-2xl font-medium text-zinc-700">₽</span>
            <span className="text-5xl font-semibold tracking-tight text-zinc-900 sm:text-6xl">490</span>
          </div>
          <p className="mt-1 text-center text-sm text-zinc-500">в месяц</p>

          <ul className="mt-8 space-y-3.5">
            {PERKS.map((perk) => (
              <li key={perk} className="flex items-start gap-3 text-[15px] text-zinc-800">
                <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
                <span>{perk}</span>
              </li>
            ))}
          </ul>

          <div className="mt-9">
            <LinkButton href="/signup" variant="secondary" className="w-full" size="lg">
              Оформить подписку
            </LinkButton>
          </div>

          <p className="mt-4 text-center text-xs text-zinc-500">
            1 день пробного периода — без списания. 10 действий бесплатно без карты.
          </p>
        </div>
      </div>
    </section>
  )
}
