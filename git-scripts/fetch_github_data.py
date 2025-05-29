#!/usr/bin/env python3
"""
GitHub Data Fetcher for Scala 3 (Dotty) Repository
Fetches comprehensive data using GitHub CLI for visualization purposes.
"""

import subprocess
import json
import os
import sys
from datetime import datetime, timedelta
from typing import Dict, List, Any

class GitHubDataFetcher:
    def __init__(self, repo: str = "scala/scala3", output_dir: str = "app"):
        self.repo = repo
        self.output_dir = output_dir
        self.ensure_output_dir()
    
    def ensure_output_dir(self):
        """Create output directory if it doesn't exist."""
        if not os.path.exists(self.output_dir):
            os.makedirs(self.output_dir)
    
    def run_gh_command(self, api_path: str, params: Dict[str, Any] = None) -> List[Dict]:
        """Run GitHub CLI command and return parsed JSON data."""
        try:
            # Build the API URL
            url = f"repos/{self.repo}/{api_path}"
            if params:
                param_str = "&".join([f"{k}={v}" for k, v in params.items()])
                url += f"?{param_str}"
            
            print(f"Fetching: {url}")
            
            # Run the gh command
            result = subprocess.run(
                ["gh", "api", url, "--paginate"],
                capture_output=True,
                text=True,
                check=True
            )
            
            # Parse JSON response
            return json.loads(result.stdout)
        
        except subprocess.CalledProcessError as e:
            print(f"Error running gh command: {e}")
            print(f"stderr: {e.stderr}")
            return []
        except json.JSONDecodeError as e:
            print(f"Error parsing JSON: {e}")
            return []
    
    def fetch_issues(self, state: str = "open") -> List[Dict]:
        """Fetch issues with specified state."""
        print(f"Fetching {state} issues...")
        
        params = {
            "state": state,
            "per_page": 100,
            "sort": "updated",
            "direction": "desc"
        }
        
        issues = self.run_gh_command("issues", params)
        
        print(f"Fetched {len(issues)} {state} issues")
        return issues
    
    def fetch_pull_requests(self, state: str = "open") -> List[Dict]:
        """Fetch pull requests with specified state."""
        print(f"Fetching {state} pull requests...")
        
        params = {
            "state": state,
            "per_page": 100,
            "sort": "updated",
            "direction": "desc"
        }
        
        prs = self.run_gh_command("pulls", params)
        
        print(f"Fetched {len(prs)} {state} pull requests")
        return prs
    
    def fetch_contributors(self) -> List[Dict]:
        """Fetch repository contributors."""
        print("Fetching contributors...")
        
        params = {
            "per_page": 100
        }
        
        contributors = self.run_gh_command("contributors", params)
        
        print(f"Fetched {len(contributors)} contributors")
        return contributors
    
    def fetch_repository_info(self) -> Dict:
        """Fetch general repository information."""
        print("Fetching repository information...")
        
        try:
            result = subprocess.run(
                ["gh", "api", f"repos/{self.repo}"],
                capture_output=True,
                text=True,
                check=True
            )
            
            repo_info = json.loads(result.stdout)
            print("Fetched repository information")
            return repo_info
        
        except (subprocess.CalledProcessError, json.JSONDecodeError) as e:
            print(f"Error fetching repository info: {e}")
            return {}
    
    def fetch_releases(self) -> List[Dict]:
        """Fetch repository releases."""
        print("Fetching releases...")
        
        params = {
            "per_page": 100
        }
        
        releases = self.run_gh_command("releases", params)
        
        print(f"Fetched {len(releases)} releases")
        return releases
    
    def fetch_labels(self) -> List[Dict]:
        """Fetch repository labels."""
        print("Fetching labels...")
        
        params = {
            "per_page": 100
        }
        
        labels = self.run_gh_command("labels", params)
        print(f"Fetched {len(labels)} labels")
        return labels
    
    def save_data(self, data: Any, filename: str):
        """Save data to JSON file."""
        filepath = os.path.join(self.output_dir, filename)
        
        try:
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            print(f"Saved data to {filepath}")
        except Exception as e:
            print(f"Error saving data to {filepath}: {e}")
    
    def process_issues_for_visualization(self, issues: List[Dict]) -> Dict:
        """Process issues data for visualization."""
        processed = {
            "total_count": len(issues),
            "issues": [],
            "labels_stats": {},
            "monthly_stats": {},
            "assignee_stats": {}
        }
        
        for issue in issues:
            # Extract relevant fields
            issue_data = {
                "id": issue.get("id"),
                "number": issue.get("number"),
                "title": issue.get("title", "")[:100],  # Truncate long titles
                "state": issue.get("state"),
                "created_at": issue.get("created_at"),
                "updated_at": issue.get("updated_at"),
                "closed_at": issue.get("closed_at"),
                "labels": [label.get("name") for label in issue.get("labels", [])],
                "assignees": [assignee.get("login") for assignee in issue.get("assignees", [])],
                "comments": issue.get("comments", 0),
                "author": issue.get("user", {}).get("login", "unknown"),
                "body_length": len(issue.get("body") or ""),
                "milestone": issue.get("milestone", {}).get("title") if issue.get("milestone") else None
            }
            
            processed["issues"].append(issue_data)
            
            # Collect label statistics
            for label in issue_data["labels"]:
                processed["labels_stats"][label] = processed["labels_stats"].get(label, 0) + 1
            
            # Collect monthly statistics
            if issue_data["created_at"]:
                month = issue_data["created_at"][:7]  # YYYY-MM format
                processed["monthly_stats"][month] = processed["monthly_stats"].get(month, 0) + 1
            
            # Collect assignee statistics
            for assignee in issue_data["assignees"]:
                processed["assignee_stats"][assignee] = processed["assignee_stats"].get(assignee, 0) + 1
        
        return processed
    
    def fetch_all_data(self):
        """Fetch all data types and save to files."""
        print(f"Starting data fetch for repository: {self.repo}")
        print("=" * 50)
        
        # Fetch repository information
        repo_info = self.fetch_repository_info()
        if repo_info:
            self.save_data(repo_info, "scala3_repo_info.json")
        
        # Fetch open issues
        open_issues = self.fetch_issues("open")
        if open_issues:
            processed_open = self.process_issues_for_visualization(open_issues)
            self.save_data(open_issues, "scala3_open_issues_raw.json")
            self.save_data(processed_open, "scala3_open_issues.json")
        
        # Fetch closed issues
        closed_issues = self.fetch_issues("closed")
        if closed_issues:
            processed_closed = self.process_issues_for_visualization(closed_issues)
            self.save_data(closed_issues, "scala3_closed_issues_raw.json")
            self.save_data(processed_closed, "scala3_closed_issues.json")
        
        # Fetch open pull requests
        open_prs = self.fetch_pull_requests("open")
        if open_prs:
            self.save_data(open_prs, "scala3_open_prs.json")
        
        # Fetch closed pull requests
        closed_prs = self.fetch_pull_requests("closed")
        if closed_prs:
            self.save_data(closed_prs, "scala3_closed_prs.json")
        
        # Fetch contributors
        contributors = self.fetch_contributors()
        if contributors:
            self.save_data(contributors, "scala3_contributors.json")
        
        # Fetch releases
        releases = self.fetch_releases()
        if releases:
            self.save_data(releases, "scala3_releases.json")
        
        # Fetch labels
        labels = self.fetch_labels()
        if labels:
            self.save_data(labels, "scala3_labels.json")
        
        # Create summary statistics
        summary = {
            "repository": self.repo,
            "fetch_date": datetime.now().isoformat(),
            "data_summary": {
                "open_issues": len(open_issues) if open_issues else 0,
                "closed_issues": len(closed_issues) if closed_issues else 0,
                "open_prs": len(open_prs) if open_prs else 0,
                "closed_prs": len(closed_prs) if closed_prs else 0,
                "contributors": len(contributors) if contributors else 0,
                "releases": len(releases) if releases else 0,
                "labels": len(labels) if labels else 0
            }
        }
        
        self.save_data(summary, "scala3_data_summary.json")
        
        print("=" * 50)
        print("Data fetch completed!")
        print(f"Files saved to: {os.path.abspath(self.output_dir)}")
        print("\nSummary:")
        for key, value in summary["data_summary"].items():
            print(f"  {key.replace('_', ' ').title()}: {value}")

def main():
    """Main function to run the data fetcher."""
    # Check if GitHub CLI is available
    try:
        subprocess.run(["gh", "--version"], capture_output=True, check=True)
        print("GitHub CLI found ✓")
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("Error: GitHub CLI (gh) is not installed or not in PATH")
        print("Please install it from: https://cli.github.com/")
        sys.exit(1)
    
    # Check if user is authenticated
    try:
        result = subprocess.run(["gh", "auth", "status"], capture_output=True, check=True)
        print("GitHub CLI authenticated ✓")
    except subprocess.CalledProcessError:
        print("Error: Not authenticated with GitHub CLI")
        print("Please run: gh auth login")
        sys.exit(1)
    
    # Create fetcher and run
    fetcher = GitHubDataFetcher()
    fetcher.fetch_all_data()

if __name__ == "__main__":
    main()
