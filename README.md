# 🚀 Composio CodeRabbit - AI-Powered Repository Intelligence Dashboard

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white)](https://python.org/)
[![Flask](https://img.shields.io/badge/Flask-000000?style=flat&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-4285F4?style=flat&logo=google&logoColor=white)](https://ai.google/)

## ✨ Features

### 🔍 **Intelligent Search & Analytics**
- **AI-Enhanced Search**: Powered by Google Gemini AI for intelligent query understanding
- **Real-time Repository Data**: Live GitHub API integration for ComposioHQ/composio repository
- **Advanced Filtering**: Search by issues, pull requests, labels, authors, and states
- **Relevance Scoring**: Smart ranking of search results based on content matching

### 📊 **Comprehensive Dashboard**
- **Search Interface**: Advanced search with filters and AI suggestions
- **Knowledge Graph**: Visual representation of repository relationships
- **Stories Timeline**: Chronological view of repository activity
- **Insights Dashboard**: Statistical analysis and trends
- **Chat with Docs**: Interactive AI chat for repository documentation

### 🤖 **AI-Powered Features**
- **Gemini AI Integration**: Enhanced search suggestions and content analysis
- **Smart Categorization**: Automatic classification of issues and PRs
- **Priority Assessment**: AI-driven priority levels for repository items
- **Technology Detection**: Automatic identification of technologies mentioned

### 🔐 **Enterprise-Ready**
- **Next.js Authentication**: Secure user sessions with NextAuth.js
- **Theme Support**: Dark/Light mode with system preference detection
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **CORS Enabled**: Cross-origin resource sharing for API integration

---

## 🏗️ Architecture

```
composio-coderabbit/
├── 🎨 Frontend (Next.js)
│   ├── app/                    # Next.js 13+ App Router
│   ├── components/             # React components
│   │   ├── dashboard/         # Dashboard views
│   │   ├── search/            # Search interface
│   │   ├── ui/                # Reusable UI components
│   │   └── ...
│   └── utils/                 # Utility functions & API clients
│
├── 🔧 Backend Engine (Python)
│   ├── composio_repo_fetcher.py  # GitHub data fetcher
│   ├── search_api.py             # Flask REST API
│   └── crew.py                   # CrewAI integration
│
├── 📁 Data Storage
│   └── data/composio/            # Repository data cache
│
└── 📄 Documentation
    ├── README.md                 # This file
    └── PDF_CHAT_INTEGRATION.md   # PDF chat features
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and **npm/pnpm**
- **Python** 3.10+ with **pip**
- **Git** for version control
- **GitHub API access** (optional for data fetching)
- **Google Gemini API key** (for AI features)

### 1️⃣ Clone & Install

```bash
# Clone the repository
git clone https://github.com/your-username/composio-coderabbit.git
cd composio-coderabbit

# Install frontend dependencies
npm install
# or
pnpm install

# Install backend dependencies
cd backend_engine
pip install -r requirements.txt
# or using uv
uv sync
cd ..
```

### 2️⃣ Environment Setup

Create `.env.local` in the root directory:

```bash
# NextAuth.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Google Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# GitHub API (optional)
GITHUB_TOKEN=your-github-token
```

Create `.env` in the `backend_engine` directory:

```bash
# AI Configuration
GEMINI_API_KEY=your-gemini-api-key
OPENAI_API_KEY=your-openai-api-key  # For CrewAI features

# Composio Configuration (optional)
COMPOSIO_API_KEY=your-composio-api-key
```

### 3️⃣ Start the Application

```bash
# Terminal 1: Start the frontend
npm run dev

# Terminal 2: Start the backend API
cd backend_engine
python search_api.py

# Terminal 3: Fetch repository data (one-time setup)
python composio_repo_fetcher.py --fetch
```

### 4️⃣ Access the Dashboard

Open [http://localhost:3000](http://localhost:3000) in your browser.

**Default Login**: Any email/password combination will work in development mode.

---

## 🎯 Usage Guide

### 🔍 **Search Interface**

1. **Basic Search**: Enter keywords to search through issues and PRs
2. **Filter by Type**: Select "Issues", "Pull Requests", or "All"
3. **AI Suggestions**: Get intelligent search suggestions from Gemini AI
4. **Sort & Filter**: Order results by relevance, date, or state

### 📊 **Dashboard Features**

- **Search Tab**: Main search interface with advanced filtering
- **Knowledge Graph**: Visual representation of repository connections
- **Stories Timeline**: Chronological view of repository activity
- **Insights**: Statistical analysis and trending topics
- **Chat with Docs**: AI-powered chat for documentation queries

### 🤖 **AI Features**

- **Smart Search**: AI understands context and suggests related terms
- **Auto-categorization**: Issues and PRs are automatically categorized
- **Priority Detection**: AI assesses priority levels of repository items
- **Technology Mapping**: Automatic detection of technologies mentioned

---

## 🔧 API Endpoints

The Flask backend provides the following REST endpoints:

```bash
# Search
GET /api/search?q=query&type=all&limit=50

# Repository Statistics
GET /api/stats

# AI Search Suggestions
POST /api/ai-search
Body: {"query": "your search query"}

# Recent Activity
GET /api/recent-activity?limit=20

# Health Check
GET /api/health
```

---

## 🛠️ Development

### Frontend Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint
```

### Backend Development

```bash
# Install dependencies
cd backend_engine
pip install -r requirements.txt

# Run the Flask API
python search_api.py

# Fetch fresh data
python composio_repo_fetcher.py --fetch

# Search existing data
python composio_repo_fetcher.py --search "authentication"
```

### Data Management

```bash
# Fetch all repository data
python composio_repo_fetcher.py --fetch

# Search specific items
python composio_repo_fetcher.py --search "bug" --type issue

# View data directory
ls data/composio/
```

---

## 📁 Project Structure

<details>
<summary>Click to expand detailed structure</summary>

```
composio-coderabbit/
├── app/
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Landing page
│   └── auth/
│       └── login/              # Authentication pages
├── backend_engine/
│   ├── composio_repo_fetcher.py   # GitHub data fetcher
│   ├── search_api.py              # Flask REST API
│   ├── crew.py                    # CrewAI integration
│   ├── pyproject.toml             # Python dependencies
│   └── config/
│       ├── agents.yaml            # AI agent configurations
│       └── tasks.yaml             # Task definitions
├── components/
│   ├── ui/                        # Shadcn/ui components
│   ├── dashboard/                 # Dashboard components
│   ├── search/                    # Search interface
│   ├── chat/                      # Chat components
│   ├── graph/                     # Knowledge graph
│   ├── insights/                  # Analytics components
│   └── timeline/                  # Timeline components
├── data/
│   └── composio/                  # Cached repository data
├── hooks/                         # Custom React hooks
├── lib/                           # Utility libraries
├── utils/                         # Helper functions
├── public/                        # Static assets
└── styles/                        # Additional styles
```

</details>

---

## 🌟 Key Technologies

| Technology | Purpose | Version |
|------------|---------|----------|
| **Next.js** | React framework | 15.2.4 |
| **TypeScript** | Type safety | Latest |
| **Tailwind CSS** | Styling | 4.1.9 |
| **Shadcn/ui** | UI components | Latest |
| **Flask** | Python API | Latest |
| **Google Gemini** | AI integration | Pro model |
| **NextAuth.js** | Authentication | Latest |
| **Lucide React** | Icons | 0.454.0 |
| **CrewAI** | Multi-agent AI | Latest |

---

## 🔑 Environment Variables

### Frontend (.env.local)
```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
GEMINI_API_KEY=your-gemini-api-key
```

### Backend (.env)
```bash
GEMINI_API_KEY=your-gemini-api-key
OPENAI_API_KEY=your-openai-api-key
COMPOSIO_API_KEY=your-composio-api-key
GITHUB_TOKEN=your-github-token
```

---

## 📈 Performance

- **Fast Search**: Optimized search with relevance scoring
- **Efficient Data Loading**: Paginated results and lazy loading
- **Caching**: Repository data cached locally for faster access
- **Responsive**: Mobile-optimized interface
- **AI Rate Limiting**: Smart API usage to avoid rate limits

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **ISC License**. See the [LICENSE](LICENSE) file for details.

---

## 🆘 Support

- 📧 **Email**: [support@example.com](mailto:support@example.com)
- 🐛 **Issues**: [GitHub Issues](https://github.com/your-username/composio-coderabbit/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/your-username/composio-coderabbit/discussions)

---

## 🙏 Acknowledgments

- **ComposioHQ** for the inspiration and data source
- **Shadcn/ui** for the beautiful UI components
- **Google Gemini** for AI capabilities
- **CrewAI** for multi-agent AI framework
- **Next.js team** for the amazing framework

---

<div align="center">

