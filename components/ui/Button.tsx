import Link from "next/link"
import { cn } from "@/lib/utils"

type Variant = "primary" | "secondary" | "ghost" | "outline"
type Size = "sm" | "md" | "lg"

const base =
  "inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-colors disabled:opacity-50 disabled:pointer-events-none cursor-pointer"

const variants: Record<Variant, string> = {
  primary: "bg-zinc-900 text-white hover:bg-zinc-800",
  secondary: "bg-white text-zinc-900 border border-zinc-200 hover:bg-zinc-50",
  ghost: "text-zinc-900 hover:bg-zinc-100",
  outline: "border border-zinc-300 text-zinc-900 hover:bg-zinc-50 bg-transparent",
}

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
}

type CommonProps = {
  variant?: Variant
  size?: Size
  className?: string
  children: React.ReactNode
}

type ButtonProps = CommonProps & React.ButtonHTMLAttributes<HTMLButtonElement>

export function Button({ variant = "primary", size = "md", className, children, ...props }: ButtonProps) {
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  )
}

type LinkButtonProps = CommonProps & {
  href: string
  target?: string
  rel?: string
}

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  target,
  rel,
}: LinkButtonProps) {
  return (
    <Link
      href={href}
      target={target}
      rel={rel}
      className={cn(base, variants[variant], sizes[size], className)}
    >
      {children}
    </Link>
  )
}
