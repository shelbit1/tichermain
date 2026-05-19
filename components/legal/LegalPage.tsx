import type { ReactNode } from "react"
import { Navbar } from "@/components/landing/Navbar"
import { Footer } from "@/components/landing/Footer"

type Props = {
  title: string
  intro?: string
  children: ReactNode
}

// Общий шаблон для /privacy, /terms, /refund. Та же навигация и футер,
// что и на лендинге — единый стиль.
export function LegalPage({ title, intro, children }: Props) {
  return (
    <>
      <Navbar />
      <main className="bg-[#fafaf9]">
        <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
            {title}
          </h1>
          {intro && (
            <p className="mt-3 text-base text-zinc-600 sm:text-lg">{intro}</p>
          )}
          <div className="prose-zinc mt-10 space-y-8 text-[15px] leading-7 text-zinc-700 sm:text-base sm:leading-8">
            {children}
          </div>
        </article>
      </main>
      <Footer />
    </>
  )
}

type SectionProps = {
  title: string
  children: ReactNode
}

export function LegalSection({ title, children }: SectionProps) {
  return (
    <section>
      <h2 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
        {title}
      </h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  )
}
