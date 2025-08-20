import type {
  SearchResult,
  Source,
  GraphNode,
  GraphEdge,
  TimelineEvent,
  ProactiveInsight,
  KnowledgeHealthKPI,
  TeamRiskProfile,
  DecisionAnalytics,
  StrategicInsight,
  KnowledgeFlowMap,
} from "./types"

// Mock data
const mockSources: Source[] = [
  {
    id: "1",
    title: "Redis Integration for Auth Service - PR #1247",
    platform: "github",
    url: "#",
    snippet:
      "Added Redis caching layer to auth service for session management. Reduces database load by 70% and improves response times from 200ms to 45ms.",
    date: "2024-01-15",
    participants: ["john.doe", "sarah.backend", "mike.devops"],
  },
  {
    id: "2",
    title: "GraphQL Migration Discussion",
    platform: "slack",
    url: "#",
    snippet:
      "Team consensus on migrating from REST to GraphQL for better client flexibility. Frontend team excited about reduced over-fetching.",
    date: "2024-01-12",
    participants: ["emma.frontend", "alex.fullstack", "tom.mobile"],
  },
  {
    id: "3",
    title: "AUTH-456: Implement OAuth 2.0 for Mobile App",
    platform: "jira",
    url: "#",
    snippet:
      "Story: As a mobile user, I want secure login so that my data is protected. Includes JWT token refresh and biometric authentication support.",
    date: "2024-01-10",
    participants: ["tom.mobile", "security.team"],
  },
  {
    id: "4",
    title: "CI Pipeline Failure Investigation",
    platform: "github",
    url: "#",
    snippet:
      "Build #2847 failed due to Docker layer caching issue. Fixed by updating base image and clearing cache. Added monitoring to prevent future occurrences.",
    date: "2024-01-08",
    participants: ["mike.devops", "ci.bot"],
  },
  {
    id: "5",
    title: "MOBILE-789: Release Blocker - Payment Integration",
    platform: "jira",
    url: "#",
    snippet:
      "Critical bug in Stripe integration causing payment failures on iOS. Affects 15% of transactions. Hotfix deployed, full fix in next sprint.",
    date: "2024-01-05",
    participants: ["tom.mobile", "payments.team", "qa.lead"],
  },
  {
    id: "6",
    title: "Caching Layer Architecture Decision",
    platform: "confluence",
    url: "#",
    snippet:
      "Technical RFC: Implementing multi-layer caching with Redis and CDN. Includes cache invalidation strategies and performance benchmarks.",
    date: "2024-01-03",
    participants: ["john.doe", "sarah.backend", "architecture.team"],
  },
]

const generateMockResults = (query: string): SearchResult[] => {
  const relevantSources = mockSources.filter(
    (source) =>
      source.title.toLowerCase().includes(query.toLowerCase()) ||
      source.snippet.toLowerCase().includes(query.toLowerCase()),
  )

  if (relevantSources.length === 0) {
    // Return some default results for any query
    return mockSources.slice(0, 3).map((source, index) => ({
      id: `result-${index}`,
      query,
      summary: `Based on your search for "${query}", here's what I found: ${source.snippet}`,
      confidence: 0.7 + Math.random() * 0.3,
      sources: [source],
      relatedQuestions: [
        `How does ${query} affect our current architecture?`,
        `What are the performance implications of ${query}?`,
        `Who has worked on similar ${query} implementations?`,
      ],
      timestamp: new Date().toISOString(),
    }))
  }

  return relevantSources.map((source, index) => ({
    id: `result-${index}`,
    query,
    summary: `${source.snippet} This change was implemented by ${source.participants[0]} and reviewed by the team.`,
    confidence: 0.8 + Math.random() * 0.2,
    sources: [source, ...mockSources.filter((s) => s.id !== source.id).slice(0, 1)],
    relatedQuestions: [
      `What was the impact of ${source.title}?`,
      `Are there any follow-up tasks for ${source.title}?`,
      `How does this relate to our current sprint goals?`,
    ],
    timestamp: source.date,
  }))
}

