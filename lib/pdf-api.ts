// API utilities for PDF upload and chat functionality

const API_BASE_URL = 'http://localhost:8000';

export interface UploadResponse {
  message: string;
  chunk_count: number;
  session_id: string;
  documents: Array<{
    name: string;
    size: number;
    upload_date: string;
  }>;
}

export interface ChatResponse {
  answer: string;
}

export interface SessionInfo {
  created_at: string;
  documents: Array<{
    name: string;
    size: number;
    upload_date: string;
  }>;
  chunk_count: number;
  text_length: number;
}

export interface SessionSummary {
  session_id: string;
  created_at: string;
  document_count: number;
  chunk_count: number;
}

export class PDFApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'PDFApiError';
  }
}

export async function uploadPDFs(files: File[], sessionId?: string): Promise<UploadResponse> {
  const formData = new FormData();
  
  // Add all files to the form data
  files.forEach(file => {
    formData.append('files', file);
  });
  
  // Add session ID if provided
  if (sessionId) {
    formData.append('session_id', sessionId);
  }

  try {
    const response = await fetch(`${API_BASE_URL}/extract_pdf`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new PDFApiError(
        errorData.detail || `Upload failed with status ${response.status}`,
        response.status
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof PDFApiError) {
      throw error;
    }
    throw new PDFApiError(
      error instanceof Error ? error.message : 'Upload failed'
    );
  }
}

export async function chatWithPDF(question: string, sessionId: string): Promise<ChatResponse> {
  const formData = new FormData();
  formData.append('question', question);
  formData.append('session_id', sessionId);

  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new PDFApiError(
        errorData.detail || `Chat failed with status ${response.status}`,
        response.status
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof PDFApiError) {
      throw error;
    }
    throw new PDFApiError(
      error instanceof Error ? error.message : 'Chat request failed'
    );
  }
}

export async function getSessionInfo(sessionId: string): Promise<SessionInfo> {
  try {
    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`);
    
    if (!response.ok) {
      throw new PDFApiError(
        `Session not found: ${sessionId}`,
        response.status
      );
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof PDFApiError) {
      throw error;
    }
    throw new PDFApiError(
      error instanceof Error ? error.message : 'Failed to get session info'
    );
  }
}

export async function listSessions(): Promise<{ sessions: SessionSummary[] }> {
  try {
    const response = await fetch(`${API_BASE_URL}/sessions`);
    
    if (!response.ok) {
      throw new PDFApiError(
        'Failed to list sessions',
        response.status
      );
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof PDFApiError) {
      throw error;
    }
    throw new PDFApiError(
      error instanceof Error ? error.message : 'Failed to list sessions'
    );
  }
}

export async function deleteSession(sessionId: string): Promise<{ message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new PDFApiError(
        'Failed to delete session',
        response.status
      );
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof PDFApiError) {
      throw error;
    }
    throw new PDFApiError(
      error instanceof Error ? error.message : 'Failed to delete session'
    );
  }
}

export function isApiAvailable(): Promise<boolean> {
  return fetch(`${API_BASE_URL}/docs`)
    .then(response => response.ok)
    .catch(() => false);
}
