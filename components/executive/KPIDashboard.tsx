"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { mockExecutiveAPI } from "@/utils/mockApi"
import type { KnowledgeHealthKPI } from "@/utils/types"

function riskBadgeClass(level: KnowledgeHealthKPI["riskLevel"]) {
  switch (level) {
    case "low":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
    case "moderate":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
    case "high":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
    case "critical":
      return "bg-red-600 text-white"
  }
}

export function KPIDashboard() {
  const [kpis, setKpis] = useState<KnowledgeHealthKPI[] | null>(null)

  useEffect(() => {
    mockExecutiveAPI.getKPIOverview().then(setKpis)
  }, [])

  return (
    <div className="space-y-6">
      {/* Top Row: 4 KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {(kpis || []).map((kpi) => (
          <Card key={kpi.metric} className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                {kpi.metric.replace(/_/g, " ")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-foreground">{kpi.score}</div>
                <Badge className={`text-xs ${riskBadgeClass(kpi.riskLevel)}`}>{kpi.riskLevel.toUpperCase()}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{kpi.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Middle: 2-column layout placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Knowledge Risk Heatmap (placeholder)</CardTitle>
          </CardHeader>
          <CardContent className="h-72 grid place-items-center text-muted-foreground">
            Heatmap visualization goes here
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Supporting Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Top Risk: Engineering</span>
              <Badge variant="outline">78</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Recent Change: Marketing</span>
              <Badge variant="outline">+2</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Succession Coverage</span>
              <Badge variant="outline">In Progress</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom: 3-column breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Knowledge Risks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-muted-foreground">Risk #{i + 1}</span>
                <Badge variant="secondary">High</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Risk Changes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-muted-foreground">Team {i + 1}</span>
                <Badge variant="outline">{i % 2 ? "+1" : "-1"}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Succession Planning Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-muted-foreground">Critical Role {i + 1}</span>
                <Badge variant="outline">{i % 2 ? "Complete" : "In Progress"}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


