import type { Metadata } from "next"
import { LegalPage, LegalSection } from "@/components/legal/LegalPage"
import { LEGAL } from "@/lib/legal"

export const metadata: Metadata = {
  title: "Условия использования — Тичер AI",
  description:
    "Что такое сервис Тичер AI, какие языки поддерживаются, тариф и условия доступа.",
}

export default function TermsPage() {
  return (
    <LegalPage
      title="Условия использования"
      intro="Используя сервис Тичер AI, ты соглашаешься с условиями ниже."
    >
      <LegalSection title="1. О сервисе">
        <p>
          Тичер AI — онлайн-сервис для изучения иностранных языков через чтение
          и написание эссе. Искусственный интеллект генерирует тексты под твой
          уровень и тематические интересы, переводит незнакомые слова и
          проверяет написанные тобой эссе с подробным разбором.
        </p>
      </LegalSection>

      <LegalSection title="2. Поддерживаемые языки">
        <p>В сервисе доступны эссе и проверка на следующих языках:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>английский</li>
          <li>азербайджанский</li>
          <li>испанский</li>
          <li>китайский</li>
        </ul>
        <p>
          Интерфейс сервиса, переводы слов и разбор эссе — на русском языке.
        </p>
      </LegalSection>

      <LegalSection title="3. Страна производителя услуги">
        <p>
          Сервис производится и оказывается на территории Российской Федерации.
          Поставщик услуги — {LEGAL.legalName} (ИНН: {LEGAL.inn}).
        </p>
      </LegalSection>

      <LegalSection title="4. Тариф и доступ">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Подписка «Тичер AI Premium» — {LEGAL.monthlyPriceRub} ₽ в месяц.
          </li>
          <li>
            После успешной оплаты доступ открывается сразу и действует до конца
            оплаченного периода.
          </li>
          <li>
            Подписка продлевается автоматически каждый месяц через {LEGAL.paymentProvider}, пока ты её не отменишь.
          </li>
          <li>
            Без подписки доступен бесплатный лимит из 10 действий (генерация
            эссе и проверка эссе).
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Где доступен сервис">
        <p>
          Сервис работает онлайн и доступен из любой страны и любого региона
          без ограничений (при наличии интернета).
        </p>
      </LegalSection>

      <LegalSection title="6. Ограничения на экспорт">
        <p>
          Сервис представляет собой цифровую услугу. Ограничений на экспорт
          сервиса нет.
        </p>
      </LegalSection>

      <LegalSection title="7. Возврат и отмена подписки">
        <p>
          Условия возврата описаны на странице{" "}
          <a className="font-medium text-zinc-900 hover:underline" href="/refund">
            Условия возврата
          </a>
          . Отменить подписку или удалить аккаунт можно, написав на{" "}
          <a className="font-medium text-zinc-900 hover:underline" href={`mailto:${LEGAL.supportEmail}`}>
            {LEGAL.supportEmail}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="8. Реквизиты и поддержка">
        <p>
          {LEGAL.legalName}
          <br />
          ИНН: {LEGAL.inn}, ОГРНИП: {LEGAL.ogrnip}
          <br />
          Юридический адрес: {LEGAL.address}
          <br />
          Email:{" "}
          <a className="font-medium text-zinc-900 hover:underline" href={`mailto:${LEGAL.supportEmail}`}>
            {LEGAL.supportEmail}
          </a>
          <br />
          Телефон:{" "}
          <a className="font-medium text-zinc-900 hover:underline" href={`tel:${LEGAL.supportPhoneTel}`}>
            {LEGAL.supportPhone}
          </a>
        </p>
      </LegalSection>
    </LegalPage>
  )
}
