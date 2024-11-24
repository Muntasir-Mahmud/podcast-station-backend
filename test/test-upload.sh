#!/bin/bash

# Configuration
API_URL="http://localhost:8787"
PODCAST_FILE="$1"  # First argument should be the path to your podcast file

if [ -z "$PODCAST_FILE" ]; then
    echo "Usage: $0 <path-to-podcast-file>"
    exit 1
fi

if [ ! -f "$PODCAST_FILE" ]; then
    echo "Error: File $PODCAST_FILE does not exist"
    exit 1
fi

echo "Step 1: Initiating upload..."
RESPONSE=$(curl -s -X POST "$API_URL/upload/initiate" \
    -H "Content-Type: application/json" \
    -d "{
        \"fileName\": \"$(basename "$PODCAST_FILE")\",
        \"fileType\": \"audio/mpeg\"
    }")

echo "Raw response: $RESPONSE"

# Parse JSON response
UPLOAD_URL=$(echo "$RESPONSE" | sed 's/.*"uploadUrl":"\([^"]*\)".*/\1/')
FILE_KEY=$(echo "$RESPONSE" | sed 's/.*"fileKey":"\([^"]*\)".*/\1/')

if [ -z "$UPLOAD_URL" ] || [ -z "$FILE_KEY" ]; then
    echo "Error: Failed to parse upload URL or file key"
    exit 1
fi

echo "Got file key: $FILE_KEY"
echo "Got upload URL: $UPLOAD_URL"

echo "Step 2: Uploading file..."
UPLOAD_RESPONSE=$(curl -s -X PUT "$UPLOAD_URL" \
    --data-binary "@$PODCAST_FILE" \
    -H "Content-Type: audio/mpeg")

echo "Got upload Response: $UPLOAD_RESPONSE"

if [ $? -ne 0 ]; then
    echo "Error: Failed to upload file"
    echo "Response: $UPLOAD_RESPONSE"
    exit 1
fi

echo "File uploaded successfully"

echo "Step 3: Completing upload..."
COMPLETE_RESPONSE=$(curl -s -X POST "$API_URL/upload/complete" \
    -H "Content-Type: application/json" \
    -d "{
        \"fileKey\": \"$FILE_KEY\",
        \"podcastData\": {
            \"title\": \"Test Podcast\",
            \"description\": \"This is a test podcast uploaded via curl\",
            \"artist\": \"Test Artist\"
        }
    }")

if [ $? -ne 0 ]; then
    echo "Error: Failed to complete upload"
    echo "Response: $COMPLETE_RESPONSE"
    exit 1
fi

echo "Upload completed successfully!"
echo "Response: $COMPLETE_RESPONSE"
