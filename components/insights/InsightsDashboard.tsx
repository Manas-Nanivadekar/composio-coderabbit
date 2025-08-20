"use client"

import { useState, useEffect } from "react"
import { Lightbulb, AlertTriangle, TrendingUp, Info, X, Check, Clock, FileText, Bell, BellOff } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { mockInsightsAPI } from "@/utils/mockApi"
import type { ProactiveInsight } from "@/utils/types"

export function InsightsDashboard() {
  const [insights, setInsights] = useState<ProactiveInsight[]>([])
  const [dismissedInsights, setDismissedInsights] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)

  useEffect(() => {
    loadInsights()
  }, [])

  const loadInsights = async () => {
    setIsLoading(true)
    try {
      const insightsData = await mockInsightsAPI.getInsights()
      setInsights(insightsData)
    } catch (error) {
      console.error("Failed to load insights:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const dismissInsight = (insightId: string) => {
    setDismissedInsights((prev) => new Set([...prev, insightId]))
  }

  const getInsightIcon = (category: string) => {
    switch (category) {
      case "decision":
        return Lightbulb
      case "risk":
        return AlertTriangle
      case "opportunity":
        return TrendingUp
      case "update":
        return Info
      default:
        return Info
    }
  }

  const getInsightColor = (priority: string, category: string) => {
    if (priority === "high") {
      return category === "risk"
        ? "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800"
        : "bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-800"
    }
    if (priority === "medium") {
      return "bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800"
    }
    return "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800"
  }

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case "decision":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      case "risk":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "opportunity":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "update":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
    }
  }

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
    }
  }

  const visibleInsights = insights
    .filter((insight) => !dismissedInsights.has(insight.id))
    .filter((insight) => selectedCategory === "all" || insight.category === selectedCategory)
    .sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })

  const todayInsights = visibleInsights.slice(0, 3)
  const otherInsights = visibleInsights.slice(3)

  const insightCounts = {
    all: visibleInsights.length,
    decision: visibleInsights.filter((i) => i.category === "decision").length,
    risk: visibleInsights.filter((i) => i.category === "risk").length,
    opportunity: visibleInsights.filter((i) => i.category === "opportunity").length,
    update: visibleInsights.filter((i) => i.category === "update").length,
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading insights...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Daily Insights</h2>
          <p className="text-muted-foreground">Here's what you should know today</p>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => setNotificationsEnabled(!notificationsEnabled)}>
            {notificationsEnabled ? (
              <>
                <Bell className="h-4 w-4 mr-1" />
                Notifications On
              </>
            ) : (
              <>
                <BellOff className="h-4 w-4 mr-1" />
                Notifications Off
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(insightCounts).map(([category, count]) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="capitalize"
          >
            {category === "all" ? "All" : category}
            {count > 0 && (
              <Badge variant="secondary" className="ml-2 px-1.5 py-0.5 text-xs">
                {count}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Today's Top Insights */}
      {todayInsights.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground">Today's Priority Insights</h3>
          </div>

          <div className="grid gap-4">
            {todayInsights.map((insight) => {
              const Icon = getInsightIcon(insight.category)

              return (
                <Card key={insight.id} className={`${getInsightColor(insight.priority, insight.category)} border-l-4`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <Icon className="h-5 w-5 text-muted-foreground" />
                          <h4 className="font-semibold text-foreground">{insight.title}</h4>
                          <div className="flex items-center space-x-2">
                            <Badge className={getCategoryBadgeColor(insight.category)}>{insight.category}</Badge>
                            <Badge className={getPriorityBadgeColor(insight.priority)}>
                              {insight.priority} priority
                            </Badge>
                          </div>
                        </div>

                        <p className="text-foreground leading-relaxed mb-4">{insight.summary}</p>

                        {insight.sources.length > 0 && (
                          <div className="space-y-2">
                            <h5 className="text-sm font-medium text-muted-foreground">Related sources:</h5>
                            <div className="flex flex-wrap gap-2">
                              {insight.sources.slice(0, 3).map((source) => (
                                <div
                                  key={source.id}
                                  className="flex items-center space-x-2 p-2 bg-background/50 rounded border"
                                >
                                  <FileText className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-xs text-foreground">{source.title}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {source.platform}
                                  </Badge>
                                </div>
                              ))}
                              {insight.sources.length > 3 && (
                                <div className="flex items-center p-2 text-xs text-muted-foreground">
                                  +{insight.sources.length - 3} more
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {insight.actionable && (
                          <div className="mt-4 p-3 bg-background/50 rounded border">
                            <div className="flex items-center space-x-2">
                              <Check className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium text-foreground">Action recommended</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              This insight suggests specific actions you can take.
                            </p>
                          </div>
                        )}
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => dismissInsight(insight.id)}
                        className="ml-4 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Other Insights */}
      {otherInsights.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Other Insights</h3>

          <div className="grid gap-3">
            {otherInsights.map((insight) => {
              const Icon = getInsightIcon(insight.category)

              return (
                <Card key={insight.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <h4 className="font-medium text-foreground">{insight.title}</h4>
                          <Badge className={getCategoryBadgeColor(insight.category)} variant="secondary">
                            {insight.category}
                          </Badge>
                          {insight.priority === "high" && (
                            <Badge className={getPriorityBadgeColor(insight.priority)}>{insight.priority}</Badge>
                          )}
                        </div>

                        <p className="text-sm text-foreground mb-2">{insight.summary}</p>

                        {insight.sources.length > 0 && (
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <FileText className="h-3 w-3" />
                            <span>
                              {insight.sources.length} source{insight.sources.length !== 1 ? "s" : ""}
                            </span>
                            {insight.actionable && (
                              <>
                                <span>•</span>
                                <span className="text-green-600">Action recommended</span>
                              </>
                            )}
                          </div>
                        )}
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => dismissInsight(insight.id)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {visibleInsights.length === 0 && (
        <div className="text-center py-12">
          <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">All caught up!</h3>
          <p className="text-muted-foreground">No new insights for now. Check back later for updates.</p>

          {dismissedInsights.size > 0 && (
            <Button variant="outline" className="mt-4 bg-transparent" onClick={() => setDismissedInsights(new Set())}>
              Show dismissed insights ({dismissedInsights.size})
            </Button>
          )}
        </div>
      )}

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Insight Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{insightCounts.decision}</div>
              <div className="text-sm text-muted-foreground">Decisions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{insightCounts.risk}</div>
              <div className="text-sm text-muted-foreground">Risks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{insightCounts.opportunity}</div>
              <div className="text-sm text-muted-foreground">Opportunities</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{insightCounts.update}</div>
              <div className="text-sm text-muted-foreground">Updates</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
