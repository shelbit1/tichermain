import { Navbar } from "@/components/landing/Navbar"
import { Hero } from "@/components/landing/Hero"
import { Features } from "@/components/landing/Features"
import { InterestsPreview } from "@/components/landing/InterestsPreview"
import { Pricing } from "@/components/landing/Pricing"
import { Footer } from "@/components/landing/Footer"

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex flex-col">
        <Hero />
        <Features />
        <InterestsPreview />
        <Pricing />
      </main>
      <Footer />
    </>
  )
}
