#!/bin/bash

# Simple test script for audio upload functionality
# Usage: ./test-audio-upload.sh [API_URL]

API_URL=${1:-"https://your-api-url.execute-api.region.amazonaws.com/dev"}
TOKEN=${2:-"your-jwt-token"}

echo "🧪 Testing Audio Upload Functionality"
echo "======================================"

if [ "$TOKEN" = "your-jwt-token" ]; then
    echo "❌ Please provide a valid JWT token as the second argument"
    echo "Usage: $0 <API_URL> <JWT_TOKEN>"
    exit 1
fi

# Test audio upload endpoint
echo "📡 Testing upload-chunk endpoint..."
curl -X POST \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"sessionId":"test-session-123","chunkNumber":1,"contentType":"audio/webm"}' \
    "$API_URL/api/audio/upload-chunk"

echo -e "\n\n📡 Testing sessions endpoint..."
curl -X GET \
    -H "Authorization: Bearer $TOKEN" \
    "$API_URL/api/audio/sessions"

echo -e "\n\n✅ Audio upload test completed"