const mockGraphNodes: GraphNode[] = [
  {
    id: "john-doe",
    label: "John Doe",
    type: "person",
    metadata: {
      role: "Senior Backend Developer",
      team: "Backend",
      expertise: ["Node.js", "Redis", "PostgreSQL", "Microservices"],
    },
  },
  {
    id: "sarah-backend",
    label: "Sarah Chen",
    type: "person",
    metadata: {
      role: "Backend Developer",
      team: "Backend",
      expertise: ["Python", "Django", "Docker", "AWS"],
    },
  },
  {
    id: "emma-frontend",
    label: "Emma Davis",
    type: "person",
    metadata: {
      role: "Frontend Lead",
      team: "Frontend",
      expertise: ["React", "TypeScript", "GraphQL", "Next.js"],
    },
  },
  {
    id: "mike-devops",
    label: "Mike Wilson",
    type: "person",
    metadata: {
      role: "DevOps Engineer",
      team: "Infrastructure",
      expertise: ["Kubernetes", "CI/CD", "AWS", "Terraform"],
    },
  },
  {
    id: "auth-service",
    label: "Auth Service",
    type: "project",
    metadata: {
      repository: "backend/auth-service",
      status: "Active",
      language: "Node.js",
      lastDeploy: "2024-01-15",
    },
  },
  {
    id: "mobile-app",
    label: "Mobile App",
    type: "project",
    metadata: {
      repository: "mobile/react-native-app",
      status: "In Development",
      language: "React Native",
      lastDeploy: "2024-01-10",
    },
  },
  {
    id: "graphql-api",
    label: "GraphQL API",
    type: "project",
    metadata: {
      repository: "backend/graphql-gateway",
      status: "Planning",
      language: "Node.js",
      estimatedStart: "2024-02-01",
    },
  },
  {
    id: "redis-integration",
    label: "Redis Caching",
    type: "decision",
    metadata: {
      date: "2024-01-15",
      impact: "High",
      performance: "+70% faster auth",
    },
  },
  {
    id: "oauth-implementation",
    label: "OAuth 2.0 Implementation",
    type: "decision",
    metadata: {
      date: "2024-01-10",
      impact: "High",
      security: "Enhanced mobile security",
    },
  },
  {
    id: "ci-pipeline",
    label: "CI/CD Pipeline",
    type: "document",
    metadata: {
      lastUpdated: "2024-01-08",
      author: "mike-devops",
      buildTime: "3.2 minutes",
    },
  },
  // Developer-centric entities
  { id: "JIRA-123", label: "JIRA-123", type: "jira", metadata: { summary: "Fix auth session bug", status: "Done" } },
  { id: "PR-456", label: "PR #456", type: "pr", metadata: { title: "Fix session cache race", author: "john-doe" } },
  {
    id: "SLACK-auth-thread",
    label: "Slack: auth-api discussion",
    type: "slack",
    metadata: { channel: "#backend", topic: "auth-api race condition", messages: 23 },
  },
  {
    id: "file-auth-session.ts",
    label: "auth/session.ts",
    type: "file",
    metadata: { path: "backend/auth/session.ts", owners: ["john-doe", "sarah-backend"], loc: 240 },
  },
]

const mockGraphEdges: GraphEdge[] = [
  { source: "john-doe", target: "auth-service", relationship: "maintains", strength: 0.9 },
  { source: "john-doe", target: "redis-integration", relationship: "implemented", strength: 0.9 },
  { source: "sarah-backend", target: "auth-service", relationship: "contributes", strength: 0.7 },
  { source: "emma-frontend", target: "graphql-api", relationship: "leads", strength: 0.8 },
  { source: "mike-devops", target: "ci-pipeline", relationship: "maintains", strength: 0.9 },
  { source: "auth-service", target: "mobile-app", relationship: "authenticates", strength: 0.8 },
  { source: "redis-integration", target: "auth-service", relationship: "optimizes", strength: 0.9 },
  { source: "oauth-implementation", target: "mobile-app", relationship: "secures", strength: 0.8 },
  { source: "graphql-api", target: "mobile-app", relationship: "serves", strength: 0.7 },
  { source: "ci-pipeline", target: "auth-service", relationship: "deploys", strength: 0.8 },
  { source: "ci-pipeline", target: "mobile-app", relationship: "builds", strength: 0.7 },
  { source: "emma-frontend", target: "oauth-implementation", relationship: "reviewed", strength: 0.6 },
  // Developer-centric relationships with causal direction
  { source: "JIRA-123", target: "SLACK-auth-thread", relationship: "discusses", strength: 0.8 },
  { source: "SLACK-auth-thread", target: "PR-456", relationship: "led to", strength: 0.9 },
  { source: "PR-456", target: "file-auth-session.ts", relationship: "modifies", strength: 0.9 },
  { source: "file-auth-session.ts", target: "auth-service", relationship: "belongs to", strength: 0.7 },
  { source: "PR-456", target: "john-doe", relationship: "authored by", strength: 0.9 },
]

