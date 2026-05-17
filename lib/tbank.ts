// T-Bank (Т-Бизнес) Эквайринг — генерация подписи Token и инициализация платежа.
// Документация: https://www.tbank.ru/kassa/develop/api/

import crypto from "crypto"

const TBANK_INIT_URL = "https://securepay.tinkoff.ru/v2/Init"

export type InitPaymentParams = {
  orderId: string
  amount: number // в копейках
  description?: string
  email?: string
  successUrl?: string
  failUrl?: string
  recurrent?: boolean
  customerKey?: string // обязателен для рекуррентных платежей
}

export type TBankInitResponse = {
  Success: boolean
  ErrorCode: string
  Message?: string
  Details?: string
  PaymentId?: string
  PaymentURL?: string
  Status?: string
}

/**
 * Генерирует SHA-256 Token поверх плоских (string/number/bool) параметров
 * запроса согласно правилам T-Bank: все ключи сортируются, конкатенируется
 * пароль терминала, считается sha256(hex).
 */
export function generateToken(params: Record<string, unknown>, password: string) {
  const flat = Object.entries({ ...params, Password: password }).filter(([, v]) => {
    return v !== undefined && v !== null && typeof v !== "object"
  }) as [string, string | number | boolean][]

  const str = flat
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => String(v))
    .join("")

  return crypto.createHash("sha256").update(str).digest("hex")
}

export async function initPayment(params: InitPaymentParams): Promise<TBankInitResponse> {
  const terminalKey = process.env.TBANK_TERMINAL_KEY
  const password = process.env.TBANK_PASSWORD
  if (!terminalKey || !password) throw new Error("T-Bank credentials are not configured")

  const flatBody: Record<string, string | number | boolean> = {
    TerminalKey: terminalKey,
    Amount: params.amount,
    OrderId: params.orderId,
    Description: params.description ?? "Подписка Тичер AI — 1 месяц",
  }
  if (params.successUrl) flatBody.SuccessURL = params.successUrl
  if (params.failUrl) flatBody.FailURL = params.failUrl
  if (params.recurrent) flatBody.Recurrent = "Y"
  if (params.customerKey) flatBody.CustomerKey = params.customerKey

  const token = generateToken(flatBody, password)

  // DATA и Receipt в Token не участвуют — добавляем отдельно.
  const fullBody: Record<string, unknown> = { ...flatBody, Token: token }
  if (params.email) {
    fullBody.DATA = { Email: params.email }
  }

  const res = await fetch(TBANK_INIT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(fullBody),
  })

  return (await res.json()) as TBankInitResponse
}

/**
 * Проверка подписи входящего webhook от T-Bank.
 * Из тела исключаются: Token, DATA, Receipt; добавляется Password; sha256.
 */
export function verifyWebhookToken(body: Record<string, unknown>, password: string): boolean {
  const incomingToken = body.Token
  if (typeof incomingToken !== "string") return false

  const cleaned: Record<string, unknown> = { ...body }
  delete cleaned.Token
  delete cleaned.DATA
  delete cleaned.Receipt

  const expected = generateToken(cleaned, password)
  return expected === incomingToken
}
