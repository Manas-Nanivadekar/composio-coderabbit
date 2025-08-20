"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GitBranch, AlertTriangle, CheckCircle, Clock } from "lucide-react"

export function ProjectContextCards() {
  const projects = [
    {
      id: "1",
      name: "Auth Service",
      repository: "backend/auth-service",
      health: "healthy" as const,
      metrics: {
        featuresThisWeek: 2,
        bugsReported: 0,
        prsInReview: 1,
        buildStatus: "passing" as const,
        testCoverage: 87,
      },
    },
    {
      id: "2",
      name: "Mobile App",
      repository: "mobile/react-native-app",
      health: "attention" as const,
      metrics: {
        featuresThisWeek: 1,
        bugsReported: 3,
        prsInReview: 4,
        buildStatus: "passing" as const,
        testCoverage: 72,
      },
      alerts: ["3 critical bugs reported", "4 stale PRs"],
    },
    {
      id: "3",
      name: "Payment Gateway",
      repository: "backend/payment-service",
      health: "critical" as const,
      metrics: {
        featuresThisWeek: 0,
        bugsReported: 2,
        prsInReview: 1,
        buildStatus: "failing" as const,
        testCoverage: 45,
      },
      alerts: ["Build failing for 2 days", "Low test coverage"],
    },
  ]

  const getHealthIcon = (health: string) => {
    switch (health) {
      case "healthy":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "attention":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-slate-500" />
    }
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case "healthy":
        return "text-green-400"
      case "attention":
        return "text-yellow-400"
      case "critical":
        return "text-red-400"
      default:
        return "text-slate-400"
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white mb-4">Active Projects</h2>
      {projects.map((project) => (
        <Card key={project.id} className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-base">{project.name}</CardTitle>
              <div className="flex items-center space-x-1">
                {getHealthIcon(project.health)}
                <span className={`text-sm capitalize ${getHealthColor(project.health)}`}>{project.health}</span>
              </div>
            </div>
            <p className="text-sm text-slate-400 font-mono">{project.repository}</p>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="text-sm text-slate-300">
                <p className="mb-2 font-medium">This Week:</p>
                <ul className="space-y-1 text-slate-400">
                  <li>• {project.metrics.featuresThisWeek} features merged</li>
                  <li>• {project.metrics.bugsReported} bugs reported</li>
                  <li>• {project.metrics.prsInReview} PRs in review</li>
                </ul>
              </div>

              <div className="flex items-center space-x-2">
                <Badge
                  variant={project.metrics.buildStatus === "passing" ? "default" : "destructive"}
                  className="text-xs"
                >
                  <GitBranch className="h-3 w-3 mr-1" />
                  {project.metrics.buildStatus}
                </Badge>
                <Badge variant="outline" className="text-xs text-slate-300 border-slate-600">
                  {project.metrics.testCoverage}% coverage
                </Badge>
              </div>

              {project.alerts && (
                <div className="space-y-1">
                  {project.alerts.map((alert, index) => (
                    <p key={index} className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded">
                      {alert}
                    </p>
                  ))}
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                className="w-full text-slate-300 border-slate-600 hover:bg-slate-700 bg-transparent"
              >
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
