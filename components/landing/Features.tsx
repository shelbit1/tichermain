import { Bot, Languages, History, LineChart } from "lucide-react"

const FEATURES = [
  {
    icon: Bot,
    title: "ИИ-эссе под твой уровень",
    description: "От A1 до C2. Темы — на твой выбор или случайные из 50+ категорий.",
    accent: "bg-blue-50 text-blue-600",
  },
  {
    icon: Languages,
    title: "Перевод одним нажатием",
    description: "DeepL API переводит любое слово в контексте предложения.",
    accent: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: History,
    title: "История и прогресс",
    description: "Сохранённые эссе и словарь незнакомых слов всегда под рукой.",
    accent: "bg-amber-50 text-amber-600",
  },
  {
    icon: LineChart,
    title: "Отслеживание роста",
    description: "Видишь, сколько слов уже знаешь и как растёт твой словарный запас.",
    accent: "bg-rose-50 text-rose-500",
  },
]

export function Features() {
  return (
    <section id="features" className="border-t border-zinc-200/70 bg-white py-24">
      <div className="mx-auto max-w-5xl px-6">
        <p className="text-center text-xs font-semibold tracking-[0.2em] text-zinc-500 uppercase">Возможности</p>
        <h2 className="mt-3 text-center text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          Всё для комфортного чтения
        </h2>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm/30 transition-colors hover:border-zinc-300"
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${f.accent}`}
              >
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 text-base font-semibold text-zinc-900">{f.title}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-600">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
