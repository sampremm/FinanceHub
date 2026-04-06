#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 FinanceHub Redis Cache Test${NC}\n"

# Step 1: Login to get JWT token
echo -e "${YELLOW}Step 1: Getting JWT token...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password123"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo -e "${YELLOW}⚠️  Could not get token. Response: $LOGIN_RESPONSE${NC}"
  echo -e "${YELLOW}Trying with a test account...${NC}"
  # Create test user first
  curl -s -X POST http://localhost:3000/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"name":"Test User","email":"testcache@test.com","password":"Test@123"}' > /dev/null
  
  # Try login again
  LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"testcache@test.com","password":"Test@123"}')
  
  TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
fi

if [ -z "$TOKEN" ]; then
  echo -e "${YELLOW}❌ Failed to get token. Exiting.${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Got token: ${TOKEN:0:30}...${NC}\n"

# Step 2: Test dashboard overview cache
echo -e "${YELLOW}Step 2: Testing /dashboard/overview cache...${NC}"

# First call (should hit database)
echo "   📊 First call (DATABASE HIT):"
START=$(date +%s%N)
RESPONSE1=$(curl -s -X GET http://localhost:3000/api/dashboard/overview \
  -H "Authorization: Bearer $TOKEN")
END=$(date +%s%N)
TIME1=$(( ($END - $START) / 1000000 ))

echo "   Response: ${RESPONSE1:0:80}..."
echo -e "   ⏱️  Time: ${TIME1}ms\n"

# Wait 1 second
sleep 1

# Second call (should hit cache)
echo "   📊 Second call (CACHE HIT):"
START=$(date +%s%N)
RESPONSE2=$(curl -s -X GET http://localhost:3000/api/dashboard/overview \
  -H "Authorization: Bearer $TOKEN")
END=$(date +%s%N)
TIME2=$(( ($END - $START) / 1000000 ))

echo "   Response: ${RESPONSE2:0:80}..."
echo -e "   ⏱️  Time: ${TIME2}ms\n"

# Step 3: Check cache keys in Redis
echo -e "${YELLOW}Step 3: Checking Redis cache keys...${NC}"
CACHE_KEYS=$(redis-cli keys "dashboard:*")

if [ -z "$CACHE_KEYS" ]; then
  echo -e "${YELLOW}⚠️  No cache keys found${NC}"
else
  echo -e "${GREEN}✓ Found cache keys:${NC}"
  redis-cli keys "dashboard:*" | sed 's/^/   /'
fi

echo ""

# Step 4: Check cache size
echo -e "${YELLOW}Step 4: Redis cache stats...${NC}"
redis-cli dbsize | sed 's/^/   /'
redis-cli info memory | grep -E "used_memory_human|maxmemory_human" | sed 's/^/   /'

echo ""

# Step 5: Test cache invalidation
echo -e "${YELLOW}Step 5: Testing cache invalidation (creating a record)...${NC}"

# Create a financial record
CREATE_RESPONSE=$(curl -s -X POST http://localhost:3000/api/records \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100.50,
    "type": "INCOME",
    "category": "Salary",
    "date": "2026-04-06",
    "notes": "Test cache invalidation"
  }')

echo "   Record created: ${CREATE_RESPONSE:0:80}..."

sleep 1

# Check if cache was cleared
echo -e "   Checking if cache was cleared..."
CACHE_KEYS_AFTER=$(redis-cli keys "dashboard:*")

if [ -z "$CACHE_KEYS_AFTER" ]; then
  echo -e "${GREEN}✓ Cache was cleared after record creation${NC}"
else
  echo -e "${YELLOW}⚠️  Some cache keys still exist: ${NC}"
  redis-cli keys "dashboard:*" | sed 's/^/     /'
fi

echo ""
echo -e "${GREEN}🎉 Cache test complete!${NC}"
echo ""
echo -e "${BLUE}Summary:${NC}"
echo "   First call (DB):    ${TIME1}ms"
echo "   Second call (Cache): ${TIME2}ms"
if [ $TIME1 -gt $TIME2 ]; then
  SPEEDUP=$(( $TIME1 / $TIME2 ))
  echo -e "   ${GREEN}✓ Speedup: ${SPEEDUP}x faster with cache${NC}"
else
  echo -e "   ${YELLOW}⚠️  Cache may not be working as expected${NC}"
fi
