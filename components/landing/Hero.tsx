import { Sparkles } from "lucide-react"
import { LinkButton } from "@/components/ui/Button"
import { EssaySample } from "@/components/landing/EssaySample"

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-3xl px-4 pt-12 pb-12 text-center sm:px-6 sm:pt-20 sm:pb-16">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-[13px] font-medium text-blue-700">
          <Sparkles className="h-3.5 w-3.5" />
          ИИ-помощник для английского
        </span>

        <h1 className="mt-6 text-4xl font-semibold leading-[1.1] tracking-tight text-zinc-900 sm:mt-7 sm:text-5xl md:text-6xl">
          Читай. Нажимай.
          <br />
          <span className="text-blue-600">Запоминай английский.</span>
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-zinc-600 sm:mt-6 sm:text-lg">
          ИИ генерирует эссе под твой уровень. Нажимай на любое незнакомое слово — перевод появится мгновенно.
        </p>

        <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:mt-9 sm:flex-row sm:items-center">
          <LinkButton href="/signup" size="lg" variant="secondary" className="sm:min-w-[180px]">
            Начать бесплатно
          </LinkButton>
          <LinkButton href="#how" size="lg" variant="secondary" className="sm:min-w-[180px]">
            Как это работает
          </LinkButton>
        </div>

        <div className="mt-10 sm:mt-14">
          <EssaySample />
        </div>
      </div>
    </section>
  )
}
