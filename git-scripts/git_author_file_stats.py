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

def get_commit_author_files(commit):
    lines = subprocess.check_output(
        ['git', 'show', commit, '--pretty=format:%an', '--name-only'],
        text=True
    ).splitlines()
    author = lines[0].strip()
    files = [f.strip() for f in lines[1:] if f.strip()]
    return author, files

def get_intermediate_commits(commit1, commit2):
    revs = subprocess.check_output(
        ['git', 'rev-list', f'{commit1}..{commit2}'],
        text=True
    ).splitlines()
    return revs

def main():
    if len(sys.argv) != 3:
        print("Usage: python git_author_stats.py commit1 commit2")
        sys.exit(1)

    commit1, commit2 = sys.argv[1], sys.argv[2]

    for commit in [commit1, commit2]:
        if not check_commit_exists(commit):
            print(f"Error: Commit '{commit}' does not exist.")
            sys.exit(1)

    def get_module(file):
        tmp = file.split("/")
        return tmp[3] if len(tmp) > 3 else tmp[-1]
    
    author_modules = defaultdict(set)
    commits = get_intermediate_commits(commit1, commit2)

    for commit in commits:
        author, files = get_commit_author_files(commit)
        for file in files:
            module = get_module(file)
            author_modules[author].add(module)

    author_counts = {author: len(modules) for author, modules in author_modules.items()}
    sorted_authors = sorted(author_counts.items(), key=lambda x: (-x[1], x[0]))
    max_width = max(len(a) for a in author_counts.keys()) if author_counts else 0

    for author, count in sorted_authors:
        print(f"{author:<{max_width}} : {count}")

if __name__ == "__main__":
    main()