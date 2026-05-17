import { Sparkles } from "lucide-react"
import { LinkButton } from "@/components/ui/Button"
import { EssaySample } from "@/components/landing/EssaySample"

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-3xl px-6 pt-20 pb-16 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-[13px] font-medium text-blue-700">
          <Sparkles className="h-3.5 w-3.5" />
          ИИ-помощник для английского
        </span>

        <h1 className="mt-7 text-5xl font-semibold leading-[1.1] tracking-tight text-zinc-900 sm:text-6xl">
          Читай. Нажимай.
          <br />
          <span className="text-blue-600">Запоминай английский.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-lg leading-7 text-zinc-600">
          ИИ генерирует эссе под твой уровень. Нажимай на любое незнакомое слово — перевод появится мгновенно.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <LinkButton href="/signup" size="lg" variant="secondary" className="min-w-[180px]">
            Начать бесплатно
          </LinkButton>
          <LinkButton href="#how" size="lg" variant="secondary" className="min-w-[180px]">
            Как это работает
          </LinkButton>
        </div>

        <div className="mt-14">
          <EssaySample />
        </div>
      </div>
    </section>
  )
}
