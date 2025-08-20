#!/usr/bin/env python
"""
Comprehensive GitHub data fetcher for ComposioHQ organization.
Fetches repos, issues, PRs and integrates with Gemini API for search functionality.
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

class ComposioDataFetcher:
    """Fetches and manages ComposioHQ GitHub data with Gemini integration."""
    
    def __init__(self):
        self.github_base_url = "https://api.github.com"
        self.org_name = "ComposioHQ"
        self.target_repo = "composio"
        self.data_dir = "composio_data"
        self.context_file = f"{self.data_dir}/composio_context.json"
        
        # Setup Gemini API
        self.setup_gemini()
        
        # Ensure data directory exists
        os.makedirs(self.data_dir, exist_ok=True)
        
        print(f"🚀 ComposioHQ Data Fetcher initialized")
        print(f"📁 Data directory: {self.data_dir}")
        print(f"🎯 Target repository: {self.org_name}/{self.target_repo}")
    
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
    
    def make_github_request(self, url: str, params: Dict = None) -> List[Dict]:
        """Make GitHub API request with pagination support."""
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
                    time.sleep(0.1)  # Rate limiting
                    
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
    
    def fetch_organization_repos(self) -> List[Dict]:
        """Fetch all repositories for ComposioHQ organization."""
        print(f"\n🔍 Fetching repositories for {self.org_name}...")
        
        url = f"{self.github_base_url}/orgs/{self.org_name}/repos"
        params = {'sort': 'updated', 'direction': 'desc'}
        
        repos = self.make_github_request(url, params)
        
        if repos:
            print(f"✅ Found {len(repos)} repositories")
            
            # Display summary
            print("\n📋 Repository Summary:")
            print("| Name | Stars | Forks | Language | Updated |")
            print("|------|-------|-------|----------|---------|")
            
            for repo in repos[:10]:  # Show top 10
                name = repo.get('name', 'N/A')
                stars = repo.get('stargazers_count', 0)
                forks = repo.get('forks_count', 0)
                language = repo.get('language', 'N/A') or 'N/A'
                updated = repo.get('updated_at', 'N/A')[:10]
                
                print(f"| {name} | {stars} | {forks} | {language} | {updated} |")
            
            if len(repos) > 10:
                print(f"| ... and {len(repos) - 10} more repositories | | | | |")
        
        return repos
    
    def fetch_repository_issues(self, owner: str, repo: str) -> List[Dict]:
        """Fetch all issues for a specific repository."""
        print(f"\n🐛 Fetching issues for {owner}/{repo}...")
        
        url = f"{self.github_base_url}/repos/{owner}/{repo}/issues"
        params = {'state': 'all', 'sort': 'updated', 'direction': 'desc'}
        
        issues = self.make_github_request(url, params)
        
        # Filter out pull requests (GitHub API includes PRs in issues)
        actual_issues = [issue for issue in issues if not issue.get('pull_request')]
        
        if actual_issues:
            print(f"✅ Found {len(actual_issues)} issues")
            
            # Count by state
            open_count = sum(1 for issue in actual_issues if issue.get('state') == 'open')
            closed_count = sum(1 for issue in actual_issues if issue.get('state') == 'closed')
            
            print(f"\n📊 Issue Statistics:")
            print(f"  🟢 Open: {open_count}")
            print(f"  🔴 Closed: {closed_count}")
            print(f"  📊 Total: {len(actual_issues)}")
            
            # Display recent issues
            print("\n📋 Recent Issues:")
            print("| # | Title | State | Author | Created | Labels |")
            print("|---|-------|-------|---------|---------|---------|")
            
            for issue in actual_issues[:5]:
                number = issue.get('number', 'N/A')
                title = issue.get('title', 'N/A')[:50] + "..." if len(issue.get('title', '')) > 50 else issue.get('title', 'N/A')
                state = issue.get('state', 'N/A')
                author = issue.get('user', {}).get('login', 'N/A')
                created = issue.get('created_at', 'N/A')[:10]
                labels = ", ".join([label.get('name', '') for label in issue.get('labels', [])])[:30]
                
                print(f"| #{number} | {title} | {state} | {author} | {created} | {labels} |")
        
        return actual_issues
    
    def fetch_repository_pulls(self, owner: str, repo: str) -> List[Dict]:
        """Fetch all pull requests for a specific repository."""
        print(f"\n🔄 Fetching pull requests for {owner}/{repo}...")
        
        url = f"{self.github_base_url}/repos/{owner}/{repo}/pulls"
        params = {'state': 'all', 'sort': 'updated', 'direction': 'desc'}
        
        pulls = self.make_github_request(url, params)
        
        if pulls:
            print(f"✅ Found {len(pulls)} pull requests")
            
            # Count by state
            open_count = sum(1 for pr in pulls if pr.get('state') == 'open')
            closed_count = sum(1 for pr in pulls if pr.get('state') == 'closed')
            merged_count = sum(1 for pr in pulls if pr.get('merged_at'))
            
            print(f"\n📊 PR Statistics:")
            print(f"  🟢 Open: {open_count}")
            print(f"  🔴 Closed: {closed_count}")
            print(f"  🟣 Merged: {merged_count}")
            print(f"  📊 Total: {len(pulls)}")
            
            # Display recent PRs
            print("\n📋 Recent Pull Requests:")
            print("| # | Title | State | Author | Created | Merged |")
            print("|---|-------|-------|---------|---------|---------|")
            
            for pr in pulls[:5]:
                number = pr.get('number', 'N/A')
                title = pr.get('title', 'N/A')[:50] + "..." if len(pr.get('title', '')) > 50 else pr.get('title', 'N/A')
                state = pr.get('state', 'N/A')
                author = pr.get('user', {}).get('login', 'N/A')
                created = pr.get('created_at', 'N/A')[:10]
                merged = 'Yes' if pr.get('merged_at') else 'No'
                
                print(f"| #{number} | {title} | {state} | {author} | {created} | {merged} |")
        
        return pulls
    
    def save_context_data(self, repos: List[Dict], issues: List[Dict], pulls: List[Dict]):
        """Save all fetched data to JSON for dashboard integration."""
        print(f"\n💾 Saving context data...")
        
        context_data = {
            'timestamp': datetime.now().isoformat(),
            'organization': self.org_name,
            'target_repository': f"{self.org_name}/{self.target_repo}",
            'summary': {
                'total_repositories': len(repos),
                'total_issues': len(issues),
                'total_pulls': len(pulls),
                'open_issues': sum(1 for issue in issues if issue.get('state') == 'open'),
                'closed_issues': sum(1 for issue in issues if issue.get('state') == 'closed'),
                'open_pulls': sum(1 for pr in pulls if pr.get('state') == 'open'),
                'closed_pulls': sum(1 for pr in pulls if pr.get('state') == 'closed'),
                'merged_pulls': sum(1 for pr in pulls if pr.get('merged_at'))
            },
            'repositories': repos,
            'issues': issues,
            'pull_requests': pulls
        }
        
        # Save main context file
        with open(self.context_file, 'w', encoding='utf-8') as f:
            json.dump(context_data, f, indent=2, ensure_ascii=False)
        
        # Save separate files for each data type
        with open(f"{self.data_dir}/repositories.json", 'w', encoding='utf-8') as f:
            json.dump(repos, f, indent=2, ensure_ascii=False)
        
        with open(f"{self.data_dir}/issues.json", 'w', encoding='utf-8') as f:
            json.dump(issues, f, indent=2, ensure_ascii=False)
        
        with open(f"{self.data_dir}/pull_requests.json", 'w', encoding='utf-8') as f:
            json.dump(pulls, f, indent=2, ensure_ascii=False)
        
        # Create dashboard-friendly summary
        dashboard_summary = {
            'last_updated': datetime.now().isoformat(),
            'stats': context_data['summary'],
            'recent_activity': {
                'recent_issues': [
                    {
                        'number': issue.get('number'),
                        'title': issue.get('title'),
                        'state': issue.get('state'),
                        'created_at': issue.get('created_at'),
                        'html_url': issue.get('html_url')
                    } for issue in issues[:10]
                ],
                'recent_pulls': [
                    {
                        'number': pr.get('number'),
                        'title': pr.get('title'),
                        'state': pr.get('state'),
                        'created_at': pr.get('created_at'),
                        'html_url': pr.get('html_url'),
                        'merged': bool(pr.get('merged_at'))
                    } for pr in pulls[:10]
                ]
            }
        }
        
        with open(f"{self.data_dir}/dashboard_summary.json", 'w', encoding='utf-8') as f:
            json.dump(dashboard_summary, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Context data saved to {self.data_dir}/")
        print(f"📁 Files created:")
        print(f"  - composio_context.json (full data)")
        print(f"  - repositories.json")
        print(f"  - issues.json") 
        print(f"  - pull_requests.json")
        print(f"  - dashboard_summary.json")
    
    def create_search_index(self, issues: List[Dict], pulls: List[Dict]):
        """Create searchable index of issues and PRs using Gemini."""
        if not self.gemini_enabled:
            print("⚠️ Gemini AI not available, skipping search index creation")
            return
        
        print(f"\n🔍 Creating search index with Gemini AI...")
        
        # Prepare data for indexing
        searchable_items = []
        
        # Add issues
        for issue in issues:
            searchable_items.append({
                'type': 'issue',
                'number': issue.get('number'),
                'title': issue.get('title', ''),
                'body': issue.get('body', '')[:1000],  # Limit body length
                'state': issue.get('state'),
                'labels': [label.get('name', '') for label in issue.get('labels', [])],
                'created_at': issue.get('created_at'),
                'html_url': issue.get('html_url')
            })
        
        # Add pull requests
        for pr in pulls:
            searchable_items.append({
                'type': 'pull_request',
                'number': pr.get('number'),
                'title': pr.get('title', ''),
                'body': pr.get('body', '')[:1000],  # Limit body length
                'state': pr.get('state'),
                'created_at': pr.get('created_at'),
                'html_url': pr.get('html_url'),
                'merged': bool(pr.get('merged_at'))
            })
        
        # Create enhanced search data with AI-generated summaries
        search_index = []
        
        print(f"  🤖 Generating AI summaries for {min(20, len(searchable_items))} items...")
        
        for i, item in enumerate(searchable_items[:20]):  # Limit to first 20 for demo
            try:
                # Create prompt for Gemini
                prompt = f"""
                Analyze this GitHub {item['type']} and provide a brief, searchable summary:
                
                Title: {item['title']}
                Body: {item['body'][:500]}
                Labels: {item.get('labels', [])}
                
                Please provide:
                1. A 2-3 sentence summary
                2. Key topics/technologies mentioned
                3. Main issue/feature category
                
                Keep it concise and focus on searchable keywords.
                """
                
                response = self.gemini_model.generate_content(prompt)
                ai_summary = response.text
                
                enhanced_item = item.copy()
                enhanced_item['ai_summary'] = ai_summary
                enhanced_item['search_text'] = f"{item['title']} {item['body']} {ai_summary}".lower()
                
                search_index.append(enhanced_item)
                print(f"  ✅ Processed {i+1}/{min(20, len(searchable_items))}")
                
                time.sleep(0.5)  # Rate limiting for Gemini API
                
            except Exception as e:
                print(f"  ❌ Failed to process item {i+1}: {e}")
                # Add item without AI summary
                enhanced_item = item.copy()
                enhanced_item['ai_summary'] = "AI summary not available"
                enhanced_item['search_text'] = f"{item['title']} {item['body']}".lower()
                search_index.append(enhanced_item)
        
        # Save search index
        with open(f"{self.data_dir}/search_index.json", 'w', encoding='utf-8') as f:
            json.dump(search_index, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Search index created with {len(search_index)} items")
    
    def search_content(self, query: str) -> List[Dict]:
        """Search through issues and PRs using the created index."""
        try:
            with open(f"{self.data_dir}/search_index.json", 'r', encoding='utf-8') as f:
                search_index = json.load(f)
        except FileNotFoundError:
            print("❌ Search index not found. Please run fetch_all_data() first.")
            return []
        
        query_lower = query.lower()
        results = []
        
        for item in search_index:
            search_text = item.get('search_text', '')
            if query_lower in search_text:
                relevance_score = search_text.count(query_lower)
                item_result = item.copy()
                item_result['relevance_score'] = relevance_score
                results.append(item_result)
        
        # Sort by relevance
        results.sort(key=lambda x: x['relevance_score'], reverse=True)
        
        return results
    
    def fetch_all_data(self):
        """Main method to fetch all ComposioHQ data."""
        print(f"\n🚀 Starting comprehensive data fetch for {self.org_name}...")
        
        # Step 1: Fetch all repositories
        repos = self.fetch_organization_repos()
        
        # Step 2: Fetch issues for the main composio repository
        issues = self.fetch_repository_issues(self.org_name, self.target_repo)
        
        # Step 3: Fetch pull requests for the main composio repository  
        pulls = self.fetch_repository_pulls(self.org_name, self.target_repo)
        
        # Step 4: Save all data
        self.save_context_data(repos, issues, pulls)
        
        # Step 5: Create search index
        self.create_search_index(issues, pulls)
        
        print(f"\n🎉 Data fetch completed successfully!")
        print(f"📊 Summary:")
        print(f"  - Repositories: {len(repos)}")
        print(f"  - Issues: {len(issues)}")
        print(f"  - Pull Requests: {len(pulls)}")
        print(f"  - Data saved to: {self.data_dir}/")
        
        return {
            'repositories': repos,
            'issues': issues,
            'pull_requests': pulls
        }

def main():
    """Main function."""
    import argparse
    
    parser = argparse.ArgumentParser(description='ComposioHQ Data Fetcher')
    parser.add_argument('--search', '-s', type=str, help='Search query')
    parser.add_argument('--fetch', '-f', action='store_true', help='Fetch all data')
    
    args = parser.parse_args()
    
    fetcher = ComposioDataFetcher()
    
    if args.fetch:
        # Fetch all data
        fetcher.fetch_all_data()
    
    elif args.search:
        # Search existing data
        print(f"\n🔍 Searching for: '{args.search}'")
        results = fetcher.search_content(args.search)
        
        if results:
            print(f"✅ Found {len(results)} results:")
            print("\n📋 Search Results:")
            print("| Type | # | Title | Relevance |")
            print("|------|---|-------|-----------|")
            
            for result in results[:10]:
                item_type = result.get('type', 'N/A')
                number = result.get('number', 'N/A')
                title = result.get('title', 'N/A')[:50] + "..." if len(result.get('title', '')) > 50 else result.get('title', 'N/A')
                relevance = result.get('relevance_score', 0)
                
                print(f"| {item_type} | #{number} | {title} | {relevance} |")
        else:
            print("❌ No results found")
    
    else:
        # Default: just fetch all data
        fetcher.fetch_all_data()

if __name__ == "__main__":
    main()
