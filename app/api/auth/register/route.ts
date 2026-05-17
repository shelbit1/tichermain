import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as
    | { email?: unknown; password?: unknown; name?: unknown }
    | null
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 })

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : ""
  const password = typeof body.password === "string" ? body.password : ""
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 80) : ""

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Введи корректный email" }, { status: 400 })
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Пароль должен быть минимум 6 символов" }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } })
  if (existing) {
    return NextResponse.json({ error: "Пользователь с таким email уже существует" }, { status: 409 })
  }

  const passwordHash = await bcrypt.hash(password, 10)

  await prisma.user.create({
    data: {
      email,
      name: name || null,
      passwordHash,
    },
  })

  return NextResponse.json({ ok: true })
}
