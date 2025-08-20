"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Upload,
  FileText,
  Search,
  Send,
  Database,
  Loader2,
  X,
  AlertCircle,
} from "lucide-react"
import { usePDFChat } from "@/hooks/use-pdf-chat"

export function ChatWithDocs() {
  const {
    sessionId,
    uploadedDocuments,
    chatMessages,
    isUploading,
    isChatting,
    isLoading,
    uploadError,
    chatError,
    uploadFiles,
    sendMessage,
    clearDocuments
  } = usePDFChat()
  
  const [inputMessage, setInputMessage] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const pdfFiles = files.filter(file => file.type === 'application/pdf')
    
    if (pdfFiles.length === 0) {
      alert('Please select PDF files only.')
      return
    }
    
    await uploadFiles(pdfFiles)
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isChatting) return

    await sendMessage(inputMessage)
    setInputMessage("")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Chat with Documents</h2>
          <p className="text-muted-foreground">
            Analyze documents and get AI-powered insights
            {sessionId && (
              <span className="ml-2 text-xs text-primary">
                • Session: {sessionId.substring(0, 8)}...
              </span>
            )}
          </p>
        </div>
        {isLoading && (
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading session...</span>
          </div>
        )}
      </div>

      {/* Upload Error Alert */}
      {uploadError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{uploadError}</AlertDescription>
        </Alert>
      )}

      {/* Chat Error Alert */}
      {chatError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{chatError}</AlertDescription>
        </Alert>
      )}

      {/* File input (hidden) */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        multiple
        onChange={handleFileUpload}
        className="hidden"
      />

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
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 border-border text-foreground bg-transparent"
                onClick={handleUploadClick}
                disabled={isUploading || isLoading}
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                {isUploading ? "Uploading..." : "Upload PDF"}
              </Button>
              {uploadedDocuments.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-border text-foreground bg-transparent"
                  onClick={clearDocuments}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            <ScrollArea className="h-64">
              <div className="space-y-2">
                {isLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 text-muted-foreground mx-auto mb-2 animate-spin" />
                    <p className="text-sm text-muted-foreground">Loading previous session...</p>
                  </div>
                ) : uploadedDocuments.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No documents uploaded yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Click "Upload PDF" to add documents</p>
                  </div>
                ) : (
                  uploadedDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3 rounded-lg border bg-primary/10 border-primary/20"
                    >
                      <div className="flex items-start space-x-3">
                        <FileText className="h-4 w-4 text-primary mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs border-border text-muted-foreground">
                              PDF
                            </Badge>
                            <span className="text-xs text-muted-foreground">{doc.size}</span>
                            {doc.chunkCount && (
                              <span className="text-xs text-muted-foreground">• {doc.chunkCount} chunks</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            {uploadedDocuments.length > 0 && (
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground mb-2">{uploadedDocuments.length} document(s) ready for chat</p>
                <div className="flex flex-wrap gap-1">
                  {uploadedDocuments.slice(0, 3).map((doc) => (
                    <Badge key={doc.id} variant="secondary" className="text-xs bg-primary/20 text-foreground">
                      {doc.name.split(".")[0].substring(0, 10)}...
                    </Badge>
                  ))}
                  {uploadedDocuments.length > 3 && (
                    <Badge variant="secondary" className="text-xs bg-primary/20 text-foreground">
                      +{uploadedDocuments.length - 3} more
                    </Badge>
                  )}
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
                placeholder={uploadedDocuments.length === 0 ? "Upload PDF documents first..." : "Ask questions about your documents..."}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && !isChatting && handleSendMessage()}
                className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                disabled={isChatting || uploadedDocuments.length === 0 || isLoading}
              />
              <Button 
                onClick={handleSendMessage} 
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={isChatting || !inputMessage.trim() || uploadedDocuments.length === 0 || isLoading}
              >
                {isChatting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Executive summaries removed from chat. */}
    </div>
  )
}
