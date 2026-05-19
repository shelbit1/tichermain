import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { isValidInterestSlug } from "@/lib/interests"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = (await req.json().catch(() => null)) as
    | { interests?: unknown }
    | null
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 })

  const interestsRaw = Array.isArray(body.interests) ? (body.interests as unknown[]) : []
  const interests = interestsRaw
    .filter((i): i is string => typeof i === "string")
    .filter(isValidInterestSlug)
  const uniqueInterests = Array.from(new Set(interests))

  if (uniqueInterests.length < 3) {
    return NextResponse.json({ error: "Выбери минимум 3 интереса" }, { status: 400 })
  }

  // Уровень в онбординге больше не запрашиваем — он выбирается на каждом эссе.
  // В User.level остаётся дефолт схемы ("B1").
  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      interests: uniqueInterests,
      onboardedAt: new Date(),
    },
  })

  return NextResponse.json({ ok: true })
}
