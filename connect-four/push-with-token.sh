#!/bin/bash
# Push to GitHub using Personal Access Token
# Usage: ./push-with-token.sh YOUR_TOKEN

if [ -z "$1" ]; then
    echo "❌ Error: Please provide your Personal Access Token"
    echo ""
    echo "Usage: ./push-with-token.sh YOUR_TOKEN"
    echo ""
    echo "To create a token:"
    echo "1. Go to: https://github.com/settings/tokens/new"
    echo "2. Name: Connect-Four"
    echo "3. Check 'repo' scope"
    echo "4. Generate and copy token"
    echo ""
    exit 1
fi

TOKEN="$1"
REPO_URL="https://${TOKEN}@github.com/kennethenow1/Connect-Four-Game-.git"

cd /home/kenneth-enow/ddd/connect-four

echo "🔐 Setting up authenticated remote..."
git remote set-url origin "$REPO_URL"

echo "⬆️  Pushing to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo "   View your repo: https://github.com/kennethenow1/Connect-Four-Game-"
    echo ""
    echo "⚠️  Note: Your token is stored in the remote URL."
    echo "   Consider removing it after pushing:"
    echo "   git remote set-url origin https://github.com/kennethenow1/Connect-Four-Game-.git"
else
    echo ""
    echo "❌ Push failed. Check your token and try again."
    exit 1
fi

