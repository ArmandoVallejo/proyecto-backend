#!/bin/bash

# File Upload Feature Demo Script

echo "🗂️ File Upload Feature for Proyecto Backend"
echo "============================================"
echo

# Check if server is running
echo "🔍 Checking if server is running on localhost:3000..."
if ! curl -s http://localhost:3000/ > /dev/null; then
    echo "❌ Server is not running. Please start the server with 'npm start' or 'npm run dev'"
    echo "📝 Run: cd /home/tony/Desktop/backend/proyecto-backend && npm run dev"
    exit 1
fi
echo "✅ Server is running!"
echo

# Create a test project first
echo "📝 Creating a test project..."
TEST_PROJECT=$(curl -s -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "title": "File Upload Test Project",
    "description": "Project for testing file upload functionality",
    "status": "in progress"
  }')

PROJECT_ID=$(echo $TEST_PROJECT | grep -o '"_id":"[^"]*"' | cut -d'"' -f4)

if [ -z "$PROJECT_ID" ]; then
    echo "❌ Failed to create test project"
    exit 1
fi

echo "✅ Test project created with ID: $PROJECT_ID"
echo

# Create test files
echo "📄 Creating test files..."
mkdir -p /tmp/test-uploads
echo "This is a test document for file upload demonstration." > /tmp/test-uploads/test-document.txt
echo "Sample CSV data
Name,Email,Role
John Doe,john@example.com,Developer
Jane Smith,jane@example.com,Designer" > /tmp/test-uploads/test-data.csv

echo "✅ Test files created"
echo

# Upload files
echo "⬆️ Uploading test files..."
UPLOAD_RESULT=$(curl -s -X POST http://localhost:3000/api/projects/$PROJECT_ID/files \
  -F "files=@/tmp/test-uploads/test-document.txt" \
  -F "files=@/tmp/test-uploads/test-data.csv")

echo "📤 Upload Response:"
echo $UPLOAD_RESULT | jq '.' 2>/dev/null || echo $UPLOAD_RESULT
echo

# Get project files
echo "📋 Getting project files..."
FILES_RESULT=$(curl -s http://localhost:3000/api/projects/$PROJECT_ID/files)
echo "📁 Project Files:"
echo $FILES_RESULT | jq '.' 2>/dev/null || echo $FILES_RESULT
echo

# Get file statistics
echo "📊 Getting file statistics..."
STATS_RESULT=$(curl -s http://localhost:3000/api/projects/$PROJECT_ID/files/stats)
echo "📈 File Statistics:"
echo $STATS_RESULT | jq '.' 2>/dev/null || echo $STATS_RESULT
echo

# Clean up test files
echo "🧹 Cleaning up test files..."
rm -rf /tmp/test-uploads

echo "✅ File upload demo completed!"
echo
echo "🎯 Available endpoints tested:"
echo "• POST /api/projects/:projectId/files - Upload files"
echo "• GET /api/projects/:projectId/files - List project files"
echo "• GET /api/projects/:projectId/files/stats - File statistics"
echo "• GET /api/files/:filename - Serve/download files"
echo "• DELETE /api/projects/:projectId/files/:fileId - Delete files"
echo
echo "📚 For more details, see FILE_UPLOAD_GUIDE.md"
echo "🧪 Run comprehensive tests with: npm test"