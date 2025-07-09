#!/bin/bash

# Heroku Deployment Script
# Usage: ./deploy.sh [app-name]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default app name
APP_NAME=${1:-""}

echo -e "${GREEN}🚀 ePrompt Backend Deployment Script${NC}"
echo "=================================="

# Check if app name is provided
if [ -z "$APP_NAME" ]; then
    echo -e "${RED}❌ Error: Please provide the Heroku app name${NC}"
    echo "Usage: ./deploy.sh <app-name>"
    exit 1
fi

# Check if Heroku CLI is installed
if ! command -v heroku &> /dev/null; then
    echo -e "${RED}❌ Error: Heroku CLI is not installed${NC}"
    echo "Please install it from: https://devcenter.heroku.com/articles/heroku-cli"
    exit 1
fi

# Check if user is logged in to Heroku
if ! heroku auth:whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  You are not logged in to Heroku${NC}"
    echo "Logging in..."
    heroku login
fi

echo -e "${GREEN}📋 Pre-deployment checks...${NC}"

# Check if the app exists
if ! heroku apps:info --app "$APP_NAME" &> /dev/null; then
    echo -e "${YELLOW}⚠️  App '$APP_NAME' does not exist. Creating it...${NC}"
    heroku create "$APP_NAME"
fi

# Check git status
if [[ -n $(git status -s) ]]; then
    echo -e "${YELLOW}⚠️  You have uncommitted changes. Please commit them first.${NC}"
    git status -s
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo -e "${GREEN}🔧 Setting up Heroku add-ons...${NC}"

# Add PostgreSQL if not exists
if ! heroku addons --app "$APP_NAME" | grep -q "heroku-postgresql"; then
    echo "Adding PostgreSQL..."
    heroku addons:create heroku-postgresql:essential-0 --app "$APP_NAME"
fi

# Add Redis if not exists
if ! heroku addons --app "$APP_NAME" | grep -q "heroku-redis"; then
    echo "Adding Redis..."
    heroku addons:create heroku-redis:mini --app "$APP_NAME"
fi

echo -e "${GREEN}🔑 Checking environment variables...${NC}"

# Check if SECRET_KEY is set
if ! heroku config:get SECRET_KEY --app "$APP_NAME" &> /dev/null || [ -z "$(heroku config:get SECRET_KEY --app "$APP_NAME")" ]; then
    echo "Setting SECRET_KEY..."
    SECRET_KEY=$(python -c "import secrets; print(secrets.token_urlsafe(32))")
    heroku config:set SECRET_KEY="$SECRET_KEY" --app "$APP_NAME"
fi

# Reminder about other environment variables
echo -e "${YELLOW}⚠️  Make sure to set these environment variables in Heroku:${NC}"
echo "   - OPENAI_API_KEY"
echo "   - ANTHROPIC_API_KEY"
echo "   - GEMINI_API_KEY"
echo "   - COHERE_API_KEY"
echo "   - SUPABASE_URL"
echo "   - SUPABASE_KEY"
echo ""
echo "You can set them using:"
echo "   heroku config:set OPENAI_API_KEY=your_key --app $APP_NAME"

echo -e "${GREEN}🚀 Deploying to Heroku...${NC}"

# Add Heroku remote if it doesn't exist
if ! git remote | grep -q "heroku"; then
    heroku git:remote --app "$APP_NAME"
fi

# Deploy
git push heroku main

echo -e "${GREEN}🔄 Running post-deployment tasks...${NC}"

# Run migrations if alembic.ini exists
# if [ -f "alembic.ini" ]; then
#     echo "Running database migrations..."
#     heroku run alembic upgrade head --app "$APP_NAME"
# fi 
# TODO Replace with an other Nodejs migration library

# Health check
echo -e "${GREEN}🏥 Performing health check...${NC}"
sleep 10  # Wait for app to start

APP_URL="https://$APP_NAME.herokuapp.com"
HEALTH_URL="$APP_URL/health"

if curl -s "$HEALTH_URL" | grep -q "healthy"; then
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo "App URL: $APP_URL"
    echo "Health check: $HEALTH_URL"
else
    echo -e "${RED}❌ Health check failed${NC}"
    echo "Check logs: heroku logs --tail --app $APP_NAME"
    exit 1
fi

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
