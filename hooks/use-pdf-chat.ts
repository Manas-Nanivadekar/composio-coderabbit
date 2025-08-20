import { useState, useCallback, useEffect } from 'react'
import { uploadPDFs, chatWithPDF, getSessionInfo, PDFApiError, type UploadResponse, type ChatResponse, type SessionInfo } from '@/lib/pdf-api'

export interface UploadedDocument {
  id: string
  name: string
  size: string
  uploadDate: string
  chunkCount?: number
}

export interface ChatMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: string
  sources?: string[]
}

const SESSION_STORAGE_KEY = 'pdf-chat-session-id'

export function usePDFChat() {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([])
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! Upload PDF documents and I can help you analyze them and answer questions.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ])
  const [isUploading, setIsUploading] = useState(false)
  const [isChatting, setIsChatting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [chatError, setChatError] = useState<string | null>(null)

  // Load session from localStorage on mount
  useEffect(() => {
    const loadSession = async () => {
      const savedSessionId = localStorage.getItem(SESSION_STORAGE_KEY)
      if (savedSessionId) {
        setIsLoading(true)
        try {
          const sessionInfo: SessionInfo = await getSessionInfo(savedSessionId)
          setSessionId(savedSessionId)
          
          // Convert session documents to UploadedDocument format
          const documents: UploadedDocument[] = sessionInfo.documents.map((doc, index) => ({
            id: `${doc.name}-${index}`,
            name: doc.name,
            size: typeof doc.size === 'number' ? formatFileSize(doc.size) : doc.size,
            uploadDate: new Date(doc.upload_date).toISOString().split('T')[0],
            chunkCount: sessionInfo.chunk_count
          }))
          
          setUploadedDocuments(documents)
          
          // Update welcome message
          setChatMessages([{
            id: '1',
            type: 'assistant',
            content: `Welcome back! I found your previous session with ${documents.length} document(s). You can continue asking questions about them.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }])
          
        } catch (error) {
          console.warn('Failed to load previous session:', error)
          // Clear invalid session
          localStorage.removeItem(SESSION_STORAGE_KEY)
        } finally {
          setIsLoading(false)
        }
      }
    }
    
    loadSession()
  }, [])

  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }, [])

  const uploadFiles = useCallback(async (files: File[]) => {
    if (files.length === 0) return

    setIsUploading(true)
    setUploadError(null)

    try {
      const response: UploadResponse = await uploadPDFs(files, sessionId || undefined)
      
      // Store session ID for persistence
      const newSessionId = response.session_id
      setSessionId(newSessionId)
      localStorage.setItem(SESSION_STORAGE_KEY, newSessionId)
      
      // Convert response documents to UploadedDocument format
      const newDocuments: UploadedDocument[] = response.documents.map((doc, index) => ({
        id: `${doc.name}-${Date.now()}-${index}`,
        name: doc.name,
        size: typeof doc.size === 'number' ? formatFileSize(doc.size) : doc.size,
        uploadDate: new Date(doc.upload_date).toISOString().split('T')[0],
        chunkCount: response.chunk_count
      }))

      setUploadedDocuments(prev => sessionId ? [...prev, ...newDocuments] : newDocuments)

      // Add success message to chat
      const successMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'assistant',
        content: `Successfully processed ${files.length} PDF file(s). The documents have been indexed with ${response.chunk_count} text chunks. You can now ask questions about the content.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: files.map(f => f.name)
      }

      setChatMessages(prev => [...prev, successMessage])

    } catch (error) {
      const errorMessage = error instanceof PDFApiError ? error.message : 'Failed to upload files'
      setUploadError(errorMessage)
      
      // Add error message to chat
      const errorChatMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'assistant',
        content: `Failed to process uploaded files: ${errorMessage}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }

      setChatMessages(prev => [...prev, errorChatMessage])
    } finally {
      setIsUploading(false)
    }
  }, [formatFileSize, sessionId])

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return
    if (!sessionId || uploadedDocuments.length === 0) {
      setChatError('Please upload PDF documents first before asking questions.')
      return
    }

    setChatError(null)
    setIsChatting(true)

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setChatMessages(prev => [...prev, userMessage])

    try {
      const response: ChatResponse = await chatWithPDF(message, sessionId)
      
      // Add assistant response
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: uploadedDocuments.map(doc => doc.name)
      }

      setChatMessages(prev => [...prev, assistantMessage])

    } catch (error) {
      const errorMessage = error instanceof PDFApiError ? error.message : 'Failed to get response'
      setChatError(errorMessage)
      
      // Add error message to chat
      const errorChatMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `Sorry, I encountered an error: ${errorMessage}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }

      setChatMessages(prev => [...prev, errorChatMessage])
    } finally {
      setIsChatting(false)
    }
  }, [uploadedDocuments, sessionId])

  const clearDocuments = useCallback(() => {
    // Clear session storage
    localStorage.removeItem(SESSION_STORAGE_KEY)
    setSessionId(null)
    setUploadedDocuments([])
    setChatMessages([
      {
        id: '1',
        type: 'assistant',
        content: 'Session cleared. Upload new PDF documents to start chatting.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ])
    setUploadError(null)
    setChatError(null)
  }, [])

  return {
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
  }
}
