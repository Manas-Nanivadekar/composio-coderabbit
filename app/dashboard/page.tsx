"use client"

import { useSession } from "next-auth/react"
import { Dashboard } from "@/components/dashboard/Dashboard"
import { ExecutiveDashboard } from "@/components/executive/ExecutiveDashboard"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  if (status === "loading") return null
  if (status === "unauthenticated") {
    router.push("/auth/login")
    return null
  }
  const role = (session?.user as any)?.role || "developer"
  return role === "manager" || role === "executive" || role === "leader" ? <ExecutiveDashboard /> : <Dashboard />
}
