import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { promises as fs } from "fs"
import path from "path"

type StoredUser = {
  id: string
  email: string
  name: string
  role: "developer" | "manager" | "executive" | "leader"
  team?: string
  passwordHash: string
}

const USERS_FILE = path.join(process.cwd(), "data", "users.json")

async function readUsers(): Promise<StoredUser[]> {
  try {
    const data = await fs.readFile(USERS_FILE, "utf8")
    return JSON.parse(data) as StoredUser[]
  } catch (err) {
    return []
  }
}

export const authOptions: NextAuthConfig = {
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      id: "credentials",
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) return null
        const users = await readUsers()
        const user = users.find((u) => u.email.toLowerCase() === String(credentials.email).toLowerCase())
        if (!user) return null
        const ok = await compare(String(credentials.password), user.passwordHash)
        if (!ok) return null
        return { id: user.id, email: user.email, name: user.name, role: user.role as any, team: user.team }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.team = (user as any).team
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as any).role = token.role || "developer"
        ;(session.user as any).team = token.team || ""
      }
      return session
    },
  },
}


