#!/bin/bash

# Test script for new session structure
# This tests the audio API endpoints with the new storage format

set -e

echo "🧪 Testing New Session Structure"
echo "================================="

# Load environment variables
source .env

API_BASE="${CLOUDFRONT_URL}/api"
AUDIO_API="${API_BASE}/audio"

echo "Using API Base: $API_BASE"
echo "Using Audio API: $AUDIO_API"
echo

# Test 1: Create session metadata (should create new session structure)
echo "1. Testing session metadata creation..."
SESSION_ID="test-session-$(date +%s)"
echo "   Session ID: $SESSION_ID"

METADATA_PAYLOAD='{
  "sessionId": "'$SESSION_ID'",
  "metadata": {
    "title": "Test Session",
    "description": "Testing new session structure",
    "chunkDuration": 5,
    "participants": ["Test User"],
    "tags": ["test", "session-structure"]
  }
}'

echo "   Creating session metadata..."
curl -s -X POST "$AUDIO_API/session-metadata" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TEST_ID_TOKEN" \
  -d "$METADATA_PAYLOAD" | jq '.'

echo

# Test 2: Request chunk upload URL (should use new path structure)
echo "2. Testing chunk upload URL generation..."
CHUNK_PAYLOAD='{
  "sessionId": "'$SESSION_ID'",
  "chunkNumber": 1,
  "duration": 5,
  "contentType": "audio/webm"
}'

echo "   Requesting upload URL for chunk 1..."
curl -s -X POST "$AUDIO_API/upload-chunk" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TEST_ID_TOKEN" \
  -d "$CHUNK_PAYLOAD" | jq '.'

echo

# Test 3: List sessions (should show new format)
echo "3. Testing session listing..."
curl -s -X GET "$AUDIO_API/sessions" \
  -H "Authorization: Bearer $TEST_ID_TOKEN" | jq '.'

echo

echo "✅ Session structure tests completed!"
echo
echo "Expected new structure in S3:"
echo "users/{userId}/audio/sessions/$SESSION_ID/"
echo "├── session.json"
echo "├── chunks/"
echo "│   └── 00000-00005.webm"
echo "├── transcripts/"
echo "├── analysis/"
echo "├── processing/"
echo "└── exports/"