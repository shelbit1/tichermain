import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { getAccessState } from "@/lib/subscription"
import { AppNav } from "@/components/app/AppNav"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, image: true, onboardedAt: true },
  })

  if (!user) redirect("/login")

  const access = await getAccessState(session.user.id)

  return (
    <div className="flex min-h-screen flex-col bg-[#fafaf9]">
      <AppNav user={user} access={access} />
      <main className="flex-1">{children}</main>
    </div>
  )
}
