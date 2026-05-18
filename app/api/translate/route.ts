import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { translateWord } from "@/lib/deepl"
import { getLanguageOrDefault, isValidLanguageSlug } from "@/lib/languages"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = (await req.json().catch(() => null)) as
    | { word?: unknown; context?: unknown; language?: unknown }
    | null
  const word = typeof body?.word === "string" ? body.word.trim() : ""
  if (!word || word.length > 60) {
    return NextResponse.json({ error: "Invalid word" }, { status: 400 })
  }
  const context = typeof body?.context === "string" ? body.context.slice(0, 500) : null

  const language = getLanguageOrDefault(
    typeof body?.language === "string" && isValidLanguageSlug(body.language) ? body.language : null
  )

  // Кэш-ключ зависит и от языка-источника — одно и то же слово в разных языках
  // может переводиться по-разному (например, «no» в EN/ES).
  const cacheKey = `${language.slug}:${word.toLowerCase()}`
  const cached = await prisma.wordTranslation.findFirst({
    where: { userId: session.user.id, word: cacheKey },
    orderBy: { createdAt: "desc" },
  })
  if (cached) {
    return NextResponse.json({ translation: cached.translation, cached: true })
  }

  try {
    const translation = await translateWord(word, { sourceLang: language.deeplSource })
    await prisma.wordTranslation.create({
      data: {
        userId: session.user.id,
        word: cacheKey,
        translation,
        context,
      },
    })
    return NextResponse.json({ translation })
  } catch (err) {
    console.error("[translate] failed", err)
    return NextResponse.json({ error: "Translation failed" }, { status: 500 })
  }
}
