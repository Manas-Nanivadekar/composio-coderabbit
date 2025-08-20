"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, CheckCircle, Package, GitBranch, Clock } from "lucide-react"

export function CodeImpactVisualizer() {
  const repositoryHealth = {
    buildStatus: "passing" as const,
    testCoverage: 78,
    lastDeploy: "2h ago",
    outdatedPackages: 3,
  }

  const dependencies = [
    { name: "react", version: "18.2.0", status: "current", risk: "low" },
    { name: "express", version: "4.18.1", status: "outdated", risk: "medium" },
    { name: "lodash", version: "4.17.19", status: "vulnerable", risk: "high" },
    { name: "typescript", version: "5.0.2", status: "current", risk: "low" },
  ]

  const impactAnalysis = {
    changedFiles: ["auth/middleware.ts", "utils/session.ts"],
    affectedServices: ["auth-service", "user-service", "api-gateway"],
    riskLevel: "medium" as const,
    testSuggestions: [
      "Run integration tests for auth flow",
      "Test session persistence across services",
      "Verify API gateway routing",
    ],
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "high":
        return "text-red-400 bg-red-500/20"
      case "medium":
        return "text-yellow-400 bg-yellow-500/20"
      case "low":
        return "text-green-400 bg-green-500/20"
      default:
        return "text-slate-400 bg-slate-500/20"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "current":
        return <CheckCircle className="h-3 w-3 text-green-500" />
      case "outdated":
        return <Clock className="h-3 w-3 text-yellow-500" />
      case "vulnerable":
        return <AlertTriangle className="h-3 w-3 text-red-500" />
      default:
        return <Package className="h-3 w-3 text-slate-500" />
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white mb-4">Code Impact</h2>

      {/* Repository Health */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-base">Repository Health</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-300">Build Status</span>
            <Badge variant={repositoryHealth.buildStatus === "passing" ? "default" : "destructive"} className="text-xs">
              <GitBranch className="h-3 w-3 mr-1" />
              {repositoryHealth.buildStatus}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Test Coverage</span>
              <span className="text-sm text-white">{repositoryHealth.testCoverage}%</span>
            </div>
            <Progress value={repositoryHealth.testCoverage} className="h-2" />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-300">Last Deploy</span>
            <span className="text-sm text-slate-400">{repositoryHealth.lastDeploy}</span>
          </div>

          {repositoryHealth.outdatedPackages > 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded p-2">
              <p className="text-xs text-yellow-400">{repositoryHealth.outdatedPackages} packages need updates</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dependencies */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-base">Dependencies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {dependencies.map((dep, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getStatusIcon(dep.status)}
                <span className="text-sm text-white font-mono">{dep.name}</span>
                <span className="text-xs text-slate-400">{dep.version}</span>
              </div>
              <Badge variant="outline" className={`text-xs ${getRiskColor(dep.risk)}`}>
                {dep.risk}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Impact Analysis */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-base">Impact Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-slate-300 mb-2">Recent Changes:</p>
            <div className="space-y-1">
              {impactAnalysis.changedFiles.map((file, index) => (
                <p key={index} className="text-xs text-slate-400 font-mono bg-slate-900/50 px-2 py-1 rounded">
                  {file}
                </p>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm text-slate-300 mb-2">Affected Services:</p>
            <div className="flex flex-wrap gap-1">
              {impactAnalysis.affectedServices.map((service, index) => (
                <Badge key={index} variant="outline" className="text-xs text-slate-300 border-slate-600">
                  {service}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Risk Level</span>
              <Badge variant="outline" className={`text-xs ${getRiskColor(impactAnalysis.riskLevel)}`}>
                {impactAnalysis.riskLevel} risk
              </Badge>
            </div>
          </div>

          <div>
            <p className="text-sm text-slate-300 mb-2">Suggested Tests:</p>
            <div className="space-y-1">
              {impactAnalysis.testSuggestions.map((suggestion, index) => (
                <p key={index} className="text-xs text-slate-400">
                  • {suggestion}
                </p>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
