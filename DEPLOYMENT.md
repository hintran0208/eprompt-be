# Heroku Deployment Guide

This document provides instructions for deploying the ePrompt Backend API to Heroku using GitHub Actions.

## Prerequisites

1. **Heroku Account**: Create a free account at [heroku.com](https://heroku.com)
2. **Heroku CLI**: Install from [devcenter.heroku.com/articles/heroku-cli](https://devcenter.heroku.com/articles/heroku-cli)
3. **GitHub Repository**: Your code should be in a GitHub repository

## Setup Instructions

### 1. Create Heroku App

```bash
# Login to Heroku
heroku login

# Create a new Heroku app
heroku create your-app-name

# Or use the Heroku dashboard to create the app
```

### 2. Configure GitHub Secrets

In your GitHub repository, go to **Settings** → **Secrets and variables** → **Actions** and add the following secrets:

- `HEROKU_API_KEY`: Your Heroku API key (found in Account Settings → API Key)
- `HEROKU_APP_NAME`: Your Heroku app name
- `HEROKU_EMAIL`: Your Heroku account email

### 3. Set Environment Variables

Set the required environment variables in your Heroku app:

```bash
# Database (automatically set with PostgreSQL addon)
heroku addons:create heroku-postgresql:essential-0 --app your-app-name

# Redis (for Celery background tasks)
heroku addons:create heroku-redis:mini --app your-app-name

# Application settings
heroku config:set SECRET_KEY="your-secret-key" --app your-app-name
heroku config:set OPENAI_API_KEY="your-openai-key" --app your-app-name
heroku config:set ANTHROPIC_API_KEY="your-anthropic-key" --app your-app-name
heroku config:set GEMINI_API_KEY="your-gemini-key" --app your-app-name
heroku config:set COHERE_API_KEY="your-cohere-key" --app your-app-name
heroku config:set SUPABASE_URL="your-supabase-url" --app your-app-name
heroku config:set SUPABASE_KEY="your-supabase-key" --app your-app-name
```

### 4. Database Setup

<!-- If you're using Alembic for database migrations:

```bash
# Run migrations after deployment
heroku run alembic upgrade head --app your-app-name
``` 
TODO Replace with an other Nodejs migration library
-->

## Deployment Process

The GitHub Actions workflow will automatically:

1. **Test**: Run tests with PostgreSQL in a containerized environment
2. **Deploy**: Deploy to Heroku when code is pushed to the `main` branch
3. **Health Check**: Verify the application is running correctly

## Workflow Triggers

- **Push to main**: Triggers test and deploy
- **Pull Request**: Triggers tests only

## Manual Deployment

To deploy manually without GitHub Actions:

```bash
# Add Heroku remote
heroku git:remote -a your-app-name

# Deploy
git push heroku main
```

## Monitoring and Logs

```bash
# View logs
heroku logs --tail --app your-app-name

# Check app status
heroku ps --app your-app-name

# Open app in browser
heroku open --app your-app-name
```

## Environment-Specific Configuration

The app uses different configurations for different environments:

- **Development**: Local settings with SQLite/PostgreSQL
- **Testing**: GitHub Actions with PostgreSQL service
- **Production**: Heroku with PostgreSQL addon

## Troubleshooting

### Common Issues

1. **Build Failures**: Check that all dependencies in `requirements.txt` are valid
2. **Database Errors**: Ensure DATABASE_URL is set and PostgreSQL addon is attached
3. **Environment Variables**: Verify all required secrets are set in both GitHub and Heroku

### Useful Commands

```bash
# Restart the app
heroku restart --app your-app-name

# Scale dynos
heroku ps:scale web=1 --app your-app-name

# Run one-off commands
heroku run python --app your-app-name
```

## Security Notes

- Never commit API keys or secrets to the repository
- Use GitHub Secrets for sensitive information
- Regularly rotate API keys and tokens
- Monitor Heroku logs for security issues

## Cost Optimization

- Use the free tier for development/testing
- Monitor dyno usage and scale appropriately
- Consider using Heroku Scheduler for background tasks instead of always-on workers
