# TeamPulse - Collaborative Workspace

A real-time collaborative workspace for student-mentor project management with Kanban boards, calendar scheduling, feedback systems, and analytics.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd TeamPulse
npm run install-all
```

2. **Set up environment variables:**
```bash
cp env.example .env
# IMPORTANT: open `.env` and replace the MONGO_URI value with your local MongoDB URL
# for example: `MONGO_URI=mongodb://localhost:27017/team-pulse`
# Also set `JWT_SECRET` to a secure value
```

3. **Seed the database:**
```bash
npm run seed
```

4. **Start the application:**
```bash
# Start the backend server first (from project root):
cd server
node server.js

# In a separate terminal, start the frontend (from project root):
cd ..
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 🎯 Demo Script (60-90 seconds)

### Demo Credentials
- **Mentor**: mentor@demo.com / password
- **Student 1**: student1@demo.com / password  
- **Student 2**: student2@demo.com / password

### Demo Flow

1. **Open two browser tabs** - one for mentor, one for student

2. **Tab 1 (Mentor)**:
   - Login as mentor@demo.com
   - Navigate to Tasks
   - Create new task "Finalize README" assigned to Student1 with deadline
   - Watch real-time task creation

3. **Tab 2 (Student)**:
   - Login as student1@demo.com
   - See task appear live via Socket.IO
   - Drag task from "To Do" → "In Progress"
   - Watch real-time task movement

4. **Tab 1 (Mentor)**:
   - Navigate to Calendar
   - Schedule meeting for tomorrow at 10am
   - Add both students as attendees
   - Watch calendar update in real-time

5. **Tab 2 (Student)**:
   - See meeting appear on calendar
   - Click meeting → Check-in to log attendance
   - Watch attendance update live

6. **Tab 1 (Mentor)**:
   - Navigate to Feedback
   - Submit feedback on the task
   - Navigate to Reports
   - Show weekly analytics and charts

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18 + Tailwind CSS + Socket.IO Client
- **Backend**: Node.js + Express + Socket.IO
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT
- **Real-time**: Socket.IO
- **Charts**: Recharts
- **Calendar**: React Big Calendar

### Key Features
- ✅ Real-time task management with drag & drop
- ✅ Calendar integration for meetings and deadlines
- ✅ Feedback system with ratings
- ✅ Weekly analytics and reports
- ✅ Meeting scheduling with attendance tracking
- ✅ Responsive design with modern UI
- ✅ Socket.IO real-time updates

## 📡 API Endpoints

### Authentication
```bash
# Register
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com", 
  "password": "password123",
  "role": "student"
}

# Login
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Tasks
```bash
# Get all tasks
GET /api/tasks

# Create task
POST /api/tasks
{
  "title": "Task Title",
  "description": "Task description",
  "assignee": "userId",
  "status": "To Do",
  "priority": "Medium",
  "deadline": "2024-01-15"
}

# Update task
PUT /api/tasks/:id
{
  "title": "Updated Title",
  "status": "In Progress"
}

# Move task
PUT /api/tasks/:id/move
{
  "status": "Done"
}

# Delete task
DELETE /api/tasks/:id
```

### Meetings
```bash
# Get all meetings
GET /api/meetings

# Schedule meeting
POST /api/meetings
{
  "title": "Team Standup",
  "description": "Daily standup meeting",
  "datetime": "2024-01-15T10:00:00Z",
  "duration": 60,
  "attendees": ["userId1", "userId2"]
}

# Check-in to meeting
POST /api/meetings/:id/checkin
```

### Feedback
```bash
# Get all feedback
GET /api/feedback

# Submit feedback
POST /api/feedback
{
  "content": "Great work on this task!",
  "rating": 5,
  "type": "task",
  "taskId": "taskId"
}
```

### Reports
```bash
# Get weekly report
GET /api/reports/weekly

# Get all users
GET /api/reports/users
```

## 🔌 Socket.IO Events

### Client → Server
- `join-room` - Join a specific room

### Server → Client
- `taskCreated` - New task created
- `taskUpdated` - Task updated
- `taskMoved` - Task moved between columns
- `taskDeleted` - Task deleted
- `meetingScheduled` - New meeting scheduled
- `meetingCheckin` - Meeting attendance logged
- `feedbackAdded` - New feedback submitted

## 📁 Project Structure

```
TeamPulse/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   └── ...
├── server/                 # Node.js backend
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Express middleware
│   └── ...
├── package.json           # Root package.json
└── README.md
```

## 🚀 Deployment

### Environment Variables
```bash
# Replace MONGO_URI in `server/.env` with your local MongoDB URL, for example:
MONGO_URI=mongodb://localhost:27017/team-pulse
JWT_SECRET=your-super-secret-jwt-key
PORT=5000
NODE_ENV=production
CLIENT_URL=https://your-domain.com
```

### Production Build
```bash
# Build client
cd client && npm run build

# Start server
cd server && npm start
```

## 🎨 Features Overview

### Task Management
- Kanban board with drag & drop
- Task creation, editing, and deletion
- Priority levels and deadlines
- Real-time updates across all clients

### Calendar Integration
- Meeting scheduling with attendees
- Task deadline visualization
- Attendance tracking
- Real-time calendar updates

### Feedback System
- User-to-user feedback
- Task-specific feedback
- Star ratings (1-5)
- Feedback analytics

### Analytics & Reports
- Weekly task completion rates
- User performance metrics
- Feedback statistics
- Interactive charts and graphs

### Real-time Features
- Live task updates
- Instant meeting notifications
- Real-time attendance tracking
- Live feedback submissions

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start both client and server
npm run server       # Start server only
npm run client       # Start client only
npm run seed         # Seed database with demo data
npm run install-all  # Install all dependencies
```

### Database Seeding
The seed script creates:
- 3 demo users (mentor, 2 students)
- 6 sample tasks across different statuses
- 1 scheduled meeting
- 3 sample feedback entries

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
1. Check the demo script above
2. Verify MongoDB connection
3. Check environment variables
4. Review console logs for errors

---

**TeamPulse** - Empowering student-mentor collaboration through real-time project management.