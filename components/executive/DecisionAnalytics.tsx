"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { mockExecutiveAPI } from "@/utils/mockApi"
import type { DecisionAnalytics } from "@/utils/types"

export function DecisionAnalyticsPanel() {
  const [data, setData] = useState<DecisionAnalytics | null>(null)

  useEffect(() => {
    mockExecutiveAPI.getDecisionAnalytics("quarter").then(setData)
  }, [])

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Decisions This Quarter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalDecisions ?? "--"}</div>
            <p className="text-xs text-muted-foreground">23% increase from Q3</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Avg. Decision Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.averageDecisionTime ?? "--"} days</div>
            <p className="text-xs text-muted-foreground">15% improvement</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Policy Reversals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.policyReversals ?? "--"}</div>
            <p className="text-xs text-muted-foreground">Improving trend</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Strategic Alignment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.strategicAlignment ?? "--"}%</div>
            <p className="text-xs text-muted-foreground">Above target</p>
          </CardContent>
        </Card>
      </div>

      {/* Revisited Decisions */}
      <Card>
        <CardHeader>
          <CardTitle>Revisited Decisions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(data?.revisitedDecisions || []).map((d) => (
            <div key={d.id} className="flex items-center justify-between text-sm">
              <span className="text-foreground">{d.title}</span>
              <Badge variant="outline">{d.count}x</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}


