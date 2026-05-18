import { INTERESTS } from "@/lib/interests"

export function InterestsPreview() {
  return (
    <section id="how" className="border-t border-zinc-200/70 bg-[#fafaf9] py-16 sm:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <p className="text-center text-xs font-semibold tracking-[0.2em] text-zinc-500 uppercase">
          Как это работает
        </p>
        <h2 className="mt-3 text-center text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl md:text-4xl">
          Выбери интересы — получи эссе по душе
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-sm leading-6 text-zinc-600 sm:text-base sm:leading-7">
          При регистрации ты выберешь из 12 направлений. ИИ будет генерировать темы, которые тебе действительно интересны.
        </p>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:mt-12 sm:gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {INTERESTS.map((interest) => {
            const Icon = interest.icon
            return (
              <div
                key={interest.slug}
                className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm/30 transition-all hover:-translate-y-0.5 hover:border-zinc-300 sm:p-5"
              >
                <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${interest.accent}`}>
                  <Icon className={`h-4.5 w-4.5 ${interest.iconColor}`} />
                </span>
                <h3 className="mt-3 text-[14px] font-semibold text-zinc-900 sm:mt-4 sm:text-[15px]">{interest.label}</h3>
                <p className="mt-1 text-[12px] leading-5 text-zinc-500 sm:text-[13px]">{interest.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
