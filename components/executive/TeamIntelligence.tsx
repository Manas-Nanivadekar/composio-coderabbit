"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { mockExecutiveAPI } from "@/utils/mockApi"
import type { KnowledgeFlowMap } from "@/utils/types"

export function TeamIntelligence() {
  const [flow, setFlow] = useState<KnowledgeFlowMap | null>(null)

  useEffect(() => {
    mockExecutiveAPI.getKnowledgeFlow().then(setFlow)
  }, [])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Department Collaboration Health</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {(flow?.communicationStrength || []).map((c, i) => (
            <div key={i} className="flex items-center justify-between">
              <span>
                {c.from} → {c.to}
              </span>
              <span>{Math.round(c.strength * 100)}%</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Strategic Theme Tracker</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          {(flow?.collaborationOpportunities || []).map((s, i) => (
            <div key={i}>• {s}</div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}


