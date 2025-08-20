"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Download, Building2, LogOut } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { KPIDashboard } from "./KPIDashboard"
import { RiskAssessment } from "./RiskAssessment"
import { DecisionAnalyticsPanel } from "./DecisionAnalytics"
import { TeamIntelligence } from "./TeamIntelligence"

export function ExecutiveDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const { toast } = useToast()

  const handleExport = () => {
    toast({ title: "Export queued", description: "A PDF export will be generated for the current dashboard." })
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-background/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Building2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-semibold">Executive Knowledge Health</h1>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" /> Export PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  const { signOut } = await import("next-auth/react")
                  await signOut({ redirect: false })
                  window.location.href = "/auth/login"
                }}
              >
                <LogOut className="h-4 w-4 mr-2" /> Logout
              </Button>
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder-user.png" />
                <AvatarFallback>EX</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 bg-muted/50 border border-border">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Overview
            </TabsTrigger>
            <TabsTrigger value="risk" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Risk Assessment
            </TabsTrigger>
            <TabsTrigger value="insights" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Strategic Insights
            </TabsTrigger>
            <TabsTrigger value="team" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Team Intelligence
            </TabsTrigger>
          </TabsList>

          <div className="mt-6 space-y-6">
            <TabsContent value="overview" className="mt-0">
              <KPIDashboard />
            </TabsContent>

            <TabsContent value="risk" className="mt-0">
              <RiskAssessment />
            </TabsContent>

            <TabsContent value="insights" className="mt-0">
              <DecisionAnalyticsPanel />
            </TabsContent>

            <TabsContent value="team" className="mt-0">
              <TeamIntelligence />
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  )
}


