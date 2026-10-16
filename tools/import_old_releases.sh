#!/usr/bin/env bash
# Imports your saved old builds (.html files) as a dated history on a separate
# branch, "release-history": one commit per file, oldest first, each dated with
# the file's own modification date and tagged archive/<file name>.
# The main branch is not touched.
#   usage: bash tools/import_old_releases.sh "/path/to/old releases"
set -e
SRC="$1"
if [ -z "$SRC" ] || [ ! -d "$SRC" ]; then echo 'usage: bash tools/import_old_releases.sh "/path/to/folder of old .html builds"'; exit 1; fi
SRC="$(cd "$SRC" && pwd)"
cd "$(dirname "$0")/.."
git rev-parse --git-dir >/dev/null 2>&1 || { echo "Run tools/setup_repo.sh first."; exit 1; }
if git show-ref --quiet refs/heads/release-history; then echo "A release-history branch already exists."; exit 1; fi
WT="$(mktemp -d)"
git worktree add -q --detach "$WT"
(
  cd "$WT"
  git checkout -q --orphan release-history
  git rm -rq --cached . >/dev/null 2>&1 || true
  find . -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
  n=0
  while IFS= read -r f; do
    name="$(basename "$f" .html | tr -c 'A-Za-z0-9._-' '_' | sed 's/_*$//')"
    d="$(date -r "$f" "+%Y-%m-%dT%H:%M:%S")"
    cp "$f" build.html
    git add build.html
    GIT_AUTHOR_DATE="$d" GIT_COMMITTER_DATE="$d" git commit -q -m "Archived release: $(basename "$f")"
    git tag "archive/$name"
    echo "  imported $(basename "$f")  ($d)"
    n=$((n+1))
  done < <(ls -tr "$SRC"/*.html)
  echo "$n builds imported onto branch release-history."
)
git worktree remove --force "$WT"
echo "Push it with:  git push origin release-history --tags"
