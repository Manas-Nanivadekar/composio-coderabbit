#!/usr/bin/env python
"""
Search API for ComposioHQ/composio repository data.
This provides search functionality for the Next.js dashboard.
"""

import json
import os
import sys
from datetime import datetime
from typing import List, Dict, Any
import google.generativeai as genai
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for Next.js frontend

class ComposioSearchAPI:
    """Search API for ComposioHQ/composio repository data."""
    
    def __init__(self):
        self.data_dir = "../data/composio"
        self.setup_gemini()
        self.load_data()
    
    def setup_gemini(self):
        """Initialize Gemini API."""
        try:
            api_key = os.getenv('GEMINI_API_KEY')
            if not api_key:
                print("❌ GEMINI_API_KEY not found in environment variables")
                self.gemini_enabled = False
                return
            
            genai.configure(api_key=api_key)
            self.gemini_model = genai.GenerativeModel('gemini-pro')
            self.gemini_enabled = True
            print("✅ Gemini AI configured successfully")
            
        except Exception as e:
            print(f"❌ Failed to setup Gemini AI: {e}")
            self.gemini_enabled = False
    
    def load_data(self):
        """Load all repository data."""
        try:
            # Load dashboard summary
            with open(f"{self.data_dir}/dashboard_data.json", 'r', encoding='utf-8') as f:
                self.dashboard_data = json.load(f)
            
            # Load all issues
            with open(f"{self.data_dir}/all_issues.json", 'r', encoding='utf-8') as f:
                self.issues = json.load(f)
            
            # Load all PRs
            with open(f"{self.data_dir}/all_pulls.json", 'r', encoding='utf-8') as f:
                self.pulls = json.load(f)
            
            # Load repository info
            with open(f"{self.data_dir}/repository_info.json", 'r', encoding='utf-8') as f:
                self.repo_info = json.load(f)
            
            print(f"✅ Data loaded: {len(self.issues)} issues, {len(self.pulls)} PRs")
            
        except Exception as e:
            print(f"❌ Failed to load data: {e}")
            self.dashboard_data = {}
            self.issues = []
            self.pulls = []
            self.repo_info = {}
    
    def search_items(self, query: str, item_type: str = 'all', limit: int = 50) -> List[Dict]:
        """Search through issues and PRs."""
        if not query:
            return []
        
        query_lower = query.lower()
        results = []
        
        # Search issues
        if item_type in ['all', 'issue']:
            for issue in self.issues:
                title = (issue.get('title') or '').lower()
                body = (issue.get('body') or '').lower()
                labels = ' '.join([label.get('name', '') for label in issue.get('labels', [])]).lower()
                
                search_text = f"{title} {body} {labels}"
                
                if query_lower in search_text:
                    relevance_score = search_text.count(query_lower)
                    
                    # Boost score for title matches
                    if query_lower in title:
                        relevance_score += 5
                    
                    results.append({
                        'type': 'issue',
                        'number': issue.get('number'),
                        'title': issue.get('title'),
                        'state': issue.get('state'),
                        'author': issue.get('user', {}).get('login'),
                        'created_at': issue.get('created_at'),
                        'updated_at': issue.get('updated_at'),
                        'html_url': issue.get('html_url'),
                        'labels': [label.get('name') for label in issue.get('labels', [])],
                        'body_preview': (issue.get('body') or '')[:200] + "..." if len(issue.get('body') or '') > 200 else (issue.get('body') or ''),
                        'relevance_score': relevance_score
                    })
        
        # Search PRs
        if item_type in ['all', 'pull_request']:
            for pr in self.pulls:
                title = (pr.get('title') or '').lower()
                body = (pr.get('body') or '').lower()
                
                search_text = f"{title} {body}"
                
                if query_lower in search_text:
                    relevance_score = search_text.count(query_lower)
                    
                    # Boost score for title matches
                    if query_lower in title:
                        relevance_score += 5
                    
                    results.append({
                        'type': 'pull_request',
                        'number': pr.get('number'),
                        'title': pr.get('title'),
                        'state': pr.get('state'),
                        'author': pr.get('user', {}).get('login'),
                        'created_at': pr.get('created_at'),
                        'updated_at': pr.get('updated_at'),
                        'merged_at': pr.get('merged_at'),
                        'html_url': pr.get('html_url'),
                        'merged': bool(pr.get('merged_at')),
                        'body_preview': (pr.get('body') or '')[:200] + "..." if len(pr.get('body') or '') > 200 else (pr.get('body') or ''),
                        'relevance_score': relevance_score
                    })
        
        # Sort by relevance and limit results
        results.sort(key=lambda x: x['relevance_score'], reverse=True)
        return results[:limit]
    
    def get_stats(self) -> Dict:
        """Get repository statistics."""
        return {
            'repository': {
                'name': 'ComposioHQ/composio',
                'url': 'https://github.com/ComposioHQ/composio',
                'stars': self.repo_info.get('stargazers_count', 0),
                'forks': self.repo_info.get('forks_count', 0),
                'open_issues': self.repo_info.get('open_issues_count', 0),
                'language': self.repo_info.get('language', 'TypeScript'),
                'created_at': self.repo_info.get('created_at'),
                'updated_at': self.repo_info.get('updated_at'),
                'description': self.repo_info.get('description', '')
            },
            'summary': {
                'total_issues': len(self.issues),
                'total_pulls': len(self.pulls),
                'open_issues': sum(1 for issue in self.issues if issue.get('state') == 'open'),
                'closed_issues': sum(1 for issue in self.issues if issue.get('state') == 'closed'),
                'open_pulls': sum(1 for pr in self.pulls if pr.get('state') == 'open'),
                'closed_pulls': sum(1 for pr in self.pulls if pr.get('state') == 'closed'),
                'merged_pulls': sum(1 for pr in self.pulls if pr.get('merged_at'))
            },
            'last_updated': datetime.now().isoformat()
        }
    
    def ai_search(self, query: str) -> Dict:
        """Use Gemini AI to provide intelligent search suggestions."""
        if not self.gemini_enabled:
            return {"error": "AI search not available"}
        
        try:
            prompt = f"""
            Based on the query "{query}" for the ComposioHQ/composio repository (a platform for AI agent integrations), 
            suggest:
            1. Alternative search terms that might be relevant
            2. Common categories this query might fall under (bug, feature, documentation, authentication, API, SDK, etc.)
            3. Related technologies or components that might be mentioned in issues/PRs
            
            Respond in JSON format:
            {{
                "suggestions": ["term1", "term2", "term3"],
                "categories": ["category1", "category2"],
                "related_terms": ["tech1", "tech2", "tech3"]
            }}
            """
            
            response = self.gemini_model.generate_content(prompt)
            
            try:
                ai_suggestions = json.loads(response.text.strip())
                return ai_suggestions
            except:
                return {
                    "suggestions": [query],
                    "categories": ["general"],
                    "related_terms": []
                }
                
        except Exception as e:
            return {"error": f"AI search failed: {str(e)}"}

