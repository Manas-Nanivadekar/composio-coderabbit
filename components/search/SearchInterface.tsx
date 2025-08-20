"use client"

import { useState, useEffect } from "react"
import { Search, Clock, ThumbsUp, ThumbsDown, ExternalLink, Loader2, Code2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useDebounce } from "@/hooks/useDebounce"
import { enhancedSearchAPI } from "@/utils/composioApi"
import { useToast } from "@/hooks/use-toast"
import type { SearchResult } from "@/utils/types"

export function SearchInterface() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const [recentSearches] = useState([
    "authentication issues in ComposioHQ",
    "OAuth implementation bugs",
    "SDK integration problems",
    "API rate limiting issues",
    "Zendesk oauth subdomain requirements",
    "VercelProvider security vulnerability",
  ])

  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedQuery.trim()) {
        setResults([])
        return
      }

      setIsLoading(true)
      try {
        const searchResults = await enhancedSearchAPI.search(debouncedQuery)
        setResults(searchResults)
        if (searchResults.length > 0) {
          toast({
            title: "Search completed",
            description: `Found ${searchResults.length} result${searchResults.length !== 1 ? "s" : ""} for "${debouncedQuery}"`,
            duration: 3000,
          })
        }
      } catch (error) {
        console.error("Search failed:", error)
        setResults([])
        toast({
          title: "Search failed",
          description: "Unable to search at this time. Please try again.",
          variant: "destructive",
          duration: 5000,
        })
      } finally {
        setIsLoading(false)
      }
    }

    performSearch()
  }, [debouncedQuery, toast])

  const platformColors = {
    github: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    jira: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    slack: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    confluence: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    linear: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  }

  const handleRecentSearch = (searchTerm: string) => {
    setQuery(searchTerm)
  }

  const handleFeedback = (resultId: string, isHelpful: boolean) => {
    toast({
      title: "Thank you for your feedback!",
      description: `Your ${isHelpful ? "positive" : "negative"} feedback helps improve our search results.`,
      duration: 3000,
    })
  }

  return (
    <div className="space-y-8">
      {/* Hero Search */}
      <div className="flex flex-col items-center justify-center space-y-6 py-16">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Code2 className="h-8 w-8 text-primary" />
            <h2 className="text-3xl font-bold text-foreground">Search ComposioHQ Repository</h2>
          </div>
          <p className="text-muted-foreground text-lg">Search through 241 issues and 1508+ pull requests from the ComposioHQ/composio repository</p>
        </div>

        <div className="relative w-full max-w-2xl">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="e.g., 'authentication issues' or 'OAuth implementation bugs' or 'SDK integration problems'"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-14 pl-12 pr-12 text-lg border-2 focus:border-primary transition-all duration-200 shadow-sm"
          />
          {isLoading && (
            <Loader2 className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-primary" />
          )}
        </div>
      </div>

      {/* Search Results */}
      {results.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">
              Found {results.length} result{results.length !== 1 ? "s" : ""} for "{debouncedQuery}"
            </h3>
          </div>

          <div className="grid gap-4">
            {results.map((result) => (
              <Card
                key={result.id}
                className="hover:shadow-md transition-all duration-200 border-l-4 border-l-primary/20"
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Result Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-base font-medium text-foreground leading-relaxed">{result.summary}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge
                            variant="secondary"
                            className={`${platformColors[result.sources[0]?.platform || "github"]} text-xs`}
                          >
                            {result.sources[0]?.platform.toUpperCase()}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Confidence: {Math.round(result.confidence * 100)}%
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(result.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Sources */}
                    {result.sources.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-foreground">Sources:</h4>
                        <div className="grid gap-2">
                          {result.sources.slice(0, 2).map((source) => (
                            <div
                              key={source.id}
                              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border"
                            >
                              <div className="flex-1">
                                <p className="text-sm font-medium text-foreground">{source.title}</p>
                                <p className="text-xs text-muted-foreground mt-1 font-mono">{source.snippet}</p>
                                <div className="flex items-center space-x-2 mt-2">
                                  <Badge variant="outline" className="text-xs">
                                    {source.platform}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(source.date).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm" className="ml-4">
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Related Questions */}
                    {result.relatedQuestions.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-foreground">Related questions:</h4>
                        <div className="flex flex-wrap gap-2">
                          {result.relatedQuestions.slice(0, 3).map((question, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              className="text-xs h-8 bg-transparent hover:bg-primary/10"
                              onClick={() => setQuery(question)}
                            >
                              {question}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleFeedback(result.id, true)}>
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          Helpful
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleFeedback(result.id, false)}>
                          <ThumbsDown className="h-4 w-4 mr-1" />
                          Not helpful
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Recent Searches */}
      {!query && !isLoading && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Recent developer searches</span>
          </div>
          <div className="grid gap-2">
            {recentSearches.map((search, index) => (
              <Card
                key={index}
                className="cursor-pointer hover:bg-accent transition-all duration-200 hover:shadow-sm"
                onClick={() => handleRecentSearch(search)}
              >
                <CardContent className="p-4">
                  <p className="text-sm text-foreground font-mono">{search}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {query && !isLoading && results.length === 0 && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No results found</h3>
          <p className="text-muted-foreground">Try asking about code changes, features, or team decisions</p>
        </div>
      )}
    </div>
  )
}
