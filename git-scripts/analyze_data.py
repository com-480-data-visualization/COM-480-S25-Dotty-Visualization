#!/usr/bin/env python3
"""
Data Explorer for Scala 3 GitHub Data
Analyzes the fetched data and provides insights for visualization.
"""

import json
import os
from datetime import datetime
from collections import Counter, defaultdict
from typing import Dict, List, Any

class DataExplorer:
    def __init__(self, data_dir: str = "app"):
        self.data_dir = data_dir
        self.data = {}
        self.load_all_data()
    
    def load_all_data(self):
        """Load all JSON data files."""
        files_to_load = [
            "scala3_repo_info.json",
            "scala3_open_issues.json",
            "scala3_closed_issues.json",
            "scala3_open_prs.json",
            "scala3_closed_prs.json",
            "scala3_contributors.json",
            "scala3_releases.json",
            "scala3_labels.json",
            "scala3_data_summary.json"
        ]
        
        for filename in files_to_load:
            filepath = os.path.join(self.data_dir, filename)
            if os.path.exists(filepath):
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        key = filename.replace('scala3_', '').replace('.json', '')
                        self.data[key] = json.load(f)
                    print(f"✓ Loaded {filename}")
                except Exception as e:
                    print(f"✗ Error loading {filename}: {e}")
            else:
                print(f"✗ File not found: {filename}")
    
    def analyze_issues_timeline(self):
        """Analyze issues creation timeline."""
        print("\n" + "="*60)
        print("ISSUES TIMELINE ANALYSIS")
        print("="*60)
        
        open_issues = self.data.get('open_issues', {}).get('issues', [])
        closed_issues = self.data.get('closed_issues', {}).get('issues', [])
        
        all_issues = open_issues + closed_issues
        
        # Monthly creation stats
        monthly_created = defaultdict(int)
        monthly_closed = defaultdict(int)
        
        for issue in all_issues:
            if issue.get('created_at'):
                month = issue['created_at'][:7]  # YYYY-MM
                monthly_created[month] += 1
            
            if issue.get('closed_at'):
                month = issue['closed_at'][:7]  # YYYY-MM
                monthly_closed[month] += 1
        
        print(f"Total issues analyzed: {len(all_issues)}")
        print(f"Open issues: {len(open_issues)}")
        print(f"Closed issues: {len(closed_issues)}")
        
        # Recent months activity
        recent_months = sorted(monthly_created.keys())[-12:]
        print(f"\nRecent 12 months activity:")
        for month in recent_months:
            created = monthly_created[month]
            closed = monthly_closed[month]
            print(f"  {month}: {created:3d} created, {closed:3d} closed")
    
    def analyze_labels(self):
        """Analyze issue labels."""
        print("\n" + "="*60)
        print("LABELS ANALYSIS")
        print("="*60)
        
        open_issues = self.data.get('open_issues', {}).get('issues', [])
        closed_issues = self.data.get('closed_issues', {}).get('issues', [])
        
        all_labels = []
        for issue in open_issues + closed_issues:
            all_labels.extend(issue.get('labels', []))
        
        label_counts = Counter(all_labels)
        
        print(f"Total unique labels: {len(label_counts)}")
        print(f"Most common labels:")
        for label, count in label_counts.most_common(15):
            print(f"  {label:30} {count:4d}")
        
        # Category analysis
        categories = {
            'area': [l for l in label_counts.keys() if l.startswith('area:')],
            'itype': [l for l in label_counts.keys() if l.startswith('itype:')],
            'stat': [l for l in label_counts.keys() if l.startswith('stat:')],
            'cc': [l for l in label_counts.keys() if l.startswith('cc:')]
        }
        
        print(f"\nLabel categories:")
        for category, labels in categories.items():
            print(f"  {category}: {len(labels)} labels")
    
    def analyze_contributors(self):
        """Analyze contributors data."""
        print("\n" + "="*60)
        print("CONTRIBUTORS ANALYSIS")
        print("="*60)
        
        contributors = self.data.get('contributors', [])
        
        if not contributors:
            print("No contributors data available")
            return
        
        print(f"Total contributors: {len(contributors)}")
        
        # Top contributors by commits
        top_contributors = sorted(contributors, key=lambda x: x.get('contributions', 0), reverse=True)[:10]
        print(f"\nTop 10 contributors by commits:")
        for i, contributor in enumerate(top_contributors, 1):
            login = contributor.get('login', 'unknown')
            contributions = contributor.get('contributions', 0)
            print(f"  {i:2d}. {login:20} {contributions:4d} commits")
        
        # Contribution distribution
        contributions = [c.get('contributions', 0) for c in contributors]
        total_contributions = sum(contributions)
        print(f"\nContribution statistics:")
        print(f"  Total commits: {total_contributions}")
        print(f"  Average per contributor: {total_contributions / len(contributors):.1f}")
        print(f"  Median contributions: {sorted(contributions)[len(contributions)//2]}")
    
    def analyze_releases(self):
        """Analyze releases data."""
        print("\n" + "="*60)
        print("RELEASES ANALYSIS")
        print("="*60)
        
        releases = self.data.get('releases', [])
        
        if not releases:
            print("No releases data available")
            return
        
        print(f"Total releases: {len(releases)}")
        
        # Recent releases
        recent_releases = sorted(releases, key=lambda x: x.get('published_at', ''), reverse=True)[:10]
        print(f"\nRecent 10 releases:")
        for release in recent_releases:
            name = release.get('name', release.get('tag_name', 'Unknown'))
            published = release.get('published_at', 'Unknown')[:10]  # YYYY-MM-DD
            prerelease = " (pre)" if release.get('prerelease') else ""
            print(f"  {name:20} {published}{prerelease}")
        
        # Release frequency
        yearly_releases = defaultdict(int)
        for release in releases:
            if release.get('published_at'):
                year = release['published_at'][:4]
                yearly_releases[year] += 1
        
        print(f"\nReleases by year:")
        for year in sorted(yearly_releases.keys()):
            print(f"  {year}: {yearly_releases[year]} releases")
    
    def analyze_pull_requests(self):
        """Analyze pull requests data."""
        print("\n" + "="*60)
        print("PULL REQUESTS ANALYSIS")
        print("="*60)
        
        open_prs = self.data.get('open_prs', [])
        closed_prs = self.data.get('closed_prs', [])
        
        print(f"Open PRs: {len(open_prs)}")
        print(f"Recently closed PRs: {len(closed_prs)}")
        
        # PR authors
        all_authors = []
        for pr in open_prs + closed_prs:
            author = pr.get('user', {}).get('login')
            if author:
                all_authors.append(author)
        
        author_counts = Counter(all_authors)
        print(f"\nTop PR authors:")
        for author, count in author_counts.most_common(10):
            print(f"  {author:20} {count:3d} PRs")
    
    def generate_visualization_data(self):
        """Generate processed data files for visualization."""
        print("\n" + "="*60)
        print("GENERATING VISUALIZATION DATA")
        print("="*60)
        
        # Issues timeline data
        open_issues = self.data.get('open_issues', {}).get('issues', [])
        closed_issues = self.data.get('closed_issues', {}).get('issues', [])
        
        timeline_data = []
        for issue in open_issues + closed_issues:
            if issue.get('created_at'):
                timeline_data.append({
                    'date': issue['created_at'][:10],
                    'type': 'created',
                    'state': issue.get('state', 'unknown'),
                    'number': issue.get('number'),
                    'labels': issue.get('labels', [])
                })
            
            if issue.get('closed_at'):
                timeline_data.append({
                    'date': issue['closed_at'][:10],
                    'type': 'closed',
                    'state': issue.get('state', 'unknown'),
                    'number': issue.get('number'),
                    'labels': issue.get('labels', [])
                })
        
        # Sort by date
        timeline_data.sort(key=lambda x: x['date'])
        
        # Save timeline data
        timeline_file = os.path.join(self.data_dir, 'visualization_timeline.json')
        with open(timeline_file, 'w', encoding='utf-8') as f:
            json.dump(timeline_data, f, indent=2)
        print(f"✓ Generated {timeline_file}")
        
        # Labels summary
        labels_summary = self.data.get('open_issues', {}).get('labels_stats', {})
        labels_summary.update(self.data.get('closed_issues', {}).get('labels_stats', {}))
        
        labels_file = os.path.join(self.data_dir, 'visualization_labels.json')
        with open(labels_file, 'w', encoding='utf-8') as f:
            json.dump(labels_summary, f, indent=2)
        print(f"✓ Generated {labels_file}")
        
        # Contributors summary
        contributors = self.data.get('contributors', [])
        contributors_viz = [
            {
                'login': c.get('login'),
                'contributions': c.get('contributions', 0),
                'avatar_url': c.get('avatar_url')
            }
            for c in contributors[:50]  # Top 50 contributors
        ]
        
        contributors_file = os.path.join(self.data_dir, 'visualization_contributors.json')
        with open(contributors_file, 'w', encoding='utf-8') as f:
            json.dump(contributors_viz, f, indent=2)
        print(f"✓ Generated {contributors_file}")
    
    def run_analysis(self):
        """Run complete data analysis."""
        print("SCALA 3 GITHUB DATA ANALYSIS")
        print("="*60)
        print(f"Data directory: {os.path.abspath(self.data_dir)}")
        print(f"Analysis date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        self.analyze_issues_timeline()
        self.analyze_labels()
        self.analyze_contributors()
        self.analyze_releases()
        self.analyze_pull_requests()
        self.generate_visualization_data()
        
        print("\n" + "="*60)
        print("ANALYSIS COMPLETE")
        print("="*60)

def main():
    """Main function."""
    explorer = DataExplorer()
    explorer.run_analysis()

if __name__ == "__main__":
    main()
