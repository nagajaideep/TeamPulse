@echo off
echo 🚀 Starting TeamPulse with Enhanced File Attachments ^& Voice Notes!
echo.

echo 📡 Starting server...
cd server
start "TeamPulse Server" cmd /k "npm start"

timeout /t 3 /nobreak >nul

echo 🎨 Starting client...
cd ..\client
start "TeamPulse Client" cmd /k "npm start"

echo.
echo ✨ TeamPulse is now running with enhanced features:
echo.
echo 🔥 FILE ATTACHMENTS:
echo    • Drag ^& drop file upload
echo    • Multiple file selection
echo    • File type validation ^& icons
echo    • Image preview modal
echo    • Download functionality
echo.
echo 🎤 VOICE NOTES:
echo    • Real-time audio recording
echo    • Pause/resume controls
echo    • Instant playback
echo    • Duration tracking
echo    • Upload with metadata
echo.
echo 📋 AVAILABLE ON:
echo    • Tasks (NEW upload endpoints added)
echo    • Issues (Enhanced with new modal)
echo    • Projects (Enhanced with new modal)
echo.
echo 🌐 Access your app at:
echo    Client: http://localhost:3000
echo    Server: http://localhost:5000
echo.
echo 💡 HOW TO TEST:
echo    1. Create/open a task, issue, or project
echo    2. Click 'View Details' to open the new modals
echo    3. Click 'Add Files' for drag ^& drop upload
echo    4. Click 'Voice Note' to record audio
echo    5. Enjoy the enhanced TeamPulse experience! 🎉
echo.
echo Press any key to exit...
pause >nul
