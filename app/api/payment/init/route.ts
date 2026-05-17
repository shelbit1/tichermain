import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { initPayment } from "@/lib/tbank"
import { SUBSCRIPTION_PRICE_KOPECKS } from "@/lib/subscription"

export async function POST() {
  const session = await auth()
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const orderId = `ticher-${session.user.id}-${Date.now()}`

  try {
    const result = await initPayment({
      orderId,
      amount: SUBSCRIPTION_PRICE_KOPECKS,
      description: "Тичер AI Premium — 1 день триал, далее 490 ₽/мес",
      email: session.user.email,
      recurrent: true,
      customerKey: session.user.id,
      successUrl: `${appUrl}/subscription?status=success&orderId=${orderId}`,
      failUrl: `${appUrl}/subscription?status=fail`,
    })

    if (!result.Success || !result.PaymentURL) {
      console.error("[payment/init] T-Bank rejected", result)
      return NextResponse.json(
        { error: result.Message || "Не удалось создать платёж" },
        { status: 502 }
      )
    }

    // Помечаем подписку как ожидающую подтверждения (statuses обновит webhook).
    await prisma.subscription.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        status: "INACTIVE",
        tinkoffId: orderId,
      },
      update: { tinkoffId: orderId },
    })

    return NextResponse.json({ paymentUrl: result.PaymentURL })
  } catch (err) {
    console.error("[payment/init] failed", err)
    return NextResponse.json({ error: "Не удалось создать платёж" }, { status: 500 })
  }
}
