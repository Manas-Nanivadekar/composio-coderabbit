# PDF Chat Integration

This integration allows users to upload PDF documents and chat with them using AI. The system provides document persistence across sessions and improved retrieval capabilities.

## Features

- ✅ **Real PDF Upload**: Upload actual PDF files through the web interface
- ✅ **AI-Powered Chat**: Ask questions about uploaded documents using Google's Gemini AI
- ✅ **Session Persistence**: Documents remain available even after page refresh
- ✅ **Improved Retrieval**: Better similarity search with more relevant results
- ✅ **Error Handling**: Comprehensive error handling and user feedback
- ✅ **Loading States**: Visual feedback during upload and chat operations

## Setup Instructions

### 1. Install Python Dependencies

The backend requires several Python packages. Install them using:

```bash
pip install fastapi uvicorn PyPDF2 python-pptx langchain langchain-google-genai python-dotenv faiss-cpu
```

### 2. Set up Google API Key

You need a Google API key for the Gemini AI service:

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Set it as an environment variable:

**Windows:**
```cmd
set GOOGLE_API_KEY=your_api_key_here
```

**Linux/Mac:**
```bash
export GOOGLE_API_KEY=your_api_key_here
```

Alternatively, create a `.env` file in the `pdf_extraction/src/` directory:
```
GOOGLE_API_KEY=your_api_key_here
```

### 3. Start the Backend Server

**Option 1: Use the startup script (Windows)**
```cmd
start-pdf-api.bat
```

**Option 2: Use Python directly**
```cmd
python start-pdf-api.py
```

**Option 3: Start manually**
```cmd
cd pdf_extraction/src
python -m uvicorn chat_with_pdf:app --host 0.0.0.0 --port 8000 --reload
```

The server will be available at: http://localhost:8000

### 4. Start the Frontend

```bash
npm run dev
```

The frontend will be available at: http://localhost:3000

## How It Works

### Backend Architecture

1. **FastAPI Server**: Serves the PDF processing and chat APIs
2. **Session Management**: Each upload creates a persistent session with a unique ID
3. **Vector Store**: FAISS vector database for document similarity search
4. **Google Gemini**: AI model for answering questions based on document content

### Frontend Integration

1. **Upload Component**: Handles PDF file uploads with progress indicators
2. **Session Persistence**: Automatically saves and restores sessions using localStorage
3. **Chat Interface**: Real-time chat with AI assistant
4. **Document Management**: View uploaded documents and their processing status

### Key Improvements Made

#### 1. Fixed "Answer not available in context" Issues
- **Improved Prompt Template**: More flexible prompting that provides helpful answers even with partial matches
- **Better Similarity Search**: Increased number of retrieved documents (k=5) for better context
- **Enhanced Debugging**: Added logging to track document retrieval

#### 2. Added Session Persistence
- **Session-based Storage**: Each upload creates a unique session ID
- **Local Storage**: Frontend remembers session ID across page refreshes
- **Server-side Persistence**: Sessions are saved to disk for full persistence
- **Automatic Recovery**: Previous sessions are automatically loaded on page refresh

#### 3. Enhanced User Experience
- **Loading States**: Visual feedback during all operations
- **Error Handling**: Comprehensive error messages and recovery
- **Document Preview**: Shows uploaded documents with metadata
- **Session Information**: Display current session ID for debugging

## API Endpoints

### POST /extract_pdf
Upload and process PDF files
- **Input**: PDF files + optional session_id
- **Output**: session_id, documents metadata, chunk count

### POST /chat
Chat with uploaded documents
- **Input**: question + session_id
- **Output**: AI-generated answer

### GET /sessions/{session_id}
Get session information
- **Output**: Session metadata and document list

### GET /sessions
List all available sessions
- **Output**: Array of session summaries

### DELETE /sessions/{session_id}
Delete a session and its data
- **Output**: Confirmation message

## Troubleshooting

### "Vector index not found" Error
- Make sure you've uploaded PDF documents first
- Check that the session ID is valid
- Restart the backend server if persistent

### "Answer not available in context" Responses
- This has been largely fixed in the new version
- If still occurring, try rephrasing your question
- Check the server logs for document retrieval debug information

### Upload Failures
- Ensure PDFs are not password-protected
- Check that files are valid PDF format
- Verify Google API key is set correctly

### Session Not Persisting
- Check browser localStorage is enabled
- Ensure the backend server is running
- Verify session files are being created in the `sessions/` directory

## File Structure

```
C:\Users\malay\Downloads\composio-coderabbit\
├── pdf_extraction/
│   └── src/
│       └── chat_with_pdf.py          # FastAPI backend
├── components/
│   └── chat/
│       └── ChatWithDocs.tsx          # React chat component
├── hooks/
│   └── use-pdf-chat.ts               # React hook for PDF operations
├── lib/
│   └── pdf-api.ts                    # API utilities
├── start-pdf-api.py                  # Python startup script
├── start-pdf-api.bat                 # Windows startup script
└── sessions/                         # Session storage directory (created automatically)
```

## Session Storage

Sessions are stored in the `sessions/` directory with the following structure:
```
sessions/
├── {session-id}/
│   ├── faiss_index/                  # Vector store files
│   └── session.json                  # Session metadata
```

Each session contains:
- Document metadata (names, sizes, upload dates)
- Text chunk count
- Vector embeddings for similarity search

## Next Steps

For production deployment, consider:
1. **Database Storage**: Replace file-based sessions with a database
2. **Authentication**: Add user authentication and session ownership
3. **Rate Limiting**: Implement API rate limiting
4. **Monitoring**: Add logging and monitoring
5. **Scaling**: Consider horizontal scaling for the vector store
