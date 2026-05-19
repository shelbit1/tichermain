import type { Metadata } from "next"
import { LegalPage, LegalSection } from "@/components/legal/LegalPage"
import { LEGAL } from "@/lib/legal"

export const metadata: Metadata = {
  title: "Политика конфиденциальности — Тичер AI",
  description:
    "Какие данные собирает Тичер AI, как они хранятся и обрабатываются, как защищаются платежи.",
}

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Политика конфиденциальности"
      intro="Мы уважаем твою приватность. Этот документ объясняет, какие данные мы собираем и как ими распоряжаемся."
    >
      <LegalSection title="1. Какие данные мы собираем">
        <p>
          При регистрации и использовании сервиса мы получаем и храним:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>email и имя (нужны для входа в аккаунт);</li>
          <li>хэш пароля (мы не храним пароль в открытом виде);</li>
          <li>сгенерированные эссе, написанные тобой эссе и переводы слов;</li>
          <li>служебные данные о подписке: статус, даты начала и окончания.</li>
        </ul>
        <p>
          Данные платёжной карты мы НЕ собираем и НЕ храним. Они передаются
          напрямую в защищённый платёжный шлюз T-Pay (Т-Банк) — мы видим только
          результат списания (успех/отказ) и идентификатор подписки.
        </p>
      </LegalSection>

      <LegalSection title="2. Как мы используем данные">
        <p>
          Данные нужны для предоставления услуги: генерации эссе под твой
          уровень, перевода слов, проверки твоих текстов и управления подпиской.
          Мы не используем твои данные для рекламы и не продаём их третьим лицам.
        </p>
      </LegalSection>

      <LegalSection title="3. Защита данных">
        <p>
          Весь обмен между браузером и сервером проходит по HTTPS (TLS). Данные
          платежа передаются по защищённому каналу T-Pay и не попадают на наш
          сервер. Пароли хранятся в виде криптографического хэша.
        </p>
      </LegalSection>

      <LegalSection title="4. Передача третьим лицам">
        <p>
          Мы передаём данные только тем сервисам, без которых работа невозможна:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>T-Pay (АО «Т-Банк») — для приёма платежей;</li>
          <li>сервисы хостинга и базы данных — для хранения аккаунта и эссе;</li>
          <li>
            ИИ-провайдеры (KIE / Anthropic, DeepL) — для генерации эссе и
            перевода слов; текст эссе передаётся обезличенно.
          </li>
        </ul>
        <p>Иным третьим лицам данные не передаются.</p>
      </LegalSection>

      <LegalSection title="5. Срок хранения и удаление">
        <p>
          Аккаунт и связанные с ним данные хранятся, пока ты пользуешься
          сервисом. Чтобы удалить аккаунт и все связанные данные — напиши на{" "}
          <a className="font-medium text-zinc-900 hover:underline" href={`mailto:${LEGAL.supportEmail}`}>
            {LEGAL.supportEmail}
          </a>
          . Удаление производится в течение 10 рабочих дней.
        </p>
      </LegalSection>

      <LegalSection title="6. Контакт по вопросам персональных данных">
        <p>
          По любым вопросам о персональных данных и о настоящей политике
          обращайся:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            email:{" "}
            <a className="font-medium text-zinc-900 hover:underline" href={`mailto:${LEGAL.supportEmail}`}>
              {LEGAL.supportEmail}
            </a>
          </li>
          <li>
            телефон:{" "}
            <a className="font-medium text-zinc-900 hover:underline" href={`tel:${LEGAL.supportPhoneTel}`}>
              {LEGAL.supportPhone}
            </a>
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="7. Реквизиты">
        <p>
          {LEGAL.legalName}
          <br />
          ИНН: {LEGAL.inn}, ОГРНИП: {LEGAL.ogrnip}
          <br />
          Юридический адрес: {LEGAL.address}
        </p>
      </LegalSection>
    </LegalPage>
  )
}
