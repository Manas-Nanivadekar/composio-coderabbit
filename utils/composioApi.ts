import type { SearchResult, Source } from "./types"

interface ComposioSearchResult {
  type: 'issue' | 'pull_request'
  number: number
  title: string
  state: string
  author: string
  created_at: string
  updated_at: string
  html_url: string
  labels?: string[]
  body_preview?: string
  relevance_score: number
  merged?: boolean
  merged_at?: string
}

interface ComposioApiResponse {
  query: string
  type: string
  total_results: number
  results: ComposioSearchResult[]
}

interface ComposioStatsResponse {
  repository: {
    name: string
    url: string
    stars: number
    forks: number
    open_issues: number
    language: string
    created_at: string
    updated_at: string
    description: string
  }
  summary: {
    total_issues: number
    total_pulls: number
    open_issues: number
    closed_issues: number
    open_pulls: number
    closed_pulls: number
    merged_pulls: number
  }
  last_updated: string
}

interface ComposioAISuggestionsResponse {
  query: string
  ai_suggestions: {
    suggestions: string[]
    categories: string[]
    related_terms: string[]
  }
}

interface ComposioRecentResponse {
  recent_issues: ComposioSearchResult[]
  recent_pulls: ComposioSearchResult[]
}

class ComposioAPI {
  private baseUrl: string = 'http://localhost:5000'

  async search(query: string, type: string = 'all'): Promise<SearchResult[]> {
    try {
      const response = await fetch(`${this.baseUrl}/search?q=${encodeURIComponent(query)}&type=${type}&limit=20`)
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      const data: ComposioApiResponse = await response.json()
      
      // Transform ComposioHQ results to our SearchResult format
      return data.results.map((result, index) => ({
        id: `composio-${result.type}-${result.number}`,
        query: data.query,
        summary: this.createSummary(result),
        confidence: Math.min(0.9, 0.6 + (result.relevance_score * 0.1)),
        sources: [this.transformToSource(result)],
        relatedQuestions: this.generateRelatedQuestions(result),
        timestamp: result.updated_at || result.created_at
      }))

    } catch (error) {
      console.error('ComposioHQ API search failed:', error)
      // Return empty results on API failure
      return []
    }
  }

  async getStats(): Promise<ComposioStatsResponse | null> {
    try {
      const response = await fetch(`${this.baseUrl}/stats`)
      
      if (!response.ok) {
        throw new Error(`Stats API request failed: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('ComposioHQ API stats failed:', error)
      return null
    }
  }

  async getAISuggestions(query: string): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/ai-search?q=${encodeURIComponent(query)}`)
      
      if (!response.ok) {
        throw new Error(`AI suggestions API request failed: ${response.status}`)
      }

      const data: ComposioAISuggestionsResponse = await response.json()
      return data.ai_suggestions.suggestions || []
    } catch (error) {
      console.error('ComposioHQ AI suggestions failed:', error)
      return []
    }
  }

  async getRecent(): Promise<ComposioRecentResponse | null> {
    try {
      const response = await fetch(`${this.baseUrl}/recent`)
      
      if (!response.ok) {
        throw new Error(`Recent API request failed: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('ComposioHQ recent API failed:', error)
      return null
    }
  }

  private createSummary(result: ComposioSearchResult): string {
    const type = result.type === 'issue' ? 'Issue' : 'Pull Request'
    const state = result.state
    const author = result.author
    
    let summary = `${type} #${result.number}: "${result.title}" (${state})`
    
    if (result.type === 'pull_request' && result.merged) {
      summary += ` - Merged by ${author}`
    } else {
      summary += ` - Created by ${author}`
    }

    if (result.body_preview) {
      summary += `. ${result.body_preview}`
    }

    return summary
  }

  private transformToSource(result: ComposioSearchResult): Source {
    const platformIcon = result.type === 'issue' ? '🐛' : '🔄'
    
    return {
      id: `composio-${result.type}-${result.number}`,
      title: `${platformIcon} ${result.type === 'issue' ? 'Issue' : 'PR'} #${result.number}: ${result.title}`,
      platform: 'github' as const,
      url: result.html_url,
      snippet: result.body_preview || `${result.type} ${result.state} by ${result.author}`,
      date: result.created_at.split('T')[0], // Extract date part
      participants: [result.author]
    }
  }

  private generateRelatedQuestions(result: ComposioSearchResult): string[] {
    const questions: string[] = []
    
    if (result.type === 'issue') {
      questions.push(
        `What caused issue #${result.number}?`,
        `How was this ${result.state} issue resolved?`,
        `Are there similar issues in ComposioHQ?`
      )
    } else {
      questions.push(
        `What changes were made in PR #${result.number}?`,
        `Who reviewed this pull request?`,
        `What impact did this PR have on the codebase?`
      )
    }

    if (result.labels && result.labels.length > 0) {
      questions.push(`What other ${result.labels[0]} issues exist?`)
    }

    return questions.slice(0, 3) // Return max 3 questions
  }

  // Check if ComposioHQ API is available
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/`, { 
        method: 'GET',
        signal: AbortSignal.timeout(3000) // 3 second timeout
      })
      return response.ok
    } catch (error) {
      console.warn('ComposioHQ API not available:', error)
      return false
    }
  }
}

export const composioAPI = new ComposioAPI()

// Enhanced search API that tries ComposioHQ first, falls back to mock
export const enhancedSearchAPI = {
  search: async (query: string): Promise<SearchResult[]> => {
    // Try ComposioHQ API first
    const isApiAvailable = await composioAPI.healthCheck()
    
    if (isApiAvailable) {
      console.log('Using ComposioHQ API for search')
      const results = await composioAPI.search(query)
      
      if (results.length > 0) {
        return results
      }
    }

    // Fallback to mock API
    console.log('Falling back to mock API')
    const { mockSearchAPI } = await import('./mockApi')
    return mockSearchAPI.search(query)
  }
}
