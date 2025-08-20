"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Building2, User, Moon, Sun, LogOut } from "lucide-react"
import { useTheme } from "next-themes"
import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"

import { SearchInterface } from "@/components/search/SearchInterface"
import { KnowledgeGraph } from "@/components/graph/KnowledgeGraph"
import { StoriesTimeline } from "@/components/timeline/StoriesTimeline"
import { InsightsDashboard } from "@/components/insights/InsightsDashboard"
import { ChatWithDocs } from "@/components/chat/ChatWithDocs"

export function Dashboard() {
  const [activeTab, setActiveTab] = useState("search")
  const { theme, setTheme } = useTheme()
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-background/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Building2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-semibold text-foreground">H8M</h1>
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  await signOut({ redirect: false })
                  router.push("/auth/login")
                }}
                className="h-8 px-2 text-muted-foreground"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>

              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder-user.png" />
                <AvatarFallback className="bg-muted">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-muted/50 border border-border">
            <TabsTrigger
              value="search"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground"
            >
              Search
            </TabsTrigger>
            <TabsTrigger
              value="graph"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground"
            >
              Knowledge Graph
            </TabsTrigger>
            <TabsTrigger
              value="stories"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground"
            >
              Stories Timeline
            </TabsTrigger>
            <TabsTrigger
              value="insights"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground"
            >
              Insights
            </TabsTrigger>
            <TabsTrigger
              value="chat"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground"
            >
              Chat with Docs
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="search" className="mt-0">
              <SearchInterface />
            </TabsContent>

            <TabsContent value="graph" className="mt-0">
              <KnowledgeGraph />
            </TabsContent>

            <TabsContent value="stories" className="mt-0">
              <StoriesTimeline />
            </TabsContent>

            <TabsContent value="insights" className="mt-0">
              <InsightsDashboard />
            </TabsContent>

            <TabsContent value="chat" className="mt-0">
              <ChatWithDocs />
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  )
}
