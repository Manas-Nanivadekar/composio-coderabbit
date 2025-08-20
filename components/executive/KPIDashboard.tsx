"use client"

import { useState } from "react"
import { 
  AlertTriangle, 
  TrendingUp, 
  FileText, 
  Users, 
  Clock, 
  Target, 
  ArrowRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Calendar,
  Briefcase,
  Settings,
  X
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Enhanced data types with business context
interface KeyExpert {
  id: string
  name: string
  role: string
  expertise: string[]
  criticalProjects: string[]
  riskScore: number
  yearsWithCompany: number
  lastKnowledgeShare: string
  successorProgress: number
}

interface ProjectRisk {
  id: string
  name: string
  team: string
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'
  missingDocs: string[]
  lastUpdated: string
  impact: string
  assignedTo?: string
  dueDate?: string
}

interface DecisionCase {
  project: string
  decision: string
  timeframe: string
  improvement: string
  details: string
  businessImpact: string
  stakeholders: string[]
  timeline: Array<{
    date: string
    event: string
    duration: string
  }>
}

interface TeamRiskData {
  team: string
  overallRisk: number
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'
  keyIssues: string[]
  projectsAffected: number
  actionRequired: boolean
}

export function KPIDashboard() {
  const [selectedView, setSelectedView] = useState<'overview' | 'knowledge' | 'decisions' | 'documentation' | 'heatmap'>('overview')
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<string>('all')
  const [selectedExpert, setSelectedExpert] = useState<KeyExpert | null>(null)
  const [selectedProject, setSelectedProject] = useState<ProjectRisk | null>(null)

  // Enhanced mock data with realistic business scenarios
  const dashboardData = {
    knowledgeRisk: {
      score: 78,
      level: 'HIGH' as const,
      keyExperts: [
        {
          id: 'exp1',
          name: 'Sarah Chen',
          role: 'Senior Backend Engineer',
          expertise: ['Legacy Payment System', 'Database Architecture', 'PCI Compliance'],
          criticalProjects: ['Payment Modernization', 'Data Migration Project', 'Compliance Audit'],
          riskScore: 85,
          yearsWithCompany: 6,
          lastKnowledgeShare: '2024-06-15',
          successorProgress: 25
        },
        {
          id: 'exp2', 
          name: 'Marcus Rodriguez',
          role: 'DevOps Lead',
          expertise: ['Kubernetes Infrastructure', 'CI/CD Pipeline', 'AWS Architecture'],
          criticalProjects: ['Infrastructure Modernization', 'Multi-Region Deployment', 'Security Hardening'],
          riskScore: 82,
          yearsWithCompany: 4,
          lastKnowledgeShare: '2024-07-01',
          successorProgress: 40
        },
        {
          id: 'exp3',
          name: 'Lisa Thompson',
          role: 'Frontend Architecture Lead',
          expertise: ['React Ecosystem', 'Design System', 'Performance Optimization'],
          criticalProjects: ['Customer Portal Redesign', 'Mobile App Launch', 'Component Library'],
          riskScore: 75,
          yearsWithCompany: 5,
          lastKnowledgeShare: '2024-07-20',
          successorProgress: 60
        }
      ] as KeyExpert[],
      affectedProjects: 8,
      businessImpact: 'High risk of project delays and quality issues if key experts become unavailable'
    },
    documentationHealth: {
      score: 73,
      level: 'MODERATE' as const,
      projectsAtRisk: [
        {
          id: 'proj1',
          name: 'API Gateway Refactor',
          team: 'Backend Engineering',
          riskLevel: 'HIGH' as const,
          missingDocs: ['API Documentation', 'Deployment Guide', 'Rollback Procedures'],
          lastUpdated: '2024-07-15',
          impact: 'Deployment delays and potential outages during releases',
          assignedTo: 'Mike Johnson',
          dueDate: '2024-08-30'
        },
        {
          id: 'proj2',
          name: 'Customer Analytics Platform',
          team: 'Data Engineering',
          riskLevel: 'MODERATE' as const,
          missingDocs: ['Data Schema Documentation', 'Pipeline Monitoring Guide'],
          lastUpdated: '2024-07-22',
          impact: 'Difficult maintenance and troubleshooting of data pipelines',
          dueDate: '2024-09-15'
        },
        {
          id: 'proj3',
          name: 'Mobile Authentication System',
          team: 'Mobile Team',
          riskLevel: 'CRITICAL' as const,
          missingDocs: ['Security Architecture', 'Integration Guide', 'Testing Procedures'],
          lastUpdated: '2024-06-30',
          impact: 'Security vulnerabilities and integration failures',
          assignedTo: 'Jennifer Lee',
          dueDate: '2024-08-15'
        }
      ] as ProjectRisk[],
      improvementNeeded: 27,
      totalProjects: 15
    },
    decisionVelocity: {
      improvement: 4.2,
      timeframe: 'vs Q3 2024',
      trend: 'UP' as const,
      cases: [
        {
          project: 'Mobile Architecture Redesign',
          decision: 'Switch from React Native to Flutter',
          timeframe: '3 days (previously 7 days)',
          improvement: '4 days faster',
          details: 'Team leveraged previous mobile framework evaluation research and cross-platform performance benchmarks',
          businessImpact: '$120K saved in development costs, 2 weeks faster time-to-market',
          stakeholders: ['Mobile Team', 'Product Management', 'QA Team'],
          timeline: [
            { date: '2024-07-01', event: 'Decision initiated', duration: '0 days' },
            { date: '2024-07-02', event: 'Research review completed', duration: '1 day' },
            { date: '2024-07-03', event: 'Stakeholder alignment', duration: '1 day' },
            { date: '2024-07-04', event: 'Final decision approved', duration: '1 day' }
          ]
        },
        {
          project: 'Database Migration Strategy',
          decision: 'Adopt PostgreSQL over MongoDB for new services',
          timeframe: '2 days (previously 5 days)',
          improvement: '3 days faster',
          details: 'Used existing performance benchmarks and team expertise assessment from previous evaluations',
          businessImpact: '$80K reduced infrastructure costs annually, improved query performance by 40%',
          stakeholders: ['Backend Team', 'Database Administrators', 'Infrastructure Team'],
          timeline: [
            { date: '2024-07-10', event: 'Performance analysis', duration: '1 day' },
            { date: '2024-07-11', event: 'Team capability review', duration: '0.5 days' },
            { date: '2024-07-12', event: 'Decision finalized', duration: '0.5 days' }
          ]
        }
      ] as DecisionCase[]
    },
    teamRiskHeatmap: [
      {
        team: 'Backend Engineering',
        overallRisk: 85,
        riskLevel: 'HIGH' as const,
        keyIssues: ['Knowledge concentration in Sarah Chen', 'Outdated API documentation'],
        projectsAffected: 3,
        actionRequired: true
      },
      {
        team: 'Frontend Engineering',
        overallRisk: 65,
        riskLevel: 'MODERATE' as const,
        keyIssues: ['Design system documentation gaps', 'Performance optimization knowledge'],
        projectsAffected: 2,
        actionRequired: true
      },
      {
        team: 'Data Engineering',
        overallRisk: 70,
        riskLevel: 'MODERATE' as const,
        keyIssues: ['Pipeline monitoring procedures missing', 'Data schema documentation'],
        projectsAffected: 2,
        actionRequired: true
      },
      {
        team: 'DevOps',
        overallRisk: 75,
        riskLevel: 'HIGH' as const,
        keyIssues: ['Infrastructure knowledge concentration', 'Disaster recovery procedures'],
        projectsAffected: 4,
        actionRequired: true
      },
      {
        team: 'Mobile Team',
        overallRisk: 45,
        riskLevel: 'LOW' as const,
        keyIssues: ['Good documentation practices', 'Well-distributed knowledge'],
        projectsAffected: 1,
        actionRequired: false
      },
      {
        team: 'QA Engineering',
        overallRisk: 55,
        riskLevel: 'MODERATE' as const,
        keyIssues: ['Test automation documentation', 'Quality metrics tracking'],
        projectsAffected: 1,
        actionRequired: false
      }
    ] as TeamRiskData[]
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-200 dark:border-red-800'
      case 'HIGH': return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700'
      case 'MODERATE': return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700'
      case 'LOW': return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700'
      default: return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700'
    }
  }

  const getHeatmapColor = (risk: number) => {
    if (risk >= 80) return 'bg-red-500'
    if (risk >= 70) return 'bg-orange-500'
    if (risk >= 60) return 'bg-yellow-500'
    if (risk >= 40) return 'bg-blue-500'
    return 'bg-green-500'
  }

  return (
    <div className="space-y-6">
      {/* Strategic Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg p-6 border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Strategic Knowledge Dashboard</h1>
            <p className="text-muted-foreground">Transform insights into action • Last updated: {new Date().toLocaleString()}</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="px-3 py-1">
              <Users className="h-4 w-4 mr-1" />
              Manager View
            </Badge>
          </div>
        </div>
      </div>

      <Tabs value={selectedView} onValueChange={(value) => setSelectedView(value as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Strategic Overview
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Knowledge Risk
          </TabsTrigger>
          <TabsTrigger value="decisions" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Decision Velocity
          </TabsTrigger>
          <TabsTrigger value="documentation" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documentation Health
          </TabsTrigger>
          <TabsTrigger value="heatmap" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Risk Heatmap
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Knowledge Risk Card - Enhanced with Clarity */}
            <Card className="border-l-4 border-l-red-500">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    Knowledge Risk
                  </CardTitle>
                  <Badge className={getRiskColor(dashboardData.knowledgeRisk.level)}>
                    {dashboardData.knowledgeRisk.score} ({dashboardData.knowledgeRisk.level})
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-foreground">
                  <strong>Critical Alert:</strong> We have a high risk of knowledge loss. Our top{' '}
                  <button 
                    onClick={() => setSelectedView('knowledge')}
                    className="text-red-600 hover:text-red-800 underline font-semibold"
                  >
                    {dashboardData.knowledgeRisk.keyExperts.length} experts
                  </button>{' '}
                  hold critical information across{' '}
                  <span className="font-semibold">{dashboardData.knowledgeRisk.affectedProjects} projects</span>.
                </p>
                
                <div className="bg-red-50 dark:bg-red-950 p-3 rounded border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-800 dark:text-red-200">
                    <strong>Business Impact:</strong> {dashboardData.knowledgeRisk.businessImpact}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={() => setSelectedView('knowledge')} 
                    className="bg-red-600 hover:bg-red-700 text-white"
                    size="sm"
                  >
                    View Expert Details <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Decision Velocity Card - Enhanced with Context */}
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Decision Velocity
                  </CardTitle>
                  <Badge className="bg-green-50 text-green-700 border-green-200">
                    +{dashboardData.decisionVelocity.improvement} days faster
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-foreground">
                  Our teams are making decisions <strong>{dashboardData.decisionVelocity.improvement} days faster</strong> {dashboardData.decisionVelocity.timeframe}. 
                  In{' '}
                  <button 
                    onClick={() => setSelectedView('decisions')}
                    className="text-green-600 hover:text-green-800 underline font-semibold"
                  >
                    {dashboardData.decisionVelocity.cases[0].project}
                  </button>
                  , we made a key pivot 4 days faster than similar projects.
                </p>

                <div className="grid grid-cols-2 gap-3">
                  {dashboardData.decisionVelocity.cases.slice(0, 2).map((case_, index) => (
                    <div key={index} className="bg-green-50 dark:bg-green-950 p-3 rounded border border-green-200 dark:border-green-800">
                      <div className="font-medium text-green-800 dark:text-green-200 text-sm">{case_.project}</div>
                      <div className="text-green-700 dark:text-green-300 text-xs mt-1">{case_.businessImpact.split(',')[0]}</div>
                      <button
                        onClick={() => setSelectedView('decisions')}
                        className="text-green-600 hover:text-green-800 text-xs underline mt-2 flex items-center gap-1"
                      >
                        View timeline <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>

                <Button 
                  onClick={() => setSelectedView('decisions')} 
                  variant="outline"
                  className="w-full"
                  size="sm"
                >
                  View All Decision Cases
                </Button>
              </CardContent>
            </Card>

            {/* Documentation Health Card - Enhanced with Call to Action */}
            <Card className="border-l-4 border-l-yellow-500">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-yellow-600" />
                    Documentation Health
                  </CardTitle>
                  <Badge className={getRiskColor(dashboardData.documentationHealth.level)}>
                    {dashboardData.documentationHealth.score} ({dashboardData.documentationHealth.level})
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-foreground">
                  Documentation is a growing risk.{' '}
                  <button 
                    onClick={() => setSelectedView('documentation')}
                    className="text-yellow-600 hover:text-yellow-800 underline font-semibold"
                  >
                    {dashboardData.documentationHealth.improvementNeeded}% of our critical projects
                  </button>{' '}
                  lack essential documentation from the last quarter.
                </p>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">High Risk Projects:</span>
                    <span className="font-semibold text-red-600">
                      {dashboardData.documentationHealth.projectsAtRisk.filter(p => p.riskLevel === 'HIGH' || p.riskLevel === 'CRITICAL').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Immediate Action Needed:</span>
                    <span className="font-semibold text-orange-600">
                      {dashboardData.documentationHealth.projectsAtRisk.filter(p => p.assignedTo).length} assigned
                    </span>
                  </div>
                </div>

                <Button 
                  onClick={() => setSelectedView('documentation')} 
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                  size="sm"
                >
                  Assign Documentation Tasks
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Quick Action Center */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Strategic Action Center
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  onClick={() => setSelectedView('heatmap')} 
                  className="h-16 flex-col gap-2"
                  variant="outline"
                >
                  <Eye className="h-5 w-5" />
                  <span>Team Risk Overview</span>
                </Button>
                <Button 
                  onClick={() => setSelectedView('knowledge')} 
                  className="h-16 flex-col gap-2 bg-red-600 hover:bg-red-700 text-white"
                >
                  <AlertTriangle className="h-5 w-5" />
                  <span>Address Knowledge Risk</span>
                </Button>
                <Button 
                  onClick={() => setSelectedView('documentation')} 
                  className="h-16 flex-col gap-2 bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  <Briefcase className="h-5 w-5" />
                  <span>Assign Doc Tasks</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enhanced Knowledge Risk Tab */}
        <TabsContent value="knowledge" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Critical Knowledge Experts - Action Required
              </CardTitle>
              <p className="text-muted-foreground">
                These experts hold critical knowledge that poses business risk. Click on any expert for succession planning options.
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {dashboardData.knowledgeRisk.keyExperts.map((expert) => (
                  <Card key={expert.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedExpert(expert)}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-foreground">{expert.name}</h3>
                          <p className="text-sm text-muted-foreground">{expert.role}</p>
                        </div>
                        <Badge className={getRiskColor('HIGH')}>
                          Risk: {expert.riskScore}
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-foreground mb-1">Critical Expertise:</p>
                          <div className="flex flex-wrap gap-1">
                            {expert.expertise.map((skill, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">{skill}</Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-foreground mb-1">Critical Projects:</p>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {expert.criticalProjects.map((project, idx) => (
                              <li key={idx} className="flex items-center gap-2">
                                <AlertCircle className="h-3 w-3 text-red-500" />
                                {project}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded border border-blue-200 dark:border-blue-800">
                          <div className="flex items-center justify-between text-sm">
                            <span>Successor Training Progress:</span>
                            <span className="font-semibold">{expert.successorProgress}%</span>
                          </div>
                          <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2 mt-1">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${expert.successorProgress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          View Succession Plan
                        </Button>
                        <Button size="sm" variant="outline">
                          Schedule Knowledge Share
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enhanced Decision Velocity Tab */}
        <TabsContent value="decisions" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Decision Velocity Success Stories
              </CardTitle>
              <p className="text-muted-foreground">
                Recent examples of accelerated decision-making and their business impact
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {dashboardData.decisionVelocity.cases.map((case_, index) => (
                  <Card key={index} className="border-l-4 border-l-green-500">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-foreground text-lg">{case_.project}</h3>
                          <p className="text-muted-foreground">{case_.decision}</p>
                        </div>
                        <Badge className="bg-green-50 text-green-700 border-green-200">
                          {case_.improvement}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <h4 className="font-medium text-foreground mb-2">Timeline Efficiency</h4>
                          <p className="text-sm text-muted-foreground mb-3">{case_.timeframe}</p>
                          <div className="space-y-2">
                            {case_.timeline.map((event, idx) => (
                              <div key={idx} className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">{event.event}</span>
                                    <span className="text-xs text-muted-foreground">{event.duration}</span>
                                  </div>
                                  <span className="text-xs text-muted-foreground">{event.date}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-foreground mb-2">Business Impact</h4>
                          <div className="bg-green-50 dark:bg-green-950 p-4 rounded border border-green-200 dark:border-green-800">
                            <p className="text-sm text-green-800 dark:text-green-200 font-semibold mb-2">{case_.businessImpact}</p>
                            <p className="text-sm text-green-700 dark:text-green-300">{case_.details}</p>
                          </div>
                          
                          <div className="mt-3">
                            <p className="text-sm font-medium text-foreground mb-1">Key Stakeholders:</p>
                            <div className="flex flex-wrap gap-1">
                              {case_.stakeholders.map((stakeholder, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">{stakeholder}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        View Full Case Study
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enhanced Documentation Health Tab */}
        <TabsContent value="documentation" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Project Documentation Health - Action Items
              </CardTitle>
              <p className="text-muted-foreground">
                Projects with critical documentation gaps requiring immediate attention
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.documentationHealth.projectsAtRisk.map((project) => (
                  <Card key={project.id} className={`border-l-4 ${project.riskLevel === 'CRITICAL' ? 'border-l-red-600' : project.riskLevel === 'HIGH' ? 'border-l-red-400' : 'border-l-yellow-400'}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-foreground">{project.name}</h3>
                            <Badge className={getRiskColor(project.riskLevel)}>
                              {project.riskLevel} RISK
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{project.team} • Last updated: {project.lastUpdated}</p>
                        </div>
                        {project.dueDate && (
                          <div className="text-right">
                            <p className="text-sm font-medium text-foreground">Due Date</p>
                            <p className="text-sm text-muted-foreground">{project.dueDate}</p>
                          </div>
                        )}
                      </div>

                      <div className="bg-red-50 dark:bg-red-950 p-4 rounded border border-red-200 dark:border-red-800 mb-4">
                        <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">Business Impact:</p>
                        <p className="text-sm text-red-700 dark:text-red-300">{project.impact}</p>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm font-medium text-foreground mb-2">Missing Documentation:</p>
                        <div className="flex flex-wrap gap-2">
                          {project.missingDocs.map((doc, idx) => (
                            <Badge key={idx} variant="destructive" className="text-sm">
                              {doc}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {project.assignedTo ? (
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-sm text-foreground">Assigned to: <strong>{project.assignedTo}</strong></span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <XCircle className="h-4 w-4 text-red-600" />
                              <span className="text-sm text-muted-foreground">Not assigned</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          {!project.assignedTo && (
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                              Assign Task
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            View Project Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enhanced Risk Heatmap Tab */}
        <TabsContent value="heatmap" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Team Risk Heatmap - Interactive Overview
              </CardTitle>
              <p className="text-muted-foreground">
                Click on any team square to drill down into specific risks and action items
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {dashboardData.teamRiskHeatmap.map((team) => (
                  <div
                    key={team.team}
                    onClick={() => setSelectedTeamFilter(team.team)}
                    className={`${getHeatmapColor(team.overallRisk)} p-6 rounded-lg text-white cursor-pointer hover:opacity-80 transition-all transform hover:scale-105`}
                  >
                    <div className="text-center">
                      <h3 className="font-semibold mb-2">{team.team}</h3>
                      <div className="text-2xl font-bold mb-1">{team.overallRisk}</div>
                      <div className="text-sm opacity-90">{team.riskLevel}</div>
                      <div className="text-xs opacity-75 mt-2">
                        {team.projectsAffected} projects affected
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {selectedTeamFilter !== 'all' && (
                <Card className="border-2 border-blue-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{selectedTeamFilter} - Detailed Risk Analysis</CardTitle>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => setSelectedTeamFilter('all')}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Close
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const teamData = dashboardData.teamRiskHeatmap.find(t => t.team === selectedTeamFilter)
                      if (!teamData) return null
                      
                      return (
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <Badge className={getRiskColor(teamData.riskLevel)} size="lg">
                              Risk Score: {teamData.overallRisk} ({teamData.riskLevel})
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {teamData.projectsAffected} projects affected
                            </span>
                            {teamData.actionRequired && (
                              <Badge variant="destructive">Action Required</Badge>
                            )}
                          </div>

                          <div>
                            <h4 className="font-medium text-foreground mb-2">Key Risk Factors:</h4>
                            <ul className="space-y-1">
                              {teamData.keyIssues.map((issue, idx) => (
                                <li key={idx} className="flex items-center gap-2 text-sm">
                                  <AlertCircle className="h-4 w-4 text-red-500" />
                                  {issue}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {teamData.actionRequired && (
                            <div className="bg-red-50 dark:bg-red-950 p-4 rounded border border-red-200 dark:border-red-800">
                              <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">Immediate Actions Required:</h4>
                              <div className="flex gap-2">
                                <Button size="sm" className="bg-red-600 hover:bg-red-700">
                                  Assign Risk Mitigation Tasks
                                </Button>
                                <Button size="sm" variant="outline">
                                  Schedule Team Review
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })()} 
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}


