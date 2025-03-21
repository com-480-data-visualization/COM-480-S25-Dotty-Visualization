import subprocess
import sys
from collections import defaultdict

def check_commit_exists(commit):
    try:
        subprocess.check_output(
            ['git', 'cat-file', '-e', f'{commit}^{{commit}}'],
            stderr=subprocess.STDOUT
        )
        return True
    except subprocess.CalledProcessError:
        return False

def get_commit_authors(commit1, commit2):
    authors = subprocess.check_output(
        ['git', 'log', '--format=%aN', f'{commit1}..{commit2}'],
        text=True
    ).splitlines()
    return [a.strip() for a in authors if a.strip()]

def main():
    if len(sys.argv) != 3:
        print("Usage: python git_author_stats.py commit1 commit2")
        sys.exit(1)

    commit1, commit2 = sys.argv[1], sys.argv[2]

    for commit in [commit1, commit2]:
        if not check_commit_exists(commit):
            print(f"Error: Commit '{commit}' does not exist.")
            sys.exit(1)

    authors = get_commit_authors(commit1, commit2)
    author_counts = defaultdict(int)
    for author in authors:
        author_counts[author] += 1

    sorted_authors = sorted(author_counts.items(), key=lambda x: (-x[1], x[0]))
    max_width = max(len(a) for a in author_counts.keys()) if author_counts else 0

    for author, count in sorted_authors:
        print(f"{author:<{max_width}} : {count}")

if __name__ == "__main__":
    main()