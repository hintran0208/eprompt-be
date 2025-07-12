# Database Setup Guide

This document provides instructions for setting up and configuring the MongoDB database for the ePrompt backend.

## Prerequisites

- MongoDB 4.4 or higher
- Node.js 18+
- npm 9+

## Installation Options

### Option 1: Local MongoDB Installation

#### macOS (using Homebrew)

```bash
# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb-community

# Verify installation
mongosh --eval "db.adminCommand('ismaster')"
```

#### Ubuntu/Debian

```bash
# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB service
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### Windows

1. Download MongoDB Community Server from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. Run the installer and follow the setup wizard
3. Start MongoDB as a Windows service

### Option 2: MongoDB Atlas (Cloud)

1. Create an account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Configure network access (whitelist your IP)
4. Create a database user
5. Get your connection string

### Option 3: Docker

```bash
# Run MongoDB in Docker container
docker run --name eprompt-mongo -d -p 27017:27017 mongo:6.0

# Connect to the container
docker exec -it eprompt-mongo mongosh
```

## Database Configuration

### Environment Variables

Create a `.env` file in the `prompt-engine` directory:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/eprompt

# For MongoDB Atlas
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/eprompt

# For Docker or custom host/port
# MONGODB_URI=mongodb://username:password@host:port/eprompt
```

### Connection Options

The application supports various MongoDB connection options:

```env
# Local development
MONGODB_URI=mongodb://localhost:27017/eprompt

# With authentication
MONGODB_URI=mongodb://username:password@localhost:27017/eprompt

# Atlas cluster
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/eprompt?retryWrites=true&w=majority

# Replica set
MONGODB_URI=mongodb://host1:port1,host2:port2/eprompt?replicaSet=myReplicaSet
```

## Database Schema

### PromptTemplate Collection

The application uses a `prompt_templates` collection with the following schema:

```javascript
{
  _id: ObjectId,
  id: String,              // Unique identifier (required, unique)
  name: String,            // Human-readable name (required)
  description: String,     // Template description (required)
  template: String,        // Template string with {{variables}} (required)
  role: String,           // Role context (required)
  useCase: String,        // Use case description (required)
  requiredFields: [String], // Required context variables (required)
  optionalFields: [String], // Optional context variables (default: [])
  metadata: Mixed,         // Additional metadata (default: {})
  createdAt: Date,        // Auto-generated creation timestamp
  updatedAt: Date         // Auto-generated update timestamp
}
```

### Indexes

The application automatically creates the following indexes:

- `id`: Unique index on the `id` field
- `name`: Index on the `name` field for faster searches
- `useCase`: Index on the `useCase` field for filtering

## Initial Data Setup

### Sample Templates

You can populate the database with sample templates using the API:

````bash
# Add a greeting template
curl -X POST http://localhost:3000/template/add \
  -H "Content-Type: application/json" \
  -d '{
    "id": "greeting",
    "name": "User Greeting",
    "description": "Generate personalized user greetings",
    "template": "Hello {{name}}! Welcome to {{platform}}. As a {{role}}, you can {{action}}.",
    "role": "Assistant",
    "useCase": "User Onboarding",
    "requiredFields": ["name", "platform"],
    "optionalFields": ["role", "action"]
  }'

# Add a code review template
curl -X POST http://localhost:3000/template/add \
  -H "Content-Type: application/json" \
  -d '{
    "id": "code-review",
    "name": "Code Review Template",
    "description": "Generate comprehensive code review prompts",
    "template": "As a {{role}}, review the following {{language}} code:\n\n```{{language}}\n{{code}}\n```\n\nPlease provide feedback on:\n- Correctness\n- Performance\n- Best practices\n- Security considerations\n\nFocus particularly on {{focus_areas}}.",
    "role": "Code Reviewer",
    "useCase": "Code Review",
    "requiredFields": ["role", "language", "code"],
    "optionalFields": ["focus_areas"]
  }'
````

### Bulk Import Script

For bulk data import, you can use the MongoDB import tool:

```bash
# Create a JSON file with templates
echo '[
  {
    "id": "blog-post",
    "name": "Blog Post Outline",
    "description": "Generate blog post outlines",
    "template": "Create a comprehensive blog post outline about {{topic}} for {{audience}}.",
    "role": "Content Creator",
    "useCase": "Content Generation",
    "requiredFields": ["topic", "audience"],
    "optionalFields": ["tone", "length"],
    "metadata": {},
    "createdAt": {"$date": "2025-07-12T10:00:00.000Z"},
    "updatedAt": {"$date": "2025-07-12T10:00:00.000Z"}
  }
]' > sample_templates.json

# Import using mongoimport
mongoimport --db eprompt --collection prompt_templates --file sample_templates.json --jsonArray
```

## Monitoring and Maintenance

### Connection Health Check

The application automatically checks database connectivity on startup. You can also manually verify:

```bash
# Check if the API can connect to the database
curl http://localhost:3000/health

# Should return: {"status": "OK", "timestamp": "..."}
```

### Database Operations

```bash
# Connect to MongoDB shell
mongosh mongodb://localhost:27017/eprompt

# View all templates
db.prompt_templates.find().pretty()

# Count templates
db.prompt_templates.countDocuments()

# Find templates by use case
db.prompt_templates.find({"useCase": "Code Review"})

# Create backup
mongodump --db eprompt --out backup/

# Restore from backup
mongorestore --db eprompt backup/eprompt/
```

### Performance Optimization

For production deployments:

1. **Indexes**: Ensure proper indexes are created for frequently queried fields
2. **Connection Pooling**: Configure appropriate connection pool size
3. **Write Concern**: Configure write concern based on your consistency requirements
4. **Read Preference**: Configure read preference for replica sets

```javascript
// Example connection options for production
const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4, // Use IPv4, skip trying IPv6
};
```

## Troubleshooting

### Common Issues

1. **Connection Refused**

   - Ensure MongoDB is running
   - Check if the port (27017) is accessible
   - Verify firewall settings

2. **Authentication Failed**

   - Check username and password in connection string
   - Ensure user has proper permissions
   - Verify database name in connection string

3. **Database Not Found**

   - MongoDB creates databases automatically on first write
   - Ensure the database name in the connection string is correct

4. **Timeout Errors**
   - Check network connectivity
   - Increase timeout values in connection options
   - Verify MongoDB server is responsive

### Logs and Debugging

Enable MongoDB logging for debugging:

```env
# Add to .env file
DEBUG=mongoose:*
```

Check MongoDB logs:

```bash
# Default log location on different systems
# macOS (Homebrew): /usr/local/var/log/mongodb/mongo.log
# Ubuntu: /var/log/mongodb/mongod.log
# Windows: C:\Program Files\MongoDB\Server\6.0\log\mongod.log

tail -f /usr/local/var/log/mongodb/mongo.log
```

## Security Considerations

1. **Authentication**: Always enable authentication in production
2. **Network Security**: Use VPN or private networks when possible
3. **Encryption**: Enable TLS/SSL for connections
4. **Access Control**: Implement role-based access control
5. **Regular Updates**: Keep MongoDB updated to latest stable version

## Migration and Backup

### Backup Strategy

```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --db eprompt --out "backup/eprompt_$DATE"
```

### Migration Scripts

For schema changes, create migration scripts:

```javascript
// Example migration script
use eprompt;

// Add new field to existing documents
db.prompt_templates.updateMany(
  { "version": { $exists: false } },
  { $set: { "version": "1.0" } }
);
```

This completes the database setup guide for the ePrompt backend with MongoDB integration.
