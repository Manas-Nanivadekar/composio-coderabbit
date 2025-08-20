#!/usr/bin/env python
"""
Test GitHub workflow: List repos then fetch PRs for a specific repo.
This bypasses the LLM requirement for testing purposes.
"""

import requests
import json
import sys
from datetime import datetime

def list_repositories(username):
    """List repositories for a GitHub user."""
    
    print(f"🔍 Listing repositories for user: {username}")
    
    url = f"https://api.github.com/users/{username}/repos"
    params = {
        'per_page': 100,
        'sort': 'updated',
        'direction': 'desc'
    }
    
    try:
        response = requests.get(url, params=params)
        
        if response.status_code == 200:
            repos = response.json()
            
            print(f"✅ Found {len(repos)} repositories")
            
            # Create repositories table
            print("\n📋 Repositories:")
            print("| Name | Full Name | URL | Visibility | Fork | Description |")
            print("|------|-----------|-----|------------|------|-------------|")
            
            repo_list = []
            for repo in repos:
                name = repo.get('name', 'N/A')
                full_name = repo.get('full_name', 'N/A')
                html_url = repo.get('html_url', 'N/A')
                private = repo.get('private', False)
                visibility = 'private' if private else 'public'
                fork = repo.get('fork', False)
                description = repo.get('description', 'No description') or 'No description'
                
                if len(description) > 50:
                    description = description[:47] + "..."
                
                print(f"| {name} | {full_name} | {html_url} | {visibility} | {fork} | {description} |")
                
                repo_list.append({
                    'name': name,
                    'full_name': full_name,
                    'owner': repo.get('owner', {}).get('login', username)
                })
            
            return repo_list
            
        else:
            print(f"❌ Failed to fetch repositories: {response.status_code}")
            print(f"Response: {response.text}")
            return []
            
    except Exception as e:
        print(f"❌ Error fetching repositories: {e}")
        return []

def fetch_pull_requests(owner, repo_name):
    """Fetch pull requests for a specific repository."""
    
    print(f"\n🔄 Fetching Pull Requests for: {owner}/{repo_name}")
    
    url = f"https://api.github.com/repos/{owner}/{repo_name}/pulls"
    params = {
        'state': 'all',  # Get all PRs (open, closed, merged)
        'per_page': 100,
        'sort': 'updated',
        'direction': 'desc'
    }
    
    try:
        response = requests.get(url, params=params)
        
        if response.status_code == 200:
            prs = response.json()
            
            if not prs:
                print("ℹ️ No pull requests found for this repository")
                return []
            
            print(f"✅ Found {len(prs)} pull requests")
            
            # Count PR states
            open_count = sum(1 for pr in prs if pr.get('state') == 'open')
            closed_count = sum(1 for pr in prs if pr.get('state') == 'closed')
            
            print(f"\n📊 PR Statistics:")
            print(f"  🟢 Open: {open_count}")
            print(f"  🔴 Closed: {closed_count}")
            print(f"  📊 Total: {len(prs)}")
            
            # Create PRs table
            print("\n📋 Pull Requests:")
            print("| PR# | Title | State | Author | Created | Updated | URL | Description |")
            print("|-----|-------|-------|---------|---------|---------|-----|-------------|")
            
            for pr in prs:
                number = pr.get('number', 'N/A')
                title = pr.get('title', 'N/A')
                if len(title) > 40:
                    title = title[:37] + "..."
                
                state = pr.get('state', 'N/A')
                author = pr.get('user', {}).get('login', 'N/A')
                created = pr.get('created_at', 'N/A')[:10]  # Just date
                updated = pr.get('updated_at', 'N/A')[:10]  # Just date
                html_url = pr.get('html_url', 'N/A')
                
                body = pr.get('body', 'No description') or 'No description'
                if len(body) > 50:
                    body = body[:47] + "..."
                
                # Clean up body text (remove newlines)
                body = body.replace('\n', ' ').replace('\r', ' ')
                
                print(f"| #{number} | {title} | {state} | {author} | {created} | {updated} | {html_url} | {body} |")
            
            return prs
            
        elif response.status_code == 404:
            print(f"❌ Repository {owner}/{repo_name} not found")
            return []
        else:
            print(f"❌ Failed to fetch PRs: {response.status_code}")
            print(f"Response: {response.text}")
            return []
            
    except Exception as e:
        print(f"❌ Error fetching pull requests: {e}")
        return []

