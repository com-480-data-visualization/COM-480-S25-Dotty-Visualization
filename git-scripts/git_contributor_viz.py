#!/usr/bin/env python3
"""
Git Contributor Statistics Data Generator
Processes git commit data and generates JSON for the contributor visualization
"""

import subprocess
import json
import sys
from datetime import datetime, timedelta
from collections import defaultdict
import argparse

def check_commit_exists(commit):
    """Check if a git commit exists in the repository"""
    try:
        subprocess.check_output(
            ['git', 'cat-file', '-e', f'{commit}^{{commit}}'],
            stderr=subprocess.STDOUT
        )
        return True
    except subprocess.CalledProcessError:
        return False

def get_commits_in_range(start_commit, end_commit):
    """Get all commits between two commit hashes"""
    try:
        # Get commit list with author, date, and stats
        cmd = [
            'git', 'log', 
            f'{start_commit}..{end_commit}',
            '--pretty=format:%H|%aN|%aI',
            '--shortstat'
        ]
        
        output = subprocess.check_output(cmd, text=True)
        lines = output.strip().split('\n')
        
        commits = []
        i = 0
        while i < len(lines):
            if '|' in lines[i]:  # Commit info line
                parts = lines[i].split('|')
                if len(parts) == 3:
                    commit_hash, author, date_str = parts
                    
                    # Parse the date
                    commit_date = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
                    
                    # Check if next line contains stats
                    lines_changed = 0
                    if i + 1 < len(lines) and ('insertion' in lines[i + 1] or 'deletion' in lines[i + 1]):
                        stats_line = lines[i + 1]
                        # Parse lines like " 5 files changed, 123 insertions(+), 45 deletions(-)"
                        parts = stats_line.split(',')
                        for part in parts:
                            if 'insertion' in part:
                                lines_changed += int(part.strip().split()[0])
                            elif 'deletion' in part:
                                lines_changed += int(part.strip().split()[0])
                        i += 1  # Skip the stats line
                    
                    commits.append({
                        'hash': commit_hash,
                        'author': author.strip(),
                        'date': commit_date,
                        'lines_changed': lines_changed
                    })
            i += 1
        
        return commits
        
    except subprocess.CalledProcessError as e:
        print(f"Error getting commits: {e}")
        return []

def generate_monthly_stats(commits, start_date=None, end_date=None):
    """Generate monthly statistics from commit data"""
    if not commits:
        return {}
    
    # Determine date range
    if start_date is None:
        start_date = min(commit['date'] for commit in commits)
    if end_date is None:
        end_date = max(commit['date'] for commit in commits)
    
    # Generate monthly buckets
    monthly_stats = defaultdict(lambda: defaultdict(lambda: {'commits': 0, 'lines_changed': 0}))
    
    for commit in commits:
        month_key = commit['date'].strftime('%Y-%m')
        author = commit['author']
        
        monthly_stats[month_key][author]['commits'] += 1
        monthly_stats[month_key][author]['lines_changed'] += commit['lines_changed']
    
    return monthly_stats

def create_visualization_data(monthly_stats, min_commits=5):
    """Create data structure suitable for the web visualization"""
    # Get all contributors and their total stats
    contributor_totals = defaultdict(lambda: {'commits': 0, 'lines_changed': 0})
    
    for month_data in monthly_stats.values():
        for author, stats in month_data.items():
            contributor_totals[author]['commits'] += stats['commits']
            contributor_totals[author]['lines_changed'] += stats['lines_changed']
    
    # Filter contributors by minimum commit threshold
    significant_contributors = {
        author: totals for author, totals in contributor_totals.items()
        if totals['commits'] >= min_commits
    }
    
    # Sort contributors by total commits
    sorted_contributors = sorted(
        significant_contributors.items(),
        key=lambda x: x[1]['commits'],
        reverse=True
    )
    
    # Generate time points (sorted months)
    time_points = sorted(monthly_stats.keys())
    
    # Build the final data structure
    visualization_data = {
        'timePoints': time_points,
        'contributors': []
    }
    
    colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD',
        '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA',
        '#F1948A', '#85C1E9', '#D7BDE2', '#A3E4D7', '#F8BBD9', '#E8DAEF',
        '#D4E6F1', '#A2D9CE', '#F9E79F', '#F5B7B1'
    ]
    
    for i, (author, totals) in enumerate(sorted_contributors):
        contributor_data = {
            'name': author,
            'color': colors[i % len(colors)],
            'totalCommits': totals['commits'],
            'totalLinesChanged': totals['lines_changed'],
            'data': []
        }
        
        # Generate monthly data points
        for month in time_points:
            month_stats = monthly_stats.get(month, {}).get(author, {'commits': 0, 'lines_changed': 0})
            contributor_data['data'].append({
                'time': month,
                'commits': month_stats['commits'],
                'linesChanged': month_stats['lines_changed']
            })
        
        visualization_data['contributors'].append(contributor_data)
    
    return visualization_data

def main():
    parser = argparse.ArgumentParser(description='Generate contributor statistics for visualization')
    parser.add_argument('start_commit', help='Starting commit hash')
    parser.add_argument('end_commit', help='Ending commit hash')
    parser.add_argument('--output', '-o', default='contributors_data.json', help='Output JSON file')
    parser.add_argument('--min-commits', type=int, default=5, help='Minimum commits to include contributor')
    
    args = parser.parse_args()
    
    # Validate commits exist
    for commit in [args.start_commit, args.end_commit]:
        if not check_commit_exists(commit):
            print(f"Error: Commit '{commit}' does not exist.")
            sys.exit(1)
    
    print(f"Processing commits from {args.start_commit} to {args.end_commit}...")
    
    # Get commit data
    commits = get_commits_in_range(args.start_commit, args.end_commit)
    
    if not commits:
        print("No commits found in the specified range.")
        sys.exit(1)
    
    print(f"Found {len(commits)} commits")
    
    # Generate monthly statistics
    monthly_stats = generate_monthly_stats(commits)
    print(f"Generated statistics for {len(monthly_stats)} months")
    
    # Create visualization data
    viz_data = create_visualization_data(monthly_stats, args.min_commits)
    print(f"Included {len(viz_data['contributors'])} contributors with >= {args.min_commits} commits")
    
    # Save to JSON file
    with open(args.output, 'w') as f:
        json.dump(viz_data, f, indent=2)
    
    print(f"Data saved to {args.output}")
    
    # Print summary
    print("\nTop 10 contributors:")
    for i, contributor in enumerate(viz_data['contributors'][:10]):
        print(f"{i+1:2d}. {contributor['name']:<25} : {contributor['totalCommits']:4d} commits, {contributor['totalLinesChanged']:8d} lines")

if __name__ == "__main__":
    main()

# Example usage:
# python git_contributor_viz.py 848aedacca225ffd2e08219cfe1141b4382aaee5 a5e029ac6e9aa57eefd201efe3852e10e268f0f3
