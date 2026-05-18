# Тичер AI — Context & Architecture

## Описание проекта

**Тичер AI** — платформа для изучения английского языка через чтение AI-сгенерированных эссе.

### Основной флоу
1. Регистрация через Google → выбор 12 интересов (онбординг)
2. Пользователь выбирает тему / уровень сложности (тема предлагается из его интересов)
3. ИИ генерирует эссе (KIE AI → Claude Sonnet 4.6)
4. Пользователь читает эссе; при клике на любое слово — всплывает перевод через DeepL API
5. Прогресс и история эссе сохраняются в БД

### 12 интересов (выбираются при онбординге, влияют на генерацию)

Пользователь обязан выбрать **минимум 3 из 12** интересов. На их основе формируются темы эссе.

| Slug | Название | Описание |
|---|---|---|
| `technology` | Технологии | ИИ, гаджеты, стартапы |
| `business` | Бизнес | Карьера, деньги, рынки |
| `science` | Наука | Физика, биология, космос |
| `sport` | Спорт | Фитнес, команды, рекорды |
| `travel` | Путешествия | Страны, культуры, маршруты |
| `food` | Еда и кулинария | Рецепты, рестораны, тренды |
| `health` | Здоровье | Медицина, психология, сон |
| `art` | Искусство и кино | Фильмы, музыка, дизайн |
| `history` | История | События, эпохи, личности |
| `ecology` | Экология | Климат, природа, устойчивость |
| `education` | Образование | Учёба, навыки, саморазвитие |
| `society` | Общество | Политика, тренды, этика |

---

## Tech Stack

| Слой | Технология |
|---|---|
| Фреймворк | **Next.js 15** (App Router) |
| Язык | TypeScript |
| Авторизация | **Auth.js v5** (NextAuth) |
| База данных | **Yandex Managed Service for PostgreSQL** |
| ORM | **Prisma** |
| Платёжная система | **T-Bank (Т-Бизнес) Эквайринг** |
| ИИ генерация | **KIE AI** (модель `claude-sonnet-4-6`) |
| Переводы | **DeepL API** |
| Стилизация | **Tailwind CSS** |
| Деплой | Vercel / Yandex Cloud |

---

## База данных — Yandex Managed Service for PostgreSQL

### Подключение

| Параметр | Значение |
|---|---|
| Host | `c-c9qi8rfddhvjdt7kuvln.rw.mdb.yandexcloud.net` |
| Port | `6432` |
| Database | `db1` |
| User | `user1` |
| Cluster ID | `a59m2og9udd4f3a0m7d1` |
| User display name | `managed-postgresql-c9qi8rfddhvjdt7kuvln-user1` |

### Connection String (DATABASE_URL для Prisma)

```
postgresql://user1:Kolpikkolpik1@c-c9qi8rfddhvjdt7kuvln.rw.mdb.yandexcloud.net:6432/db1?sslmode=require
```

> ⚠️ Yandex Cloud требует `sslmode=require`. Обязательно добавить в строку подключения.

### Prisma setup

```bash
npm install prisma @prisma/client
npx prisma init
```

`prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}
```

### Схема БД (Prisma)

```prisma
model User {
  id              String    @id @default(cuid())
  email           String    @unique
  name            String?
  image           String?
  level           String    @default("B1") // A1..C2 — уровень английского
  interests       String[]  @default([])   // slug-и из 12 интересов
  onboardedAt     DateTime?                 // null = онбординг не пройден
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  accounts        Account[]
  sessions        Session[]
  subscription    Subscription?
  essays          Essay[]
  wordHistory     WordTranslation[]
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

model Subscription {
  id            String    @id @default(cuid())
  userId        String    @unique
  status        SubStatus @default(INACTIVE)
  startedAt     DateTime?
  trialEndsAt   DateTime? // конец 1-дневного триала, если статус TRIAL
  expiresAt     DateTime?
  tinkoffId     String?   // orderId из T-Bank
  rebillId      String?   // RebillId для рекуррентных списаний T-Bank
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

enum SubStatus {
  TRIAL      // 1 день бесплатно после оформления
  ACTIVE     // оплаченная подписка
  INACTIVE   // не оформлена
  CANCELLED  // отменена пользователем
  EXPIRED    // истекла / списание не прошло
}

model Essay {
  id        String   @id @default(cuid())
  userId    String
  title     String
  content   String   @db.Text
  topic     String?
  level     String?  // A1, A2, B1, B2, C1, C2
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model WordTranslation {
  id          String   @id @default(cuid())
  userId      String
  word        String
  translation String
  context     String?
  createdAt   DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, word])
}
```

