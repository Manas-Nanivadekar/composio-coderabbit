"use client"

import { useState, useEffect } from "react"
import {
  Clock,
  ChevronDown,
  ChevronRight,
  Users,
  FileText,
  ExternalLink,
  Calendar,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  GitBranch,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { mockTimelineAPI } from "@/utils/mockApi"
import type { TimelineEvent } from "@/utils/types"

interface TimelineStory {
  id: string
  title: string
  narrative: string
  progress: number
  events: TimelineEvent[]
  startDate: string
  endDate?: string
  participants: string[]
  category: "project" | "incident" | "decision" | "milestone"
}

export function StoriesTimeline() {
  const [stories, setStories] = useState<TimelineStory[]>([])
  const [expandedStories, setExpandedStories] = useState<Set<string>>(new Set())
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  useEffect(() => {
    loadTimelineData()
  }, [])

  const loadTimelineData = async () => {
    setIsLoading(true)
    try {
      const events = await mockTimelineAPI.getTimeline()
      // Group events into stories (this would normally be done by AI)
      const groupedStories = groupEventsIntoStories(events)
      setStories(groupedStories)
    } catch (error) {
      console.error("Failed to load timeline data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const groupEventsIntoStories = (events: TimelineEvent[]): TimelineStory[] => {
    // Mock story grouping - in reality this would be AI-generated
    return [
      {
        id: "auth-modernization",
        title: "Authentication System Modernization",
        narrative:
          "In early January 2024, the team embarked on a critical journey to modernize our authentication system. What started as a simple security update evolved into a comprehensive overhaul that would impact every user interaction. The story begins with a security audit that revealed vulnerabilities in our legacy OAuth implementation...",
        progress: 85,
        events: events.filter((e) => e.title.toLowerCase().includes("auth") || e.title.toLowerCase().includes("oauth")),
        startDate: "2024-01-01",
        endDate: "2024-01-30",
        participants: ["john.doe", "jane.smith", "security.team"],
        category: "project",
      },
      {
        id: "microservices-transition",
        title: "The Great Microservices Migration",
        narrative:
          "The decision to adopt microservices wasn't made lightly. After months of scaling challenges with our monolithic architecture, the engineering team reached a consensus: it was time for a fundamental change. This is the story of how we transformed our entire backend infrastructure while maintaining zero downtime...",
        progress: 60,
        events: events.filter(
          (e) => e.title.toLowerCase().includes("microservices") || e.title.toLowerCase().includes("migration"),
        ),
        startDate: "2024-01-05",
        participants: ["john.doe", "mike.wilson", "david.lee"],
        category: "project",
      },
      {
        id: "security-incident",
        title: "Security Incident Response and Recovery",
        narrative:
          "On January 3rd, 2024, our monitoring systems detected unusual activity that would test our incident response procedures. What followed was a masterclass in crisis management, team coordination, and systematic problem-solving. Here's how we turned a potential disaster into a learning opportunity...",
        progress: 100,
        events: events.filter((e) => e.type === "incident"),
        startDate: "2024-01-03",
        endDate: "2024-01-04",
        participants: ["security.team", "ops.team", "john.doe"],
        category: "incident",
      },
    ]
  }

  const toggleStoryExpansion = (storyId: string) => {
    const newExpanded = new Set(expandedStories)
    if (newExpanded.has(storyId)) {
      newExpanded.delete(storyId)
    } else {
      newExpanded.add(storyId)
    }
    setExpandedStories(newExpanded)
  }

  const toggleEventExpansion = (eventId: string) => {
    const newExpanded = new Set(expandedEvents)
    if (newExpanded.has(eventId)) {
      newExpanded.delete(eventId)
    } else {
      newExpanded.add(eventId)
    }
    setExpandedEvents(newExpanded)
  }

  const getStoryIcon = (category: string) => {
    switch (category) {
      case "project":
        return GitBranch
      case "incident":
        return AlertCircle
      case "decision":
        return Lightbulb
      case "milestone":
        return CheckCircle
      default:
        return Clock
    }
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case "decision":
        return Lightbulb
      case "milestone":
        return CheckCircle
      case "discussion":
        return Users
      case "incident":
        return AlertCircle
      default:
        return FileText
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "project":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "incident":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "decision":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      case "milestone":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
    }
  }

  const filteredStories =
    selectedCategory === "all" ? stories : stories.filter((story) => story.category === selectedCategory)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading timeline stories...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Stories Timeline</h2>
          <p className="text-muted-foreground">
            Follow the narrative of your organization's key decisions and milestones
          </p>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        {["all", "project", "incident", "decision", "milestone"].map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="capitalize"
          >
            {category === "all" ? "All Stories" : `${category}s`}
          </Button>
        ))}
      </div>

      {/* Table of Contents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Table of Contents</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {filteredStories.map((story) => {
              const Icon = getStoryIcon(story.category)
              return (
                <Button
                  key={story.id}
                  variant="ghost"
                  className="justify-start h-auto p-3"
                  onClick={() => {
                    document.getElementById(`story-${story.id}`)?.scrollIntoView({ behavior: "smooth" })
                  }}
                >
                  <div className="flex items-center space-x-3 w-full">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 text-left">
                      <p className="font-medium">{story.title}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="secondary" className={getCategoryColor(story.category)}>
                          {story.category}
                        </Badge>
                        <Progress value={story.progress} className="w-20 h-2" />
                        <span className="text-xs text-muted-foreground">{story.progress}%</span>
                      </div>
                    </div>
                  </div>
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Stories */}
      <div className="space-y-6">
        {filteredStories.map((story) => {
          const isExpanded = expandedStories.has(story.id)
          const Icon = getStoryIcon(story.category)

          return (
            <Card key={story.id} id={`story-${story.id}`} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Icon className="h-6 w-6 text-muted-foreground" />
                      <CardTitle className="text-xl">{story.title}</CardTitle>
                      <Badge className={getCategoryColor(story.category)}>{story.category}</Badge>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(story.startDate).toLocaleDateString()}</span>
                        {story.endDate && (
                          <>
                            <span>-</span>
                            <span>{new Date(story.endDate).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{story.participants.length} participants</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 mb-4">
                      <Progress value={story.progress} className="flex-1" />
                      <span className="text-sm font-medium">{story.progress}% complete</span>
                    </div>
                  </div>

                  <Button variant="ghost" size="sm" onClick={() => toggleStoryExpansion(story.id)}>
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>
                </div>
              </CardHeader>

              <CardContent>
                {/* Story Narrative */}
                <div className="prose prose-sm max-w-none mb-6">
                  <p className="text-foreground leading-relaxed">{story.narrative}</p>
                </div>

                {/* Participants */}
                <div className="flex items-center space-x-3 mb-4">
                  <span className="text-sm font-medium text-muted-foreground">Key participants:</span>
                  <div className="flex -space-x-2">
                    {story.participants.slice(0, 5).map((participant, index) => (
                      <Avatar key={participant} className="h-8 w-8 border-2 border-background">
                        <AvatarFallback className="text-xs">
                          {participant
                            .split(".")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {story.participants.length > 5 && (
                      <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">+{story.participants.length - 5}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Expandable Events */}
                {isExpanded && (
                  <div className="space-y-4 pt-4 border-t border-border">
                    <h4 className="font-semibold text-foreground flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>Timeline Events</span>
                    </h4>

                    <div className="space-y-3">
                      {story.events.map((event) => {
                        const isEventExpanded = expandedEvents.has(event.id)
                        const EventIcon = getEventIcon(event.type)

                        return (
                          <Card key={event.id} className="bg-muted/50">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <EventIcon className="h-4 w-4 text-muted-foreground" />
                                    <h5 className="font-medium text-foreground">{event.title}</h5>
                                    <Badge variant="outline" className="text-xs">
                                      {event.type}
                                    </Badge>
                                  </div>

                                  <p className="text-sm text-muted-foreground mb-2">
                                    {new Date(event.date).toLocaleDateString()} • {event.participants.length}{" "}
                                    participants
                                  </p>

                                  {!isEventExpanded && (
                                    <p className="text-sm text-foreground">
                                      {event.description.length > 100
                                        ? `${event.description.slice(0, 100)}...`
                                        : event.description}
                                    </p>
                                  )}

                                  {isEventExpanded && (
                                    <div className="space-y-3">
                                      <p className="text-sm text-foreground">{event.description}</p>

                                      {event.sources.length > 0 && (
                                        <div className="space-y-2">
                                          <h6 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                            Source Documents
                                          </h6>
                                          {event.sources.map((source) => (
                                            <div
                                              key={source.id}
                                              className="flex items-center justify-between p-2 bg-background rounded border"
                                            >
                                              <div className="flex-1">
                                                <p className="text-xs font-medium text-foreground">{source.title}</p>
                                                <p className="text-xs text-muted-foreground">{source.platform}</p>
                                              </div>
                                              <Button variant="ghost" size="sm">
                                                <ExternalLink className="h-3 w-3" />
                                              </Button>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>

                                <Button variant="ghost" size="sm" onClick={() => toggleEventExpansion(event.id)}>
                                  {isEventExpanded ? (
                                    <ChevronDown className="h-3 w-3" />
                                  ) : (
                                    <ChevronRight className="h-3 w-3" />
                                  )}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </div>
                )}

                {!isExpanded && (
                  <Button
                    variant="outline"
                    className="w-full mt-4 bg-transparent"
                    onClick={() => toggleStoryExpansion(story.id)}
                  >
                    Show {story.events.length} timeline events
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredStories.length === 0 && (
        <div className="text-center py-12">
          <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No stories found</h3>
          <p className="text-muted-foreground">Try selecting a different category or check back later</p>
        </div>
      )}
    </div>
  )
}
