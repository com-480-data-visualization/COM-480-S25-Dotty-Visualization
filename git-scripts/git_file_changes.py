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

def get_file_modification_counts(commit1, commit2):
    revs = subprocess.check_output(
        ['git', 'rev-list', f'{commit1}..{commit2}'],
        text=True
    ).splitlines()

    file_counts = defaultdict(int)

    for rev in revs:
        files = subprocess.check_output(
            ['git', 'diff-tree', '--no-commit-id', '--name-only', '-r', rev],
            text=True
        ).splitlines()
        for file in files:
            file_counts[file] += 1

    return file_counts

def main():
    if len(sys.argv) != 3:
        print("Usage: python git_file_changes.py commit1 commit2")
        sys.exit(1)

    commit1, commit2 = sys.argv[1], sys.argv[2]

    for commit in [commit1, commit2]:
        if not check_commit_exists(commit):
            print(f"Error: Commit '{commit}' does not exist.")
            sys.exit(1)

    counts = get_file_modification_counts(commit1, commit2)

    sorted_files = sorted(counts.items(), key=lambda x: (-x[1], x[0]))
    max_width = max(len(f) for f in counts.keys()) if counts else 0

    for file, count in sorted_files:
        print(f"{file:<{max_width}} : {count}")

if __name__ == "__main__":
    main()

# current
# a5e029ac6e9aa57eefd201efe3852e10e268f0f3
# 744ba922a1729e7670a0db6de981932e60b2b56e
# one year ago
# 0ea0ebafa9c9ff2fdffde76aadde2794ffc88499
# two years ago
# 848aedacca225ffd2e08219cfe1141b4382aaee5

# first commit
# 2308509d2651ee78e1122b5d61b798c984c96c4d