---

## Авторизация — Auth.js v5

### Установка

```bash
npm install next-auth@beta @auth/prisma-adapter
```

### Конфигурация (`auth.ts` в корне проекта)

```ts
import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import Google from "next-auth/providers/google"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.AUTH_SECRET,
  session: { strategy: "database" },
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id
      return session
    },
  },
})
```

`app/api/auth/[...nextauth]/route.ts`:
```ts
import { handlers } from "@/auth"
export const { GET, POST } = handlers
```

`middleware.ts`:
```ts
export { auth as middleware } from "@/auth"

export const config = {
  matcher: ["/dashboard/:path*", "/essay/:path*"],
}
```

---

## KIE AI — Генерация эссе

KIE AI использует **нативный Anthropic Messages API** (а не OpenAI-совместимый).
Используемая модель — **Claude Sonnet 4.6** (документация: <https://docs.kie.ai/market/claude/claude-sonnet-4-6>).

- Эндпоинт: `POST https://api.kie.ai/claude/v1/messages`
- Авторизация: `Authorization: Bearer <KIE_AI_API_KEY>`
- Системный промпт передаётся через поле `system`, а не как `role: system`
- По умолчанию `stream: true` — для нашего сценария ставим `stream: false`
- `max_tokens` обязателен (мы используем 1024)
- Ответ: `{ content: [{ type: "text", text: "..." }], stop_reason, usage, credits_consumed }`
- Стоимость одного эссе ~0.12 кредитов

```ts
// lib/kie.ts (упрощённо)
const res = await fetch("https://api.kie.ai/claude/v1/messages", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.KIE_AI_API_KEY}`,
  },
  body: JSON.stringify({
    model: process.env.KIE_AI_MODEL, // claude-sonnet-4-6
    stream: false,
    max_tokens: 1024,
    stream: false,
    max_tokens: 1024,
    system: "You are an English teacher creating reading material for language learners. Always answer in valid JSON {title, content}.",
    messages: [
      { role: "user", content: `Write a ${level}-level English essay on: "${topic}".` },
    ],
  }),
})
const data = await res.json()
const text = data.content[0].text // → JSON-строка с {title, content}
```

---

## DeepL API — Перевод слов по клику

```ts
// lib/deepl.ts
export async function translateWord(word: string, targetLang = "RU") {
  const res = await fetch("https://api-free.deepl.com/v2/translate", {
    method: "POST",
    headers: {
      "Authorization": `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: [word],
      source_lang: "EN",
      target_lang: targetLang,
    }),
  })
  const data = await res.json()
  return data.translations[0].text as string
}
```

API Route `app/api/translate/route.ts`:
```ts
import { NextRequest, NextResponse } from "next/server"
import { translateWord } from "@/lib/deepl"
import { auth } from "@/auth"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { word } = await req.json()
  const translation = await translateWord(word)
  return NextResponse.json({ translation })
}
```

---

## Платёжная система — T-Bank (Т-Бизнес) Эквайринг

### Параметры

| Параметр | Значение |
|---|---|
| TerminalKey | `1724177976157` |
| Password | `ABj6nkihxHwKsRqn` |
| Taxation | `usn_income` |
| Стоимость подписки | **490 ₽ / месяц** |

### Флоу оплаты
1. Клиент нажимает «Оформить подписку»
2. Backend создаёт `orderId`, вызывает `/v2/Init` T-Bank
3. T-Bank возвращает `PaymentURL` → редирект клиента
4. После оплаты T-Bank шлёт webhook на `/api/payment/webhook`
5. Backend проверяет подпись (SHA-256), обновляет `Subscription` в БД

```ts
// lib/tbank.ts
import crypto from "crypto"

export function generateToken(params: Record<string, unknown>) {
  const withPassword = { ...params, Password: process.env.TBANK_PASSWORD! }
  const str = Object.keys(withPassword)
    .sort()
    .map((k) => String(withPassword[k]))
    .join("")
  return crypto.createHash("sha256").update(str).digest("hex")
}

export async function initPayment(orderId: string, amount = 49000) {
  const body = {
    TerminalKey: process.env.TBANK_TERMINAL_KEY!,
    Amount: amount, // в копейках
    OrderId: orderId,
    Description: "Подписка Тичер AI — 1 месяц",
  }
  const token = generateToken(body)

  const res = await fetch("https://securepay.tinkoff.ru/v2/Init", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, Token: token }),
  })
  return res.json()
}
```

---

## Подписочная модель

| Статус | Возможности |
|---|---|
| Гость (не авторизован) | Лендинг + 1 демо-эссе |
| Авторизован (без подписки) | 10 действий бесплатно — генерация + проверка (forever-free trial без карты) |
| **Триал — 1 день после оформления подписки** | Полный доступ Premium на 24 часа без списания денег |
| **Подписчик Premium — 490 ₽/мес** | Неограниченная генерация, история, сохранённые слова |

### Trial-флоу

1. Пользователь нажимает «Оформить подписку» → попадает на T-Bank.
2. T-Bank сохраняет карту (через `Recurrent=Y`), но **первое списание происходит через 24 часа**.
3. `Subscription.status = TRIAL`, `trialEndsAt = now + 24h`, `expiresAt = trialEndsAt`.
4. По истечении 24 часов:
   - Если карта валидна → автосписание 490₽, статус становится `ACTIVE`, продлевается на 30 дней.
   - Если списание не прошло → статус `EXPIRED`.
5. Пользователь может отменить триал до окончания — карта не списывается.

---

## Переменные окружения (.env.local)

```env
# База данных
DATABASE_URL="postgresql://user1:Kolpikkolpik1@c-c9qi8rfddhvjdt7kuvln.rw.mdb.yandexcloud.net:6432/db1?sslmode=require"

# Auth.js
AUTH_SECRET=SmTXWZveZVBIo2xVDt/mNbxp8mfCVRTd3yAaa7HnSWM=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# KIE AI (Claude Sonnet 4.6)
KIE_AI_API_KEY=ca384ab2dfd8ae1e7caf338d516cfe6e
KIE_AI_MODEL=claude-sonnet-4-6

# DeepL
DEEPL_API_KEY=9173dc5d-da12-4cbf-9f78-3dc493fd5d49:fx

# T-Bank Эквайринг
TBANK_TERMINAL_KEY=1724177976157
TBANK_PASSWORD=ABj6nkihxHwKsRqn
TBANK_TAXATION=usn_income

# Anthropic (прямые вызовы / резерв)
ANTHROPIC_API_KEY=sk-ant-api03-...
```

---

## Структура проекта (Next.js App Router)

```
ticher/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx
│   ├── (app)/
│   │   ├── onboarding/page.tsx     ← выбор 12 интересов + уровень
│   │   ├── dashboard/page.tsx       ← сетка категорий
│   │   ├── essay/
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/page.tsx
│   │   └── subscription/page.tsx
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── essay/route.ts
│   │   ├── translate/route.ts
│   │   ├── onboarding/route.ts
│   │   └── payment/
│   │       ├── init/route.ts
│   │       └── webhook/route.ts
│   ├── layout.tsx
│   └── page.tsx                     ← Лендинг (Тичер AI)
├── components/
│   ├── landing/                     ← Hero, Features, Pricing
│   ├── essay/
│   │   ├── EssayReader.tsx          ← кликабельные слова + тултип DeepL
│   │   └── EssayCard.tsx
│   ├── onboarding/
│   │   └── InterestPicker.tsx
│   └── ui/                          ← Button, Card, и т.д.
├── lib/
│   ├── prisma.ts
│   ├── kie.ts
│   ├── deepl.ts
│   ├── tbank.ts
│   ├── interests.ts                 ← каталог 12 интересов
│   └── subscription.ts              ← проверка доступа (trial/active/free)
├── prisma/
│   └── schema.prisma
├── auth.ts
├── middleware.ts
├── context.md
└── .env.local
```

---

## Команды

```bash
# Установка зависимостей
npm install

# Применить миграции БД
npx prisma migrate dev --name init

# Генерация Prisma Client
npx prisma generate

# Dev-сервер
npm run dev

# Проверить подключение к БД
npx prisma studio
```