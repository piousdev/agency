#!/bin/bash
# Setup script for E2E tests - creates and configures test user

API_URL="http://localhost:8000"
EMAIL="test.internal@agency.local"
PASSWORD="testpassword123"
NAME="Test Internal User"

echo "🔧 Setting up test user for E2E tests..."

# Try to create user (will fail if exists, that's OK)
echo "Creating user account..."
curl -s -X POST "$API_URL/api/auth/sign-up/email" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"name\":\"$NAME\"}" \
  > /dev/null 2>&1

# Note: We need to manually set is_internal=true in the database
# This can be done via Drizzle Studio or SQL
echo ""
echo "⚠️  MANUAL STEP REQUIRED:"
echo "    Please open Drizzle Studio and set is_internal=true for user: $EMAIL"
echo "    Run: cd apps/api && npx drizzle-kit studio"
echo ""
echo "✅ User account created (if didn't already exist)"
echo "   Email: $EMAIL"
echo "   Password: $PASSWORD"