const mockTimelineEvents: TimelineEvent[] = [
  {
    id: "redis-implementation",
    title: "Redis Caching Implementation",
    description:
      "Successfully integrated Redis caching layer into auth service. Performance testing shows 70% reduction in database load and response times improved from 200ms to 45ms. All unit tests passing.",
    date: "2024-01-15",
    participants: ["john.doe", "sarah.backend", "qa.team"],
    sources: [mockSources[0]],
    type: "milestone",
  },
  {
    id: "graphql-planning",
    title: "GraphQL Migration Planning",
    description:
      "Team alignment meeting on GraphQL migration strategy. Frontend team presented benefits of reduced over-fetching. Backend team outlined implementation timeline and breaking change considerations.",
    date: "2024-01-12",
    participants: ["emma.frontend", "alex.fullstack", "john.doe"],
    sources: [mockSources[1]],
    type: "discussion",
  },
  {
    id: "oauth-completion",
    title: "OAuth 2.0 Mobile Implementation Complete",
    description:
      "Mobile OAuth 2.0 implementation finished ahead of schedule. Includes JWT token refresh, biometric authentication, and secure keychain storage. Ready for QA testing.",
    date: "2024-01-10",
    participants: ["tom.mobile", "security.team", "john.doe"],
    sources: [mockSources[2]],
    type: "milestone",
  },
  {
    id: "ci-pipeline-fix",
    title: "CI Pipeline Issue Resolved",
    description:
      "Critical CI pipeline failure caused by Docker layer caching issue. Root cause identified and fixed within 2 hours. Added monitoring alerts to prevent similar issues.",
    date: "2024-01-08",
    participants: ["mike.devops", "john.doe"],
    sources: [mockSources[3]],
    type: "incident",
  },
  {
    id: "payment-hotfix",
    title: "Payment Integration Hotfix Deployed",
    description:
      "Emergency hotfix deployed for Stripe payment integration bug affecting iOS users. Issue resolved, monitoring shows 0% failure rate. Full fix scheduled for next sprint.",
    date: "2024-01-05",
    participants: ["tom.mobile", "payments.team", "mike.devops"],
    sources: [mockSources[4]],
    type: "incident",
  },
  {
    id: "caching-architecture",
    title: "Caching Architecture Decision",
    description:
      "Technical RFC approved for multi-layer caching strategy. Architecture team signed off on Redis + CDN approach. Implementation to begin next quarter with performance benchmarks.",
    date: "2024-01-03",
    participants: ["architecture.team", "john.doe", "sarah.backend"],
    sources: [mockSources[5]],
    type: "decision",
  },
]

