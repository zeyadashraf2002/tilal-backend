#!/bin/bash

# Base URL
BASE_URL="http://localhost:5000/api/v1"

# Login and get token
echo "Logging in..."
TOKEN=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@garden.com","password":"admin123"}' \
  | grep -o '"token":"[^"]*' | sed 's/"token":"//')

echo "Token: $TOKEN"

# Get tasks
echo "Fetching tasks..."
curl -s -X GET $BASE_URL/tasks \
  -H "Authorization: Bearer $TOKEN" \
  | python -m json.tool

# Get clients
echo "Fetching clients..."
curl -s -X GET $BASE_URL/clients \
  -H "Authorization: Bearer $TOKEN" \
  | python -m json.tool
#chmod +x test-api.sh
# ./test-api.sh