"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Upload,
  FileText,
  Search,
  Send,
  Database,
} from "lucide-react"

interface Document {
  id: string
  name: string
  type: string
  size: string
  uploadDate: string
  category: "strategic" | "operational" | "technical" | "hr"
}

interface ChatMessage {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: string
  sources?: string[]
}

export function ChatWithDocs() {
  const [selectedDocs, setSelectedDocs] = useState<string[]>([])
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      type: "assistant",
      content:
        "Hello! I can help you analyze documents and answer questions. Choose documents from the database or upload new ones to get started.",
      timestamp: "10:00 AM",
    },
  ])
  const [inputMessage, setInputMessage] = useState("")

  const mockDocuments: Document[] = [
    {
      id: "1",
      name: "API Architecture Guidelines",
      type: "PDF",
      size: "2.4 MB",
      uploadDate: "2024-01-15",
      category: "technical",
    },
    {
      id: "2",
      name: "Q4 Strategic Plan",
      type: "DOCX",
      size: "1.8 MB",
      uploadDate: "2024-01-10",
      category: "strategic",
    },
    { id: "3", name: "Team Performance Review", type: "PDF", size: "3.2 MB", uploadDate: "2024-01-08", category: "hr" },
    {
      id: "4",
      name: "Database Migration Guide",
      type: "MD",
      size: "856 KB",
      uploadDate: "2024-01-05",
      category: "technical",
    },
    {
      id: "5",
      name: "Risk Assessment Report",
      type: "PDF",
      size: "4.1 MB",
      uploadDate: "2024-01-03",
      category: "strategic",
    },
  ]

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return

    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    const mockResponse: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: "assistant",
      content: `Based on the selected documents, I can see that ${inputMessage.toLowerCase().includes("risk") ? "there are several risk factors to consider in your strategic planning" : "the technical documentation shows best practices for implementation"}. Would you like me to analyze specific sections or provide recommendations?`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      sources:
        selectedDocs.length > 0
          ? mockDocuments.filter((doc) => selectedDocs.includes(doc.id)).map((doc) => doc.name)
          : undefined,
    }

    setChatMessages((prev) => [...prev, newUserMessage, mockResponse])
    setInputMessage("")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Chat with Documents</h2>
          <p className="text-muted-foreground">Analyze documents and get AI-powered insights</p>
        </div>
      </div>

      {/* Executive metrics removed from chat. Use Executive Dashboard instead. */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document Selection */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-foreground">
              <Database className="h-5 w-5" />
              <span>Document Library</span>
            </CardTitle>
            <CardDescription>Select documents to analyze</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="flex-1 border-border text-foreground bg-transparent">
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
              <Button variant="outline" size="sm" className="border-border text-foreground bg-transparent">
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <ScrollArea className="h-64">
              <div className="space-y-2">
                {mockDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedDocs.includes(doc.id)
                        ? "bg-primary/20 border-primary"
                        : "bg-muted/50 border-border hover:bg-muted"
                    }`}
                    onClick={() => {
                      setSelectedDocs((prev) =>
                        prev.includes(doc.id) ? prev.filter((id) => id !== doc.id) : [...prev, doc.id],
                      )
                    }}
                  >
                    <div className="flex items-start space-x-3">
                      <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs border-border text-muted-foreground">
                            {doc.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{doc.size}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {selectedDocs.length > 0 && (
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground mb-2">{selectedDocs.length} documents selected</p>
                <div className="flex flex-wrap gap-1">
                  {selectedDocs.map((docId) => {
                    const doc = mockDocuments.find((d) => d.id === docId)
                    return (
                      <Badge key={docId} variant="secondary" className="text-xs bg-primary/20 text-foreground">
                        {doc?.name.split(" ")[0]}...
                      </Badge>
                    )
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chat Interface */}
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">AI Assistant</CardTitle>
            <CardDescription>
              Technical documentation and code analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ScrollArea className="h-64 pr-4">
              <div className="space-y-4">
                {chatMessages.map((message) => (
                  <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`flex space-x-2 max-w-[80%] ${message.type === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className={message.type === "user" ? "bg-primary" : "bg-muted"}>
                          {message.type === "user" ? "U" : "AI"}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`rounded-lg p-3 ${
                          message.type === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        {message.sources && (
                          <div className="mt-2 pt-2 border-t border-border">
                            <p className="text-xs text-muted-foreground mb-1">Sources:</p>
                            <div className="flex flex-wrap gap-1">
                              {message.sources.map((source, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-xs border-border text-foreground"
                                >
                                  {source}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">{message.timestamp}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="flex space-x-2">
              <Input
                placeholder={"Ask about code, architecture, or technical documentation..."}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                className="bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
              <Button onClick={handleSendMessage} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Executive summaries removed from chat. */}
    </div>
  )
}