const mockProactiveInsights: ProactiveInsight[] = [
  {
    id: "redis-performance-impact",
    title: "Redis integration affects your API response times",
    summary:
      "John's Redis caching implementation in auth service will improve your API calls by ~70%. Consider updating your timeout configurations and removing client-side caching workarounds.",
    priority: "high",
    category: "opportunity",
    sources: [mockSources[0]],
    actionable: true,
  },
  {
    id: "graphql-migration-prep",
    title: "GraphQL migration requires frontend updates",
    summary:
      "Emma's team is planning GraphQL migration for Q2. Your REST API calls will need updating. Start identifying which endpoints you use most frequently.",
    priority: "medium",
    category: "decision",
    sources: [mockSources[1]],
    actionable: true,
  },
  {
    id: "oauth-mobile-integration",
    title: "New OAuth flow available for mobile integration",
    summary:
      "Tom completed OAuth 2.0 implementation with biometric support. If you're working on mobile features, you can now use the new secure authentication flow.",
    priority: "medium",
    category: "update",
    sources: [mockSources[2]],
    actionable: true,
  },
  {
    id: "ci-pipeline-monitoring",
    title: "CI pipeline now has better error detection",
    summary:
      "Mike added monitoring to catch Docker caching issues early. Your builds should be more reliable, but watch for new alert notifications in #devops channel.",
    priority: "low",
    category: "update",
    sources: [mockSources[3]],
    actionable: false,
  },
  {
    id: "payment-integration-risk",
    title: "Payment integration patterns to avoid",
    summary:
      "Recent Stripe bug reveals potential issues with iOS payment handling. Review your payment flows for similar error handling patterns, especially around network timeouts.",
    priority: "high",
    category: "risk",
    sources: [mockSources[4]],
    actionable: true,
  },
  {
    id: "caching-strategy-opportunity",
    title: "New caching architecture opens optimization opportunities",
    summary:
      "Approved multi-layer caching strategy creates opportunities for service-level optimizations. Consider how your service could benefit from Redis integration.",
    priority: "medium",
    category: "opportunity",
    sources: [mockSources[5]],
    actionable: true,
  },
  {
    id: "code-review-security",
    title: "Enhanced security reviews now required",
    summary:
      "Following recent security improvements, all PRs touching authentication or payments now require security team review. Plan extra time for your next auth-related changes.",
    priority: "medium",
    category: "decision",
    sources: [mockSources[2]],
    actionable: true,
  },
  {
    id: "performance-benchmarks",
    title: "New performance benchmarks available",
    summary:
      "Redis integration provides new performance baselines. Your service response times can now be compared against the improved auth service metrics.",
    priority: "low",
    category: "update",
    sources: [mockSources[0]],
    actionable: false,
  },
]

export const mockSearchAPI = {
  search: async (query: string): Promise<SearchResult[]> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 500))
    return generateMockResults(query)
  },
}

export const mockGraphAPI = {
  getGraph: async (rootId?: string): Promise<{ nodes: GraphNode[]; edges: GraphEdge[] }> => {
    await new Promise((resolve) => setTimeout(resolve, 800))
    return {
      nodes: mockGraphNodes,
      edges: mockGraphEdges,
    }
  },
}

export const mockTimelineAPI = {
  getTimeline: async (projectId?: string): Promise<TimelineEvent[]> => {
    await new Promise((resolve) => setTimeout(resolve, 800))
    return mockTimelineEvents
  },
}

export const mockInsightsAPI = {
  getInsights: async (userId?: string): Promise<ProactiveInsight[]> => {
    await new Promise((resolve) => setTimeout(resolve, 600))
    return mockProactiveInsights
  },
}

// Executive mock APIs
const executiveKPIs: KnowledgeHealthKPI[] = [
  {
    metric: "concentration_risk",
    score: 78,
    trend: "declining",
    riskLevel: "high",
    description: "15% of critical knowledge held by 3 key people",
    targetScore: 45,
    benchmarkScore: 50,
  },
  {
    metric: "decision_velocity",
    score: 4.2,
    trend: "improving",
    riskLevel: "moderate",
    description: "2.1 days faster than Q3",
    targetScore: 3.5,
    benchmarkScore: 4.8,
  },
  {
    metric: "expertise_distribution",
    score: 85,
    trend: "stable",
    riskLevel: "low",
    description: "No single points of failure",
    targetScore: 90,
    benchmarkScore: 80,
  },
  {
    metric: "documentation_coverage",
    score: 73,
    trend: "improving",
    riskLevel: "moderate",
    description: "27% improvement needed in Q4",
    targetScore: 85,
    benchmarkScore: 70,
  },
]

