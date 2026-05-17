import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
})

export const metadata: Metadata = {
  title: "Тичер AI — учи английский через чтение эссе",
  description:
    "ИИ генерирует эссе под твой уровень от A1 до C2. Нажимай на любое незнакомое слово — перевод появляется мгновенно.",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#fafaf9] text-zinc-900">{children}</body>
    </html>
  )
}