# Initialize the search API
search_api = ComposioSearchAPI()

@app.route('/')
def home():
    """API home endpoint."""
    return jsonify({
        "name": "ComposioHQ/composio Search API",
        "version": "1.0.0",
        "endpoints": {
            "/search": "Search issues and PRs",
            "/stats": "Get repository statistics",
            "/ai-search": "Get AI-powered search suggestions"
        }
    })

@app.route('/search')
def search():
    """Search endpoint for issues and PRs."""
    query = request.args.get('q', '').strip()
    item_type = request.args.get('type', 'all')  # all, issue, pull_request
    limit = min(int(request.args.get('limit', 20)), 100)  # Max 100 results
    
    if not query:
        return jsonify({"error": "Query parameter 'q' is required"}), 400
    
    try:
        results = search_api.search_items(query, item_type, limit)
        
        return jsonify({
            "query": query,
            "type": item_type,
            "total_results": len(results),
            "results": results
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/stats')
def stats():
    """Get repository statistics."""
    try:
        stats_data = search_api.get_stats()
        return jsonify(stats_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/ai-search')
def ai_search():
    """Get AI-powered search suggestions."""
    query = request.args.get('q', '').strip()
    
    if not query:
        return jsonify({"error": "Query parameter 'q' is required"}), 400
    
    try:
        suggestions = search_api.ai_search(query)
        return jsonify({
            "query": query,
            "ai_suggestions": suggestions
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/recent')
def recent():
    """Get recent issues and PRs."""
    try:
        recent_issues = sorted(search_api.issues, key=lambda x: x.get('updated_at', ''), reverse=True)[:10]
        recent_pulls = sorted(search_api.pulls, key=lambda x: x.get('updated_at', ''), reverse=True)[:10]
        
        return jsonify({
            "recent_issues": [
                {
                    'number': issue.get('number'),
                    'title': issue.get('title'),
                    'state': issue.get('state'),
                    'author': issue.get('user', {}).get('login'),
                    'created_at': issue.get('created_at'),
                    'updated_at': issue.get('updated_at'),
                    'html_url': issue.get('html_url'),
                    'labels': [label.get('name') for label in issue.get('labels', [])]
                } for issue in recent_issues
            ],
            "recent_pulls": [
                {
                    'number': pr.get('number'),
                    'title': pr.get('title'),
                    'state': pr.get('state'),
                    'author': pr.get('user', {}).get('login'),
                    'created_at': pr.get('created_at'),
                    'updated_at': pr.get('updated_at'),
                    'merged_at': pr.get('merged_at'),
                    'html_url': pr.get('html_url'),
                    'merged': bool(pr.get('merged_at'))
                } for pr in recent_pulls
            ]
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("🚀 Starting ComposioHQ/composio Search API...")
    print("📊 API Endpoints:")
    print("  - GET /search?q=<query>&type=<all|issue|pull_request>&limit=<number>")
    print("  - GET /stats")
    print("  - GET /ai-search?q=<query>")
    print("  - GET /recent")
    print("  - GET /")
    print("\n🌐 Starting server on http://localhost:5000")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
