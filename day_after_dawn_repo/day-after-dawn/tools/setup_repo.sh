#!/usr/bin/env bash
# One-time setup: turns this folder into a Git repository with a first commit
# and a version tag, using your own Git name and email.
set -e
cd "$(dirname "$0")/.."
if [ -d .git ]; then echo "This folder is already a Git repository."; exit 1; fi
if [ -z "$(git config user.name)" ] || [ -z "$(git config user.email)" ]; then
  echo "Set your Git identity first (use the email on your GitHub account):"
  echo '  git config --global user.name "Your Name"'
  echo '  git config --global user.email "you@example.com"'
  exit 1
fi
git init -q -b main
git add -A
git commit -q -m "Day After Dawn v1.13.1 - first commit in Git (history before this is in docs/CHANGELOG.md)"
git tag -a v1.13.1 -m "Day After Dawn v1.13.1"
echo "Done: branch main, tag v1.13.1."
echo
echo "Next: create an EMPTY repository on GitHub (no README), then run:"
echo "  git remote add origin https://github.com/YOUR-USERNAME/day-after-dawn.git"
echo "  git push -u origin main --tags"
