import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyWebhookToken } from "@/lib/tbank"
import { activateSubscription, startTrial } from "@/lib/subscription"

/**
 * T-Bank Notification webhook.
 * Возможные статусы: CONFIRMED (списано), AUTHORIZED (заморожено), REJECTED, REFUNDED, ...
 * Док: https://www.tbank.ru/kassa/develop/api/notifications/
 */
export async function POST(req: Request) {
  const password = process.env.TBANK_PASSWORD
  if (!password) return NextResponse.json({ error: "config" }, { status: 500 })

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null
  if (!body) return new NextResponse("BAD", { status: 400 })

  if (!verifyWebhookToken(body, password)) {
    console.warn("[webhook] invalid token", body.OrderId)
    return new NextResponse("BAD", { status: 400 })
  }

  const orderId = typeof body.OrderId === "string" ? body.OrderId : null
  const status = typeof body.Status === "string" ? body.Status : null
  const rebillId =
    typeof body.RebillId === "string" || typeof body.RebillId === "number"
      ? String(body.RebillId)
      : null
  const customerKey = typeof body.CustomerKey === "string" ? body.CustomerKey : null

  if (!orderId || !status) return new NextResponse("OK")

  const userId =
    customerKey ||
    (
      await prisma.subscription.findFirst({
        where: { tinkoffId: orderId },
        select: { userId: true },
      })
    )?.userId ||
    null

  if (!userId) {
    console.warn("[webhook] user not found for order", orderId)
    return new NextResponse("OK")
  }

  // Первая авторизация (AUTHORIZED) — деньги заморожены, но триал-период 24 часа,
  // поэтому сразу активируем триал. Реальное списание произойдёт через рекуррент.
  if (status === "AUTHORIZED" || status === "CONFIRMED") {
    const existing = await prisma.subscription.findUnique({ where: { userId } })
    const isFirstPayment = !existing || existing.status === "INACTIVE" || existing.status === "TRIAL"
    if (isFirstPayment) {
      await startTrial(userId, { tinkoffId: orderId, rebillId: rebillId || undefined })
    } else {
      await activateSubscription(userId, { tinkoffId: orderId })
    }
  } else if (status === "REJECTED" || status === "AUTH_FAIL" || status === "REVERSED") {
    await prisma.subscription.update({
      where: { userId },
      data: { status: "EXPIRED" },
    })
  } else if (status === "REFUNDED" || status === "CANCELED") {
    await prisma.subscription.update({
      where: { userId },
      data: { status: "CANCELLED" },
    })
  }

  return new NextResponse("OK")
}
