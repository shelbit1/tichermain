import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { generateEssay } from "@/lib/kie"
import { getAccessState } from "@/lib/subscription"
import { INTERESTS, getInterest, isValidInterestSlug, isValidLevel } from "@/lib/interests"

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const access = await getAccessState(session.user.id)
  if (!access.canGenerate) {
    return NextResponse.json(
      { error: "Лимит бесплатных эссе исчерпан. Оформи подписку." },
      { status: 402 }
    )
  }

  const body = (await req.json().catch(() => null)) as
    | { interest?: unknown; topic?: unknown; level?: unknown }
    | null
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { interests: true, level: true },
  })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const requestedLevel = typeof body.level === "string" ? body.level : ""
  const level = isValidLevel(requestedLevel)
    ? requestedLevel
    : isValidLevel(user.level)
      ? user.level
      : "B1"

  const explicitTopic = typeof body.topic === "string" ? body.topic.trim() : ""
  const requestedInterest =
    typeof body.interest === "string" && isValidInterestSlug(body.interest) ? body.interest : null

  // Подбираем тему: явная > подсказка из выбранного интереса > случайный интерес пользователя.
  let interestSlug = requestedInterest
  let topic = explicitTopic

  if (!topic) {
    if (!interestSlug) {
      const validUserInterests = user.interests.filter(isValidInterestSlug)
      interestSlug =
        validUserInterests.length > 0 ? pickRandom(validUserInterests) : pickRandom(INTERESTS).slug
    }
    const interest = getInterest(interestSlug)
    topic = interest ? pickRandom(interest.topics) : "Modern technology"
  }

  try {
    const { title, content } = await generateEssay({ topic, level })
    const essay = await prisma.essay.create({
      data: {
        userId: session.user.id,
        title,
        content,
        topic,
        interest: interestSlug,
        level,
      },
      select: { id: true },
    })
    return NextResponse.json({ id: essay.id })
  } catch (err) {
    console.error("[essay] generation failed", err)
    return NextResponse.json(
      { error: "Не удалось сгенерировать эссе. Попробуй ещё раз." },
      { status: 500 }
    )
  }
}
