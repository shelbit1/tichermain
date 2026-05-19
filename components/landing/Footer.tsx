import Link from "next/link"
import { TBankLink, TPayBadge } from "@/components/legal/TPayBadge"
import { LEGAL } from "@/lib/legal"

export function Footer() {
  return (
    <footer className="border-t border-zinc-200/70 bg-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 sm:py-14 lg:grid-cols-3">
        <div>
          <p className="text-sm font-semibold tracking-tight text-zinc-900">Тичер AI</p>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Изучение иностранных языков через чтение и написание эссе с ИИ.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <TPayBadge />
            <TBankLink />
          </div>
          <p className="mt-3 text-xs text-zinc-500">
            Платежи защищены, средства принимаются через защищённый шлюз T-Pay
            (АО «Т-Банк»). Карта не сохраняется на сервере сервиса.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold tracking-tight text-zinc-900">Документы</p>
          <ul className="mt-3 space-y-2 text-sm text-zinc-600">
            <li>
              <Link href="/terms" className="hover:text-zinc-900">
                Условия использования
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-zinc-900">
                Политика конфиденциальности
              </Link>
            </li>
            <li>
              <Link href="/refund" className="hover:text-zinc-900">
                Условия возврата
              </Link>
            </li>
          </ul>

          <p className="mt-6 text-sm font-semibold tracking-tight text-zinc-900">Сервис</p>
          <ul className="mt-3 space-y-2 text-sm text-zinc-600">
            <li>
              <Link href="/login" className="hover:text-zinc-900">
                Войти
              </Link>
            </li>
            <li>
              <a href="/#pricing" className="hover:text-zinc-900">
                Подписка
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold tracking-tight text-zinc-900">Контакты и реквизиты</p>
          <address className="mt-3 space-y-1 text-sm not-italic text-zinc-600">
            <p>{LEGAL.legalName}</p>
            <p>
              ИНН: {LEGAL.inn} · ОГРНИП: {LEGAL.ogrnip}
            </p>
            <p>Юр. адрес: {LEGAL.address}</p>
            <p className="pt-2">
              Email:{" "}
              <a href={`mailto:${LEGAL.supportEmail}`} className="text-zinc-900 hover:underline">
                {LEGAL.supportEmail}
              </a>
            </p>
            <p>
              Телефон:{" "}
              <a href={`tel:${LEGAL.supportPhoneTel}`} className="text-zinc-900 hover:underline">
                {LEGAL.supportPhone}
              </a>
            </p>
          </address>
        </div>
      </div>

      <div className="border-t border-zinc-200/70">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-zinc-500 sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} {LEGAL.legalName}. Все права защищены.</p>
          <p>Страна производителя услуги: {LEGAL.productCountry}</p>
        </div>
      </div>
    </footer>
  )
}
