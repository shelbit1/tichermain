import type { Metadata } from "next"
import { LegalPage, LegalSection } from "@/components/legal/LegalPage"
import { LEGAL } from "@/lib/legal"

export const metadata: Metadata = {
  title: "Условия возврата — Тичер AI",
  description:
    "Как вернуть деньги за подписку Тичер AI: сроки, условия и порядок обращения.",
}

export default function RefundPage() {
  return (
    <LegalPage
      title="Условия возврата"
      intro="Если сервис не подошёл — ты можешь вернуть деньги в течение 14 дней."
    >
      <LegalSection title="1. Срок возврата">
        <p>
          Возврат денежных средств возможен в течение 14 календарных дней с
          момента оплаты подписки.
        </p>
      </LegalSection>

      <LegalSection title="2. Условие возврата">
        <p>
          Возврат осуществляется, если услуга фактически не была использована:
          в аккаунте не было ни одной проверки эссе через ИИ. Если эссе уже
          проверялись, услуга считается оказанной и возврат не производится.
        </p>
      </LegalSection>

      <LegalSection title="3. Как запросить возврат">
        <p>
          Напиши письмо на{" "}
          <a className="font-medium text-zinc-900 hover:underline" href={`mailto:${LEGAL.supportEmail}`}>
            {LEGAL.supportEmail}
          </a>{" "}
          с темой <span className="font-medium text-zinc-900">«Возврат»</span> и
          укажи в письме email аккаунта, на который оформлена подписка.
        </p>
      </LegalSection>

      <LegalSection title="4. Срок обработки">
        <p>
          Мы рассматриваем запрос и возвращаем средства в течение 10 рабочих
          дней с момента получения письма.
        </p>
      </LegalSection>

      <LegalSection title="5. Способ возврата">
        <p>
          Возврат производится на ту же банковскую карту, с которой была
          совершена оплата, через платёжный шлюз {LEGAL.paymentProvider} (Т-Банк).
        </p>
      </LegalSection>

      <LegalSection title="6. Контакты">
        <p>
          По всем вопросам, связанным с возвратом, обращайся:
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
    </LegalPage>
  )
}
