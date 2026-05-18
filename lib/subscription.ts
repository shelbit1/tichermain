// Логика доступа к функциям приложения с учётом подписки и триала.

import { prisma } from "@/lib/prisma"
import type { Subscription } from "@prisma/client"

export const FREE_ESSAY_LIMIT = 10
export const TRIAL_DURATION_HOURS = 24
export const SUBSCRIPTION_PRICE_KOPECKS = 49000 // 490 ₽

export type AccessState = {
  isPaid: boolean // активная подписка или триал
  isTrial: boolean
  trialEndsAt: Date | null
  essaysUsed: number
  essaysRemaining: number // только для бесплатного тарифа
  canGenerate: boolean
}

/**
 * Возвращает текущее состояние доступа пользователя.
 * Также авто-проставляет EXPIRED для устаревших триалов/подписок.
 */
export async function getAccessState(userId: string): Promise<AccessState> {
  // В бесплатный лимит входят и сгенерированные эссе, и проверки написанного.
  const [sub, essaysCount, reviewsCount] = await Promise.all([
    prisma.subscription.findUnique({ where: { userId } }),
    prisma.essay.count({ where: { userId } }),
    prisma.writtenEssay.count({ where: { userId } }),
  ])
  const essaysUsed = essaysCount + reviewsCount

  const now = new Date()
  const refreshed = await ensureStatusFresh(sub, now)
  const isPaid = refreshed?.status === "ACTIVE" || refreshed?.status === "TRIAL"
  const isTrial = refreshed?.status === "TRIAL"

  return {
    isPaid,
    isTrial,
    trialEndsAt: refreshed?.trialEndsAt ?? null,
    essaysUsed,
    essaysRemaining: Math.max(0, FREE_ESSAY_LIMIT - essaysUsed),
    canGenerate: isPaid || essaysUsed < FREE_ESSAY_LIMIT,
  }
}

async function ensureStatusFresh(sub: Subscription | null, now: Date) {
  if (!sub) return null
  if ((sub.status === "TRIAL" || sub.status === "ACTIVE") && sub.expiresAt && sub.expiresAt < now) {
    return prisma.subscription.update({
      where: { id: sub.id },
      data: { status: "EXPIRED" },
    })
  }
  return sub
}

/**
 * Создаёт/обновляет подписку в статусе TRIAL на 24 часа.
 * Вызывается после успешной авторизации платежа T-Bank.
 */
export async function startTrial(userId: string, opts?: { tinkoffId?: string; rebillId?: string }) {
  const now = new Date()
  const trialEnds = new Date(now.getTime() + TRIAL_DURATION_HOURS * 60 * 60 * 1000)

  return prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      status: "TRIAL",
      startedAt: now,
      trialEndsAt: trialEnds,
      expiresAt: trialEnds,
      tinkoffId: opts?.tinkoffId,
      rebillId: opts?.rebillId,
    },
    update: {
      status: "TRIAL",
      startedAt: now,
      trialEndsAt: trialEnds,
      expiresAt: trialEnds,
      tinkoffId: opts?.tinkoffId ?? undefined,
      rebillId: opts?.rebillId ?? undefined,
    },
  })
}

/**
 * Активирует месячную подписку (после успешного рекуррентного списания).
 */
export async function activateSubscription(userId: string, opts?: { tinkoffId?: string }) {
  const now = new Date()
  const expires = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  return prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      status: "ACTIVE",
      startedAt: now,
      expiresAt: expires,
      tinkoffId: opts?.tinkoffId,
    },
    update: {
      status: "ACTIVE",
      expiresAt: expires,
      tinkoffId: opts?.tinkoffId ?? undefined,
    },
  })
}
