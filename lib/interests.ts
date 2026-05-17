// Каталог 12 интересов для онбординга и генерации эссе.
// Slug — стабильный идентификатор (сохраняется в БД), label — UI-надпись.

import {
  Laptop,
  Briefcase,
  FlaskConical,
  Trophy,
  Plane,
  ChefHat,
  HeartPulse,
  Palette,
  Landmark,
  Leaf,
  GraduationCap,
  Users,
  type LucideIcon,
} from "lucide-react"

export type InterestSlug =
  | "technology"
  | "business"
  | "science"
  | "sport"
  | "travel"
  | "food"
  | "health"
  | "art"
  | "history"
  | "ecology"
  | "education"
  | "society"

export type Interest = {
  slug: InterestSlug
  label: string
  description: string
  icon: LucideIcon
  accent: string // tailwind-классы фона иконки
  iconColor: string
  topics: string[] // подсказки тем для KIE AI
}

export const INTERESTS: Interest[] = [
  {
    slug: "technology",
    label: "Технологии",
    description: "ИИ, гаджеты, стартапы",
    icon: Laptop,
    accent: "bg-indigo-50",
    iconColor: "text-indigo-600",
    topics: ["Artificial intelligence", "Smartphones", "Startups", "Open-source software"],
  },
  {
    slug: "business",
    label: "Бизнес",
    description: "Карьера, деньги, рынки",
    icon: Briefcase,
    accent: "bg-emerald-50",
    iconColor: "text-emerald-600",
    topics: ["Personal finance", "Career growth", "Stock markets", "Entrepreneurship"],
  },
  {
    slug: "science",
    label: "Наука",
    description: "Физика, биология, космос",
    icon: FlaskConical,
    accent: "bg-violet-50",
    iconColor: "text-violet-600",
    topics: ["Space exploration", "Genetics", "Quantum physics", "Climate science"],
  },
  {
    slug: "sport",
    label: "Спорт",
    description: "Фитнес, команды, рекорды",
    icon: Trophy,
    accent: "bg-amber-50",
    iconColor: "text-amber-600",
    topics: ["Olympic records", "Football tactics", "Strength training", "Marathon running"],
  },
  {
    slug: "travel",
    label: "Путешествия",
    description: "Страны, культуры, маршруты",
    icon: Plane,
    accent: "bg-emerald-50",
    iconColor: "text-emerald-600",
    topics: ["Japan culture", "Backpacking Europe", "Hidden beaches", "Road trips"],
  },
  {
    slug: "food",
    label: "Еда и кулинария",
    description: "Рецепты, рестораны, тренды",
    icon: ChefHat,
    accent: "bg-rose-50",
    iconColor: "text-rose-500",
    topics: ["Mediterranean diet", "Coffee culture", "Street food", "Fermentation"],
  },
  {
    slug: "health",
    label: "Здоровье",
    description: "Медицина, психология, сон",
    icon: HeartPulse,
    accent: "bg-pink-50",
    iconColor: "text-pink-600",
    topics: ["Sleep science", "Mindfulness", "Nutrition myths", "Mental health"],
  },
  {
    slug: "art",
    label: "Искусство и кино",
    description: "Фильмы, музыка, дизайн",
    icon: Palette,
    accent: "bg-orange-50",
    iconColor: "text-orange-600",
    topics: ["Modern cinema", "Jazz history", "Graphic design", "Museum culture"],
  },
  {
    slug: "history",
    label: "История",
    description: "События, эпохи, личности",
    icon: Landmark,
    accent: "bg-stone-100",
    iconColor: "text-stone-700",
    topics: ["Ancient Rome", "World War II", "Industrial revolution", "Cold war"],
  },
  {
    slug: "ecology",
    label: "Экология",
    description: "Климат, природа, устойчивость",
    icon: Leaf,
    accent: "bg-lime-50",
    iconColor: "text-lime-600",
    topics: ["Renewable energy", "Plastic pollution", "Rainforests", "Sustainable cities"],
  },
  {
    slug: "education",
    label: "Образование",
    description: "Учёба, навыки, саморазвитие",
    icon: GraduationCap,
    accent: "bg-sky-50",
    iconColor: "text-sky-600",
    topics: ["Learning languages", "Critical thinking", "Online education", "Memory techniques"],
  },
  {
    slug: "society",
    label: "Общество",
    description: "Политика, тренды, этика",
    icon: Users,
    accent: "bg-purple-50",
    iconColor: "text-purple-600",
    topics: ["Social media impact", "Urban life", "Ethics of AI", "Generational change"],
  },
]

export const INTEREST_SLUGS = INTERESTS.map((i) => i.slug)

export function getInterest(slug: string): Interest | undefined {
  return INTERESTS.find((i) => i.slug === slug)
}

export function isValidInterestSlug(slug: string): slug is InterestSlug {
  return (INTEREST_SLUGS as string[]).includes(slug)
}

export const ENGLISH_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const
export type EnglishLevel = (typeof ENGLISH_LEVELS)[number]

export function isValidLevel(level: string): level is EnglishLevel {
  return (ENGLISH_LEVELS as readonly string[]).includes(level)
}
