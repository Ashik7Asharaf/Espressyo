#!/bin/bash

# Exit on error
set -e

echo "🔑 Setting up GitHub secrets..."

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "Installing GitHub CLI..."
    brew install gh
fi

# Login to GitHub if not already logged in
if ! gh auth status &> /dev/null; then
    echo "Please login to GitHub..."
    gh auth login
fi

# Get the repository name
REPO_NAME=$(basename $(git rev-parse --show-toplevel))
REPO_OWNER=$(git config --get remote.origin.url | cut -d'/' -f4)

echo "📦 Setting up secrets for $REPO_OWNER/$REPO_NAME"

# Function to set a secret
set_secret() {
    local name=$1
    local value=$2
    echo "Setting $name..."
    gh secret set $name -b "$value" -R $REPO_OWNER/$REPO_NAME
}

# Get Netlify credentials
echo "🔐 Getting Netlify credentials..."
NETLIFY_AUTH_TOKEN=$(netlify login:get)
NETLIFY_SITE_ID=$(netlify sites:list --json | jq -r '.[0].site_id')

# Set Netlify secrets
set_secret "NETLIFY_AUTH_TOKEN" "$NETLIFY_AUTH_TOKEN"
set_secret "NETLIFY_SITE_ID" "$NETLIFY_SITE_ID"

# Set environment variables from .env.production
if [ -f .env.production ]; then
    echo "📝 Setting environment variables from .env.production..."
    while IFS='=' read -r key value; do
        if [[ ! $key =~ ^#.*$ ]] && [ -n "$key" ]; then
            set_secret "$key" "$value"
        fi
    done < .env.production
fi

# Set server environment variables
if [ -f server/.env ]; then
    echo "📝 Setting server environment variables..."
    while IFS='=' read -r key value; do
        if [[ ! $key =~ ^#.*$ ]] && [ -n "$key" ]; then
            set_secret "SERVER_$key" "$value"
        fi
    done < server/.env
fi

echo "✅ All secrets have been set up successfully!"
echo "
🔍 To verify the secrets:
1. Go to https://github.com/$REPO_OWNER/$REPO_NAME/settings/secrets/actions
2. Check that all secrets are listed correctly
3. Make sure there are no duplicate entries

🚀 Next steps:
1. Push your changes to GitHub
2. The GitHub Actions workflow will automatically deploy to Netlify
3. Check the Actions tab in your repository to monitor the deployment
" 