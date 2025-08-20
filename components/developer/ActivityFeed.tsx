"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Github, ExternalLink, GitMerge, Bug, FileText } from "lucide-react"

export function ActivityFeed() {
  const activities = [
    {
      id: "1",
      type: "pr_merged" as const,
      title: "Fixed caching bug by refactoring data_fetcher module",
      summary: "PR #1234 merged 2h ago",
      source: {
        platform: "github" as const,
        author: "alex.dev",
        date: "2h ago",
        url: "#",
      },
      impact: "medium" as const,
      details: {
        filesChanged: 3,
        linesAdded: 127,
        linesRemoved: 45,
      },
    },
    {
      id: "2",
      type: "ticket_closed" as const,
      title: "Implement OAuth 2.0 for mobile app login",
      summary: "AUTH-456 completed 4h ago",
      source: {
        platform: "jira" as const,
        author: "sarah.pm",
        date: "4h ago",
        url: "#",
      },
      impact: "high" as const,
      details: {
        storyPoints: 8,
        sprint: "Mobile Auth Q4",
      },
    },
    {
      id: "3",
      type: "pr_merged" as const,
      title: "Add Redis session store to auth service",
      summary: "PR #1230 merged 1d ago",
      source: {
        platform: "github" as const,
        author: "sarah.dev",
        date: "1d ago",
        url: "#",
      },
      impact: "high" as const,
      details: {
        filesChanged: 8,
        linesAdded: 234,
        linesRemoved: 12,
      },
      relatedItems: [
        {
          title: "AUTH-234: Improve session performance",
          platform: "jira" as const,
          url: "#",
        },
      ],
    },
    {
      id: "4",
      type: "build_failed" as const,
      title: "Payment service build failing on staging",
      summary: "Build #892 failed 2d ago",
      source: {
        platform: "github" as const,
        author: "ci-bot",
        date: "2d ago",
        url: "#",
      },
      impact: "high" as const,
    },
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "pr_merged":
        return <GitMerge className="h-4 w-4 text-green-500" />
      case "ticket_closed":
        return <FileText className="h-4 w-4 text-blue-500" />
      case "build_failed":
        return <Bug className="h-4 w-4 text-red-500" />
      default:
        return <Github className="h-4 w-4 text-slate-500" />
    }
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "github":
        return <Github className="h-3 w-3" />
      case "jira":
        return <FileText className="h-3 w-3" />
      default:
        return <Github className="h-3 w-3" />
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "low":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30"
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
      <div className="space-y-3">
        {activities.map((activity) => (
          <Card key={activity.id} className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">{getActivityIcon(activity.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getPlatformIcon(activity.source.platform)}
                      <span className="text-sm text-slate-400">{activity.summary}</span>
                    </div>
                    <Badge variant="outline" className={`text-xs ${getImpactColor(activity.impact)}`}>
                      {activity.impact} impact
                    </Badge>
                  </div>

                  <h3 className="text-white font-medium mb-2 leading-tight">{activity.title}</h3>

                  {activity.details && (
                    <div className="text-sm text-slate-400 mb-3">
                      {activity.type === "pr_merged" && activity.details.filesChanged && (
                        <span>
                          Files: {activity.details.filesChanged} changed • +{activity.details.linesAdded} -
                          {activity.details.linesRemoved} lines
                        </span>
                      )}
                      {activity.type === "ticket_closed" && activity.details.storyPoints && (
                        <span>
                          Story Points: {activity.details.storyPoints} • Sprint: {activity.details.sprint}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      by {activity.source.author} • {activity.source.date}
                    </span>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-400 hover:text-blue-300 p-0 h-auto text-xs"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View {activity.source.platform === "github" ? "PR" : "Ticket"}
                      </Button>
                      {activity.relatedItems && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-slate-400 hover:text-slate-300 p-0 h-auto text-xs"
                        >
                          Related Items
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
