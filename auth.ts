import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "Email и пароль",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Пароль", type: "password" },
      },
      async authorize(credentials) {
        const email = typeof credentials?.email === "string" ? credentials.email.trim().toLowerCase() : ""
        const password = typeof credentials?.password === "string" ? credentials.password : ""
        if (!EMAIL_RE.test(email) || password.length < 6) return null

        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            passwordHash: true,
          },
        })

        if (!user || !user.passwordHash) return null

        const valid = await bcrypt.compare(password, user.passwordHash)
        if (!valid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      },
    }),
  ],
  secret: process.env.AUTH_SECRET,
  // Credentials провайдер требует JWT-сессии.
  // PrismaAdapter продолжает хранить юзеров и OAuth-аккаунты в БД.
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.userId = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.userId) {
        session.user.id = token.userId as string
      }
      return session
    },
  },
})
