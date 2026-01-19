#!/bin/bash

# Production Startup Script for IODD Application
# This script performs security checks before starting the application

set -e  # Exit on error

echo "========================================="
echo "IODD Production Startup"
echo "========================================="

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
   echo "ERROR: Do not run as root for security reasons"
   exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "ERROR: Node.js version 16 or higher required (current: $(node -v))"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "ERROR: .env file not found"
    echo "Copy .env.production to .env and configure it"
    exit 1
fi

# Load environment variables
export $(grep -v '^#' .env | xargs)

# Verify NODE_ENV is set to production
if [ "$NODE_ENV" != "production" ]; then
    echo "WARNING: NODE_ENV is not set to 'production' (current: $NODE_ENV)"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Verify JWT_SECRET is set and strong
if [ -z "$JWT_SECRET" ]; then
    echo "ERROR: JWT_SECRET not set in .env"
    exit 1
fi

if [ ${#JWT_SECRET} -lt 64 ]; then
    echo "WARNING: JWT_SECRET is less than 64 characters (current: ${#JWT_SECRET})"
    echo "Generate a stronger secret with: node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\""
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Verify database credentials are set
if [ -z "$DB_Host" ] || [ -z "$DB_User" ] || [ -z "$DB_Password" ] || [ -z "$DB_Database" ]; then
    echo "ERROR: Database credentials not fully configured in .env"
    exit 1
fi

# Test database connection
echo "Testing database connection..."
if command -v mysql &> /dev/null; then
    if mysql -h "$DB_Host" -P "$DB_Port" -u "$DB_User" -p"$DB_Password" -e "USE $DB_Database; SELECT 1;" &> /dev/null; then
        echo "✓ Database connection successful"
    else
        echo "ERROR: Cannot connect to database"
        exit 1
    fi
else
    echo "WARNING: mysql client not installed, skipping database connection test"
fi

# Check if port is available
if lsof -Pi :$Server_Port -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "ERROR: Port $Server_Port is already in use"
    echo "Kill the process with: kill \$(lsof -t -i:$Server_Port)"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install --production
fi

# Security checks passed
echo ""
echo "========================================="
echo "Security Checks Passed"
echo "========================================="
echo "Environment: $NODE_ENV"
echo "Server Port: $Server_Port"
echo "Client Port: $Client_Port"
echo "Database: $DB_Database@$DB_Host:$DB_Port"
echo "========================================="
echo ""

# Start application with PM2
if command -v pm2 &> /dev/null; then
    echo "Starting application with PM2..."
    pm2 start api/IODD-Server_u1.08.mjs --name iodd-api --env production
    pm2 save
    echo ""
    echo "Application started successfully!"
    echo "View logs with: pm2 logs iodd-api"
    echo "Monitor with: pm2 monit"
    echo "Stop with: pm2 stop iodd-api"
else
    echo "PM2 not installed. Starting with Node.js..."
    echo "For production, install PM2: npm install -g pm2"
    node api/IODD-Server_u1.08.mjs
fi
