import { redirect } from "next/navigation"
import Link from "next/link"
import { Sparkles } from "lucide-react"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { InterestPicker } from "@/components/onboarding/InterestPicker"
import type { InterestSlug } from "@/lib/interests"

export default async function OnboardingPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { interests: true, onboardedAt: true },
  })

  if (user?.onboardedAt) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-[#fafaf9] pb-20">
      <header className="border-b border-zinc-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="text-base font-semibold tracking-tight">Тичер AI</span>
          </Link>
        </div>
      </header>

      <div className="px-4 pt-10 sm:px-6 sm:pt-16">
        <InterestPicker initialInterests={(user?.interests || []) as InterestSlug[]} />
      </div>
    </div>
  )
}
