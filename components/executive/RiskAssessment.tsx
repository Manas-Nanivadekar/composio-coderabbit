"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { mockExecutiveAPI } from "@/utils/mockApi"
import type { TeamRiskProfile } from "@/utils/types"

function mitigationBadge(status: TeamRiskProfile["mitigationStatus"]) {
  switch (status) {
    case "good":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
    case "moderate":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
    case "at_risk":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
  }
}

export function RiskAssessment() {
  const [teams, setTeams] = useState<TeamRiskProfile[]>([])

  useEffect(() => {
    mockExecutiveAPI.getRiskAssessment().then(setTeams)
  }, [])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Team Vulnerability Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Team</TableHead>
                <TableHead>Risk Score</TableHead>
                <TableHead>Bus Factor</TableHead>
                <TableHead>Succession Plan</TableHead>
                <TableHead>Mitigation Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teams.map((t) => (
                <TableRow key={t.teamId}>
                  <TableCell className="font-medium">{t.teamName}</TableCell>
                  <TableCell>{t.riskScore}</TableCell>
                  <TableCell>{t.busFactor}</TableCell>
                  <TableCell className="capitalize">{t.successionPlan.replace("_", " ")}</TableCell>
                  <TableCell>
                    <Badge className={`text-xs ${mitigationBadge(t.mitigationStatus)}`}>
                      {t.mitigationStatus.replace("_", " ")}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}


