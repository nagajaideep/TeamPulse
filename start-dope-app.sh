#!/bin/bash

echo "🚀 Starting TeamPulse with DOPE File Attachments & Voice Notes!"
echo ""

# Start the server
echo "📡 Starting server..."
cd server
npm start &
SERVER_PID=$!

# Wait a moment for server to start
sleep 3

# Start the client  
echo "🎨 Starting client..."
cd ../client
npm start &
CLIENT_PID=$!

echo ""
echo "✨ TeamPulse is now running with the following DOPE features:"
echo ""
echo "🔥 FILE ATTACHMENTS:"
echo "   • Drag & drop file upload"
echo "   • Multiple file selection"
echo "   • File type validation & icons"
echo "   • Image preview modal"
echo "   • Download functionality"
echo ""
echo "🎤 VOICE NOTES:"
echo "   • Real-time audio recording"
echo "   • Pause/resume controls"
echo "   • Instant playback"
echo "   • Duration tracking"
echo "   • Upload with metadata"
echo ""
echo "📋 AVAILABLE ON:"
echo "   • Tasks (NEW upload endpoints added)"
echo "   • Issues (Enhanced with new modal)"
echo "   • Projects (Enhanced with new modal)"
echo ""
echo "🌐 Access your app at:"
echo "   Client: http://localhost:3000"
echo "   Server: http://localhost:5000"
echo ""
echo "💡 HOW TO TEST:"
echo "   1. Create/open a task, issue, or project"
echo "   2. Click 'View Details' to open the new modals"
echo "   3. Click 'Add Files' for drag & drop upload"
echo "   4. Click 'Voice Note' to record audio"
echo "   5. Enjoy the DOPE user experience! 🎉"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping TeamPulse..."
    kill $SERVER_PID 2>/dev/null
    kill $CLIENT_PID 2>/dev/null
    echo "✅ Stopped successfully!"
    exit 0
}

# Set trap to cleanup on Ctrl+C
trap cleanup SIGINT

# Wait for processes
wait $SERVER_PID $CLIENT_PID
