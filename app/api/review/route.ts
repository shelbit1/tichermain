import { NextResponse } from "next/server"
import type { Prisma } from "@prisma/client"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { reviewEssay } from "@/lib/kie"
import { getAccessState } from "@/lib/subscription"
import { isValidLevel } from "@/lib/interests"

const MIN_WORDS = 30
const MAX_WORDS = 600

function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const access = await getAccessState(session.user.id)
  if (!access.canGenerate) {
    return NextResponse.json(
      { error: "Лимит бесплатных проверок исчерпан. Оформи подписку." },
      { status: 402 }
    )
  }

  const body = (await req.json().catch(() => null)) as
    | { sourceEssayId?: unknown; topic?: unknown; content?: unknown }
    | null
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 })

  const content = typeof body.content === "string" ? body.content.trim() : ""
  const wordCount = countWords(content)
  if (wordCount < MIN_WORDS) {
    return NextResponse.json(
      { error: `Минимум ${MIN_WORDS} слов. У тебя сейчас ${wordCount}.` },
      { status: 400 }
    )
  }
  if (wordCount > MAX_WORDS) {
    return NextResponse.json(
      { error: `Максимум ${MAX_WORDS} слов. У тебя сейчас ${wordCount}.` },
      { status: 400 }
    )
  }

  const sourceEssayId = typeof body.sourceEssayId === "string" ? body.sourceEssayId : null
  let topic = typeof body.topic === "string" ? body.topic.trim().slice(0, 200) : ""

  // Если указан sourceEssayId — берём тему из него и проверяем доступ.
  if (sourceEssayId) {
    const source = await prisma.essay.findUnique({
      where: { id: sourceEssayId },
      select: { userId: true, topic: true, title: true },
    })
    if (!source || source.userId !== session.user.id) {
      return NextResponse.json({ error: "Source essay not found" }, { status: 404 })
    }
    topic = source.topic || source.title
  }

  if (!topic) {
    return NextResponse.json({ error: "Не указана тема эссе" }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { level: true },
  })
  const userLevel = user && isValidLevel(user.level) ? user.level : "B1"

  try {
    const review = await reviewEssay({ topic, userLevel, essay: content })

    const written = await prisma.writtenEssay.create({
      data: {
        userId: session.user.id,
        sourceEssayId,
        topic,
        content,
        review: review as unknown as Prisma.InputJsonValue,
        score: review.score,
        estimatedLevel: review.estimatedLevel,
        wordCount,
      },
      select: { id: true },
    })

    return NextResponse.json({ id: written.id })
  } catch (err) {
    console.error("[review] failed", err)
    return NextResponse.json({ error: "Не удалось проверить эссе. Попробуй ещё раз." }, { status: 500 })
  }
}
