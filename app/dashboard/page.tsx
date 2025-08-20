"use client"

import { useSession } from "next-auth/react"
import { Dashboard } from "@/components/dashboard/Dashboard"
import { ExecutiveDashboard } from "@/components/executive/ExecutiveDashboard"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
  }, [status, router])

  if (status === "loading" || status === "unauthenticated") {
    return null
  }

  const role = (session?.user as any)?.role || "developer"
  return role === "manager" || role === "executive" || role === "leader" ? <ExecutiveDashboard /> : <Dashboard />
}