const executiveTeamRisk: TeamRiskProfile[] = [
  {
    teamId: "eng",
    teamName: "Engineering",
    department: "Technology",
    riskScore: 78,
    busFactor: 2,
    criticalKnowledgeAreas: ["Auth", "Database"],
    keyPersonnel: [],
    successionPlan: "in_progress",
    mitigationStatus: "moderate",
  },
  {
    teamId: "prod",
    teamName: "Product",
    department: "Product",
    riskScore: 55,
    busFactor: 4,
    criticalKnowledgeAreas: ["Roadmap"],
    keyPersonnel: [],
    successionPlan: "complete",
    mitigationStatus: "good",
  },
  {
    teamId: "sales",
    teamName: "Sales",
    department: "Revenue",
    riskScore: 20,
    busFactor: 6,
    criticalKnowledgeAreas: ["CRM"],
    keyPersonnel: [],
    successionPlan: "not_started",
    mitigationStatus: "at_risk",
  },
  {
    teamId: "mkt",
    teamName: "Marketing",
    department: "Growth",
    riskScore: 48,
    busFactor: 3,
    criticalKnowledgeAreas: ["Brand"],
    keyPersonnel: [],
    successionPlan: "in_progress",
    mitigationStatus: "moderate",
  },
]

const executiveDecisionAnalytics: DecisionAnalytics = {
  totalDecisions: 127,
  averageDecisionTime: 4.2,
  policyReversals: 8,
  strategicAlignment: 92,
  revisitedDecisions: [
    { id: "dec1", title: "API Architecture", count: 9, team: "Platform" },
    { id: "dec2", title: "Mobile Release", count: 6, team: "Mobile" },
  ],
  crossDepartmentImpact: [
    { from: "Engineering", to: "Product", weight: 0.8 },
    { from: "Product", to: "Marketing", weight: 0.6 },
    { from: "Engineering", to: "Sales", weight: 0.3 },
  ],
}

const executiveInsights: StrategicInsight[] = [
  {
    id: "si1",
    type: "pattern_recognition",
    title: "Mobile team decisions are revisited 40% more",
    description: "Reopened discussions indicate uncertainty in scope and ownership.",
    impactLevel: "high",
    recommendations: ["Clarify decision owners", "Add pre-decision RFC stage"],
    affectedTeams: ["Mobile", "Platform"],
    dataPoints: [],
    confidenceScore: 0.86,
  },
  {
    id: "si2",
    type: "efficiency_alert",
    title: "API decisions take 3x longer than UI decisions",
    description: "Architecture debates extend cycle time; introduce time-boxed ADRs.",
    impactLevel: "medium",
    recommendations: ["Time-box ADRs", "Introduce architecture council"],
    affectedTeams: ["Platform"],
    dataPoints: [],
    confidenceScore: 0.78,
  },
]

const knowledgeFlowMap: KnowledgeFlowMap = {
  departments: [
    { id: "Engineering", name: "Engineering" },
    { id: "Product", name: "Product" },
    { id: "Marketing", name: "Marketing" },
    { id: "Sales", name: "Sales" },
  ],
  communicationStrength: [
    { from: "Engineering", to: "Product", strength: 0.8 },
    { from: "Product", to: "Marketing", strength: 0.5 },
    { from: "Engineering", to: "Sales", strength: 0.3 },
  ],
  informationBottlenecks: [
    { department: "Engineering", description: "API architecture docs fragmented" },
  ],
  collaborationOpportunities: [
    "Joint API office hours",
    "Shared roadmap rituals",
  ],
}

export const mockExecutiveAPI = {
  getKPIOverview: async (): Promise<KnowledgeHealthKPI[]> => {
    await new Promise((r) => setTimeout(r, 400))
    return executiveKPIs
  },
  getRiskAssessment: async (): Promise<TeamRiskProfile[]> => {
    await new Promise((r) => setTimeout(r, 500))
    return executiveTeamRisk
  },
  getDecisionAnalytics: async (period: string = "quarter"): Promise<DecisionAnalytics> => {
    await new Promise((r) => setTimeout(r, 500))
    return executiveDecisionAnalytics
  },
  getStrategicInsights: async (): Promise<StrategicInsight[]> => {
    await new Promise((r) => setTimeout(r, 400))
    return executiveInsights
  },
  getKnowledgeFlow: async (): Promise<KnowledgeFlowMap> => {
    await new Promise((r) => setTimeout(r, 500))
    return knowledgeFlowMap
  },
}
