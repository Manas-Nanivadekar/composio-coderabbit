#!/usr/bin/env python
"""
Focused GitHub data fetcher for ComposioHQ/composio repository.
Fetches all issues, PRs and integrates with Gemini API for intelligent search.
"""

import requests
import json
import os
import sys
from datetime import datetime
from typing import List, Dict, Any
import google.generativeai as genai
from dotenv import load_dotenv
import time

# Load environment variables
load_dotenv()

class ComposioRepoFetcher:
    """Fetches and manages ComposioHQ/composio repository data with Gemini integration."""
    
    def __init__(self):
        self.github_base_url = "https://api.github.com"
        self.repo_owner = "ComposioHQ"
        self.repo_name = "composio"
        self.repo_full_name = f"{self.repo_owner}/{self.repo_name}"
        self.data_dir = "composio_repo_data"
        self.context_file = f"{self.data_dir}/composio_repo_context.json"
        
        # Setup Gemini API
        self.setup_gemini()
        
        # Ensure data directory exists
        os.makedirs(self.data_dir, exist_ok=True)
        
        print(f"🚀 ComposioHQ/composio Repository Data Fetcher")
        print(f"📁 Data directory: {self.data_dir}")
        print(f"🎯 Target repository: {self.repo_full_name}")
    
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
    
    def make_github_request_cursor(self, url: str, params: Dict = None) -> List[Dict]:
        """Make GitHub API request with cursor-based pagination for large datasets."""
        all_data = []
        page = 1
        
        while True:
            current_params = params.copy() if params else {}
            current_params.update({'per_page': 100, 'page': page})
            
            try:
                print(f"  📡 Fetching page {page}...")
                response = requests.get(url, params=current_params)
                
                if response.status_code == 200:
                    data = response.json()
                    if not data:  # Empty response means no more pages
                        break
                    
                    all_data.extend(data)
                    
                    # Check if there are more pages
                    if len(data) < 100:  # Less than per_page means last page
                        break
                    
                    page += 1
                    time.sleep(0.2)  # Rate limiting
                    
                elif response.status_code == 422:
                    # Handle pagination limit for large datasets
                    print(f"  ⚠️ Pagination limit reached at page {page}. Total fetched: {len(all_data)}")
                    break
                    
                elif response.status_code == 403:
                    print(f"❌ Rate limit exceeded. Waiting...")
                    time.sleep(60)
                    continue
                else:
                    print(f"❌ Request failed: {response.status_code}")
                    print(f"Response: {response.text}")
                    break
                    
            except Exception as e:
                print(f"❌ Error making request: {e}")
                break
        
        print(f"  ✅ Fetched {len(all_data)} items total")
        return all_data
    
    def fetch_repository_info(self) -> Dict:
        """Fetch basic repository information."""
        print(f"\n📖 Fetching repository info for {self.repo_full_name}...")
        
        url = f"{self.github_base_url}/repos/{self.repo_full_name}"
        
        try:
            response = requests.get(url)
            if response.status_code == 200:
                repo_info = response.json()
                print(f"✅ Repository info fetched")
                
                # Display key information
                print(f"  📊 Stars: {repo_info.get('stargazers_count', 0)}")
                print(f"  🍴 Forks: {repo_info.get('forks_count', 0)}")
                print(f"  👁️ Watchers: {repo_info.get('watchers_count', 0)}")
                print(f"  🐛 Open Issues: {repo_info.get('open_issues_count', 0)}")
                print(f"  📝 Language: {repo_info.get('language', 'N/A')}")
                print(f"  📅 Created: {repo_info.get('created_at', 'N/A')[:10]}")
                print(f"  🔄 Updated: {repo_info.get('updated_at', 'N/A')[:10]}")
                
                return repo_info
            else:
                print(f"❌ Failed to fetch repository info: {response.status_code}")
                return {}
                
        except Exception as e:
            print(f"❌ Error fetching repository info: {e}")
            return {}
    
    def fetch_all_issues(self) -> List[Dict]:
        """Fetch ALL issues for the repository (excluding PRs)."""
        print(f"\n🐛 Fetching ALL issues for {self.repo_full_name}...")
        
        url = f"{self.github_base_url}/repos/{self.repo_full_name}/issues"
        params = {'state': 'all', 'sort': 'updated', 'direction': 'desc'}
        
        all_issues = self.make_github_request_cursor(url, params)
        
        # Filter out pull requests (GitHub API includes PRs in issues endpoint)
        actual_issues = [issue for issue in all_issues if not issue.get('pull_request')]
        
        if actual_issues:
            print(f"✅ Found {len(actual_issues)} issues (filtered from {len(all_issues)} total)")
            
            # Count by state
            open_count = sum(1 for issue in actual_issues if issue.get('state') == 'open')
            closed_count = sum(1 for issue in actual_issues if issue.get('state') == 'closed')
            
            print(f"\n📊 Issue Statistics:")
            print(f"  🟢 Open: {open_count}")
            print(f"  🔴 Closed: {closed_count}")
            print(f"  📊 Total: {len(actual_issues)}")
            
            # Display recent issues
            print(f"\n📋 Recent Issues (showing first 10):")
            print("| # | Title | State | Author | Created | Labels |")
            print("|---|-------|-------|---------|---------|---------|")
            
            for issue in actual_issues[:10]:
                number = issue.get('number', 'N/A')
                title = issue.get('title', 'N/A')
                if len(title) > 50:
                    title = title[:47] + "..."
                state = issue.get('state', 'N/A')
                author = issue.get('user', {}).get('login', 'N/A')
                created = issue.get('created_at', 'N/A')[:10]
                labels = ", ".join([label.get('name', '') for label in issue.get('labels', [])])
                if len(labels) > 30:
                    labels = labels[:27] + "..."
                
                print(f"| #{number} | {title} | {state} | {author} | {created} | {labels} |")
        else:
            print("❌ No issues found")
        
        return actual_issues
    
    def fetch_all_pulls(self) -> List[Dict]:
        """Fetch ALL pull requests for the repository."""
        print(f"\n🔄 Fetching ALL pull requests for {self.repo_full_name}...")
        
        url = f"{self.github_base_url}/repos/{self.repo_full_name}/pulls"
        params = {'state': 'all', 'sort': 'updated', 'direction': 'desc'}
        
        all_pulls = self.make_github_request_cursor(url, params)
        
        if all_pulls:
            print(f"✅ Found {len(all_pulls)} pull requests")
            
            # Count by state
            open_count = sum(1 for pr in all_pulls if pr.get('state') == 'open')
            closed_count = sum(1 for pr in all_pulls if pr.get('state') == 'closed')
            merged_count = sum(1 for pr in all_pulls if pr.get('merged_at'))
            
            print(f"\n📊 PR Statistics:")
            print(f"  🟢 Open: {open_count}")
            print(f"  🔴 Closed: {closed_count}")
            print(f"  🟣 Merged: {merged_count}")
            print(f"  📊 Total: {len(all_pulls)}")
            
            # Display recent PRs
            print(f"\n📋 Recent Pull Requests (showing first 10):")
            print("| # | Title | State | Author | Created | Merged |")
            print("|---|-------|-------|---------|---------|---------|")
            
            for pr in all_pulls[:10]:
                number = pr.get('number', 'N/A')
                title = pr.get('title', 'N/A')
                if len(title) > 50:
                    title = title[:47] + "..."
                state = pr.get('state', 'N/A')
                author = pr.get('user', {}).get('login', 'N/A')
                created = pr.get('created_at', 'N/A')[:10]
                merged = 'Yes' if pr.get('merged_at') else 'No'
                
                print(f"| #{number} | {title} | {state} | {author} | {created} | {merged} |")
        else:
            print("❌ No pull requests found")
        
        return all_pulls
    
    def save_all_data(self, repo_info: Dict, issues: List[Dict], pulls: List[Dict]):
        """Save all fetched data to JSON files for dashboard integration."""
        print(f"\n💾 Saving all data...")
        
        # Create comprehensive context data
        context_data = {
            'timestamp': datetime.now().isoformat(),
            'repository': {
                'owner': self.repo_owner,
                'name': self.repo_name,
                'full_name': self.repo_full_name,
                'url': f"https://github.com/{self.repo_full_name}",
                'info': repo_info
            },
            'summary': {
                'total_issues': len(issues),
                'total_pulls': len(pulls),
                'open_issues': sum(1 for issue in issues if issue.get('state') == 'open'),
                'closed_issues': sum(1 for issue in issues if issue.get('state') == 'closed'),
                'open_pulls': sum(1 for pr in pulls if pr.get('state') == 'open'),
                'closed_pulls': sum(1 for pr in pulls if pr.get('state') == 'closed'),
                'merged_pulls': sum(1 for pr in pulls if pr.get('merged_at')),
                'stars': repo_info.get('stargazers_count', 0),
                'forks': repo_info.get('forks_count', 0),
                'watchers': repo_info.get('watchers_count', 0)
            },
            'issues': issues,
            'pull_requests': pulls
        }
        
        # Save main context file
        with open(self.context_file, 'w', encoding='utf-8') as f:
            json.dump(context_data, f, indent=2, ensure_ascii=False)
        
        # Save separate files for different data types
        with open(f"{self.data_dir}/repository_info.json", 'w', encoding='utf-8') as f:
            json.dump(repo_info, f, indent=2, ensure_ascii=False)
        
        with open(f"{self.data_dir}/all_issues.json", 'w', encoding='utf-8') as f:
            json.dump(issues, f, indent=2, ensure_ascii=False)
        
        with open(f"{self.data_dir}/all_pulls.json", 'w', encoding='utf-8') as f:
            json.dump(pulls, f, indent=2, ensure_ascii=False)
        
        # Create dashboard-friendly summary
        dashboard_data = {
            'last_updated': datetime.now().isoformat(),
            'repository': {
                'name': self.repo_full_name,
                'url': f"https://github.com/{self.repo_full_name}",
                'description': repo_info.get('description', ''),
                'stats': context_data['summary']
            },
            'recent_activity': {
                'recent_issues': [
                    {
                        'number': issue.get('number'),
                        'title': issue.get('title'),
                        'state': issue.get('state'),
                        'author': issue.get('user', {}).get('login'),
                        'created_at': issue.get('created_at'),
                        'updated_at': issue.get('updated_at'),
                        'labels': [label.get('name') for label in issue.get('labels', [])],
                        'html_url': issue.get('html_url')
                    } for issue in issues[:20]
                ],
                'recent_pulls': [
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
                    } for pr in pulls[:20]
                ]
            }
        }
        
        with open(f"{self.data_dir}/dashboard_data.json", 'w', encoding='utf-8') as f:
            json.dump(dashboard_data, f, indent=2, ensure_ascii=False)
        
        print(f"✅ All data saved to {self.data_dir}/")
        print(f"📁 Files created:")
        print(f"  - composio_repo_context.json (complete dataset)")
        print(f"  - repository_info.json")
        print(f"  - all_issues.json ({len(issues)} issues)")
        print(f"  - all_pulls.json ({len(pulls)} PRs)")
        print(f"  - dashboard_data.json (dashboard integration)")
    
    def create_ai_search_index(self, issues: List[Dict], pulls: List[Dict]):
        """Create AI-enhanced search index using Gemini."""
        if not self.gemini_enabled:
            print("⚠️ Gemini AI not available, creating basic search index")
            self.create_basic_search_index(issues, pulls)
            return
        
        print(f"\n🤖 Creating AI-enhanced search index...")
        
        # Prepare all searchable items
        all_items = []
        
        # Add issues
        for issue in issues:
            all_items.append({
                'type': 'issue',
                'number': issue.get('number'),
                'title': issue.get('title', ''),
                'body': (issue.get('body') or '')[:2000],  # Limit body length
                'state': issue.get('state'),
                'labels': [label.get('name', '') for label in issue.get('labels', [])],
                'author': issue.get('user', {}).get('login', ''),
                'created_at': issue.get('created_at'),
                'updated_at': issue.get('updated_at'),
                'html_url': issue.get('html_url'),
                'comments': issue.get('comments', 0)
            })
        
        # Add pull requests
        for pr in pulls:
            all_items.append({
                'type': 'pull_request',
                'number': pr.get('number'),
                'title': pr.get('title', ''),
                'body': (pr.get('body') or '')[:2000],  # Limit body length
                'state': pr.get('state'),
                'author': pr.get('user', {}).get('login', ''),
                'created_at': pr.get('created_at'),
                'updated_at': pr.get('updated_at'),
                'merged_at': pr.get('merged_at'),
                'html_url': pr.get('html_url'),
                'merged': bool(pr.get('merged_at')),
                'additions': pr.get('additions', 0),
                'deletions': pr.get('deletions', 0)
            })
        
        # Process items in batches with AI enhancement
        search_index = []
        batch_size = 10  # Process 10 items at a time
        total_items = len(all_items)
        
        print(f"  🔄 Processing {total_items} items in batches of {batch_size}...")
        
        for i in range(0, min(50, total_items), batch_size):  # Limit to first 50 for demo
            batch = all_items[i:i+batch_size]
            
            for j, item in enumerate(batch):
                try:
                    # Create AI prompt
                    prompt = f"""
                    Analyze this GitHub {item['type']} for the Composio repository and create a searchable summary:
                    
                    Title: {item['title']}
                    Body: {item['body'][:800]}
                    Labels: {item.get('labels', [])}
                    State: {item['state']}
                    
                    Please provide:
                    1. A concise 2-3 sentence summary
                    2. Key technologies/topics mentioned
                    3. Category (bug, feature, documentation, enhancement, etc.)
                    4. Priority level (high, medium, low) based on content
                    5. Relevant keywords for search
                    
                    Format as JSON:
                    {{
                        "summary": "Brief summary here",
                        "technologies": ["tech1", "tech2"],
                        "category": "category_name",
                        "priority": "priority_level",
                        "keywords": ["keyword1", "keyword2"]
                    }}
                    """
                    
                    response = self.gemini_model.generate_content(prompt)
                    
                    try:
                        # Try to parse JSON response
                        ai_data = json.loads(response.text.strip())
                    except:
                        # Fallback if JSON parsing fails
                        ai_data = {
                            "summary": response.text[:200],
                            "technologies": [],
                            "category": "unknown",
                            "priority": "medium",
                            "keywords": []
                        }
                    
                    # Enhance item with AI data
                    enhanced_item = item.copy()
                    enhanced_item.update({
                        'ai_summary': ai_data.get('summary', ''),
                        'ai_technologies': ai_data.get('technologies', []),
                        'ai_category': ai_data.get('category', 'unknown'),
                        'ai_priority': ai_data.get('priority', 'medium'),
                        'ai_keywords': ai_data.get('keywords', []),
                        'search_text': f"{item['title']} {item['body']} {ai_data.get('summary', '')} {' '.join(ai_data.get('keywords', []))}".lower()
                    })
                    
                    search_index.append(enhanced_item)
                    print(f"  ✅ Processed {i+j+1}/{min(50, total_items)}: #{item['number']}")
                    
                    time.sleep(1)  # Rate limiting for Gemini API
                    
                except Exception as e:
                    print(f"  ❌ Failed to process item #{item['number']}: {e}")
                    # Add item without AI enhancement
                    basic_item = item.copy()
                    basic_item.update({
                        'ai_summary': 'AI processing failed',
                        'ai_technologies': [],
                        'ai_category': 'unknown',
                        'ai_priority': 'medium',
                        'ai_keywords': [],
                        'search_text': f"{item['title']} {item['body']}".lower()
                    })
                    search_index.append(basic_item)
        
        # Add remaining items without AI processing
        for item in all_items[len(search_index):]:
            basic_item = item.copy()
            basic_item.update({
                'ai_summary': 'Not processed with AI',
                'ai_technologies': [],
                'ai_category': 'unknown',
                'ai_priority': 'medium', 
                'ai_keywords': [],
                'search_text': f"{item['title']} {item['body']}".lower()
            })
            search_index.append(basic_item)
        
        # Save search index
        with open(f"{self.data_dir}/ai_search_index.json", 'w', encoding='utf-8') as f:
            json.dump(search_index, f, indent=2, ensure_ascii=False)
        
        print(f"✅ AI search index created with {len(search_index)} items")
        print(f"   ({min(50, len(search_index))} items enhanced with AI)")
    
    def create_basic_search_index(self, issues: List[Dict], pulls: List[Dict]):
        """Create basic search index without AI enhancement."""
        print(f"\n🔍 Creating basic search index...")
        
        search_index = []
        
        # Add issues
        for issue in issues:
            search_index.append({
                'type': 'issue',
                'number': issue.get('number'),
                'title': issue.get('title', ''),
                'body': issue.get('body', ''),
                'state': issue.get('state'),
                'labels': [label.get('name', '') for label in issue.get('labels', [])],
                'author': issue.get('user', {}).get('login', ''),
                'created_at': issue.get('created_at'),
                'html_url': issue.get('html_url'),
                'search_text': f"{issue.get('title', '')} {issue.get('body', '')}".lower()
            })
        
        # Add pull requests
        for pr in pulls:
            search_index.append({
                'type': 'pull_request',
                'number': pr.get('number'),
                'title': pr.get('title', ''),
                'body': pr.get('body', ''),
                'state': pr.get('state'),
                'author': pr.get('user', {}).get('login', ''),
                'created_at': pr.get('created_at'),
                'html_url': pr.get('html_url'),
                'merged': bool(pr.get('merged_at')),
                'search_text': f"{pr.get('title', '')} {pr.get('body', '')}".lower()
            })
        
        # Save basic search index
        with open(f"{self.data_dir}/search_index.json", 'w', encoding='utf-8') as f:
            json.dump(search_index, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Basic search index created with {len(search_index)} items")
    
    def search(self, query: str, search_type: str = 'all') -> List[Dict]:
        """Search through issues and PRs."""
        # Try AI-enhanced index first
        index_file = f"{self.data_dir}/ai_search_index.json"
        if not os.path.exists(index_file):
            index_file = f"{self.data_dir}/search_index.json"
        
        try:
            with open(index_file, 'r', encoding='utf-8') as f:
                search_index = json.load(f)
        except FileNotFoundError:
            print("❌ Search index not found. Please run fetch_all_data() first.")
            return []
        
        query_lower = query.lower()
        results = []
        
        for item in search_index:
            # Filter by type if specified
            if search_type != 'all' and item.get('type') != search_type:
                continue
            
            search_text = item.get('search_text', '')
            if query_lower in search_text:
                relevance_score = search_text.count(query_lower)
                
                # Boost score for title matches
                if query_lower in item.get('title', '').lower():
                    relevance_score += 5
                
                # Boost score for AI keywords if available
                if 'ai_keywords' in item:
                    for keyword in item['ai_keywords']:
                        if query_lower in keyword.lower():
                            relevance_score += 3
                
                item_result = item.copy()
                item_result['relevance_score'] = relevance_score
                results.append(item_result)
        
        # Sort by relevance
        results.sort(key=lambda x: x['relevance_score'], reverse=True)
        
        return results
    
    def fetch_all_data(self):
        """Main method to fetch all data for ComposioHQ/composio repository."""
        print(f"\n🚀 Starting comprehensive data fetch for {self.repo_full_name}...")
        
        # Step 1: Get repository information
        repo_info = self.fetch_repository_info()
        
        # Step 2: Fetch all issues
        issues = self.fetch_all_issues()
        
        # Step 3: Fetch all pull requests
        pulls = self.fetch_all_pulls()
        
        # Step 4: Save all data
        self.save_all_data(repo_info, issues, pulls)
        
        # Step 5: Create search index
        self.create_ai_search_index(issues, pulls)
        
        print(f"\n🎉 Data fetch completed successfully!")
        print(f"📊 Final Summary:")
        print(f"  - Repository: {self.repo_full_name}")
        print(f"  - Stars: {repo_info.get('stargazers_count', 0)}")
        print(f"  - Issues: {len(issues)} (Open: {sum(1 for i in issues if i.get('state') == 'open')})")
        print(f"  - PRs: {len(pulls)} (Open: {sum(1 for p in pulls if p.get('state') == 'open')})")
        print(f"  - Data saved to: {self.data_dir}/")
        
        return {
            'repository_info': repo_info,
            'issues': issues,
            'pull_requests': pulls
        }

def main():
    """Main function."""
    import argparse
    
    parser = argparse.ArgumentParser(description='ComposioHQ/composio Repository Data Fetcher')
    parser.add_argument('--fetch', '-f', action='store_true', help='Fetch all data')
    parser.add_argument('--search', '-s', type=str, help='Search query')
    parser.add_argument('--type', '-t', choices=['all', 'issue', 'pull_request'], default='all', help='Search type')
    
    args = parser.parse_args()
    
    fetcher = ComposioRepoFetcher()
    
    if args.fetch:
        # Fetch all repository data
        fetcher.fetch_all_data()
    
    elif args.search:
        # Search existing data
        print(f"\n🔍 Searching for: '{args.search}' (type: {args.type})")
        results = fetcher.search(args.search, args.type)
        
        if results:
            print(f"✅ Found {len(results)} results:")
            print("\n📋 Search Results:")
            print("| Type | # | Title | State | Relevance | AI Category |")
            print("|------|---|-------|-------|-----------|-------------|")
            
            for result in results[:15]:  # Show top 15 results
                item_type = result.get('type', 'N/A')
                number = result.get('number', 'N/A')
                title = result.get('title', 'N/A')
                if len(title) > 40:
                    title = title[:37] + "..."
                state = result.get('state', 'N/A')
                relevance = result.get('relevance_score', 0)
                ai_category = result.get('ai_category', 'N/A')
                
                print(f"| {item_type} | #{number} | {title} | {state} | {relevance} | {ai_category} |")
                
            if len(results) > 15:
                print(f"\n... and {len(results) - 15} more results")
        else:
            print("❌ No results found")
    
    else:
        # Default: fetch all data
        print("No action specified. Use --fetch to fetch data or --search to search.")
        print("Example: python composio_repo_fetcher.py --fetch")
        print("Example: python composio_repo_fetcher.py --search 'authentication bug'")

if __name__ == "__main__":
    main()
