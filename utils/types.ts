export interface SearchResult {
  id: string
  query: string
  summary: string
  confidence: number
  sources: Source[]
  relatedQuestions: string[]
  timestamp: string
}

export interface Source {
  id: string
  title: string
  platform: "slack" | "github" | "jira" | "confluence" | "email"
  url: string
  snippet: string
  date: string
  participants: string[]
}

export interface GraphNode {
  id: string
  label: string
  type:
    | "person"
    | "project"
    | "document"
    | "decision"
    | "jira"
    | "pr"
    | "slack"
    | "file"
  metadata: Record<string, any>
}

export interface GraphEdge {
  source: string
  target: string
  relationship: string
  strength: number
}

export interface TimelineEvent {
  id: string
  title: string
  description: string
  date: string
  participants: string[]
  sources: Source[]
  type: "decision" | "milestone" | "discussion" | "incident"
}

export interface ProactiveInsight {
  id: string
  title: string
  summary: string
  priority: "high" | "medium" | "low"
  category: "decision" | "risk" | "opportunity" | "update"
  sources: Source[]
  actionable: boolean
}

// Executive Dashboard Types
export interface KnowledgeHealthKPI {
  metric:
    | "concentration_risk"
    | "decision_velocity"
    | "expertise_distribution"
    | "documentation_coverage"
  score: number
  trend: "improving" | "declining" | "stable"
  riskLevel: "low" | "moderate" | "high" | "critical"
  description: string
  targetScore?: number
  benchmarkScore?: number
}

export interface PersonRisk {
  employeeId: string
  name: string
  role: string
  expertiseAreas: string[]
  uniqueKnowledgeScore: number
  tenure: number
  hasSuccessor: boolean
  documentationScore: number
}

export interface TeamRiskProfile {
  teamId: string
  teamName: string
  department: string
  riskScore: number
  busFactor: number
  criticalKnowledgeAreas: string[]
  keyPersonnel: PersonRisk[]
  successionPlan: "complete" | "in_progress" | "not_started"
  mitigationStatus: "good" | "moderate" | "at_risk"
}

export interface RevisitedDecision {
  id: string
  title: string
  count: number
  team: string
}

export interface DepartmentImpact {
  from: string
  to: string
  weight: number
}

export interface DecisionAnalytics {
  totalDecisions: number
  averageDecisionTime: number
  policyReversals: number
  strategicAlignment: number
  revisitedDecisions: RevisitedDecision[]
  crossDepartmentImpact: DepartmentImpact[]
}

export interface StrategicInsight {
  id: string
  type: "pattern_recognition" | "efficiency_alert" | "risk_indicator" | "opportunity"
  title: string
  description: string
  impactLevel: "low" | "medium" | "high" | "critical"
  recommendations: string[]
  affectedTeams: string[]
  dataPoints: any[]
  confidenceScore: number
}

export interface Department {
  id: string
  name: string
}

export interface ConnectionStrength {
  from: string
  to: string
  strength: number
}

export interface Bottleneck {
  department: string
  description: string
}

export interface KnowledgeFlowMap {
  departments: Department[]
  communicationStrength: ConnectionStrength[]
  informationBottlenecks: Bottleneck[]
  collaborationOpportunities: string[]
}