def save_results(username, repos, owner, repo_name, prs):
    """Save results to markdown file."""
    
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    with open('github_workflow_results.md', 'w', encoding='utf-8') as f:
        f.write(f"# GitHub Workflow Results\n\n")
        f.write(f"Generated on: {timestamp}\n\n")
        
        # Repositories section
        f.write(f"## Repositories for {username}\n\n")
        f.write(f"Total repositories: {len(repos)}\n\n")
        f.write("| Name | Full Name | URL | Visibility | Fork | Description |\n")
        f.write("|------|-----------|-----|------------|------|-------------|\n")
        
        for repo in repos:
            # We need to reconstruct the repo data for the file
            f.write(f"| {repo['name']} | {repo['full_name']} | - | - | - | - |\n")
        
        # Pull Requests section  
        f.write(f"\n## Pull Requests for {owner}/{repo_name}\n\n")
        f.write(f"Total PRs: {len(prs)}\n\n")
        
        if prs:
            open_count = sum(1 for pr in prs if pr.get('state') == 'open')
            closed_count = sum(1 for pr in prs if pr.get('state') == 'closed')
            
            f.write(f"- Open: {open_count}\n")
            f.write(f"- Closed: {closed_count}\n\n")
            
            f.write("| PR# | Title | State | Author | Created | Updated | URL | Description |\n")
            f.write("|-----|-------|-------|---------|---------|---------|-----|-------------|\n")
            
            for pr in prs:
                number = pr.get('number', 'N/A')
                title = pr.get('title', 'N/A')
                state = pr.get('state', 'N/A')
                author = pr.get('user', {}).get('login', 'N/A')
                created = pr.get('created_at', 'N/A')[:10]
                updated = pr.get('updated_at', 'N/A')[:10]
                html_url = pr.get('html_url', 'N/A')
                body = (pr.get('body', 'No description') or 'No description')[:100] + "..."
                body = body.replace('\n', ' ').replace('\r', ' ')
                
                f.write(f"| #{number} | {title} | {state} | {author} | {created} | {updated} | {html_url} | {body} |\n")
        else:
            f.write("No pull requests found.\n")
    
    print(f"\n💾 Results saved to github_workflow_results.md")

def main():
    """Main function."""
    
    print("🚀 GitHub Workflow Tester")
    print("=" * 50)
    
    # Get command line arguments
    if len(sys.argv) < 2:
        print("💡 Usage: python test_github_flow.py <username> [repo_name]")
        print("💡 Example: python test_github_flow.py octocat Hello-World")
        return
    
    username = sys.argv[1]
    repo_name = sys.argv[2] if len(sys.argv) > 2 else None
    
    # Step 1: List repositories
    repos = list_repositories(username)
    
    if not repos:
        print("❌ No repositories found. Exiting.")
        return
    
    # Step 2: Determine which repo to fetch PRs for
    if repo_name:
        # Use specified repo
        target_repo = None
        for repo in repos:
            if repo['name'].lower() == repo_name.lower():
                target_repo = repo
                break
        
        if not target_repo:
            print(f"❌ Repository '{repo_name}' not found in {username}'s repositories")
            print(f"Available repositories: {[repo['name'] for repo in repos[:5]]}")
            return
    else:
        # Use the first (most recently updated) repo
        target_repo = repos[0]
        print(f"\n🎯 Using most recent repository: {target_repo['name']}")
    
    # Step 3: Fetch PRs for the selected repository
    prs = fetch_pull_requests(target_repo['owner'], target_repo['name'])
    
    # Step 4: Save results
    save_results(username, repos, target_repo['owner'], target_repo['name'], prs)
    
    print(f"\n✅ Workflow completed successfully!")
    print(f"📊 Summary:")
    print(f"  - Repositories found: {len(repos)}")
    print(f"  - PRs analyzed: {len(prs)}")
    print(f"  - Target repo: {target_repo['owner']}/{target_repo['name']}")

if __name__ == "__main__":
    main()
