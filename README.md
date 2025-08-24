# TeamPulse - Role-Based Dashboard System

A comprehensive MERN stack application implementing role-based dashboards for Students, Mentors, and Coaches with real-time task management, progress tracking, and team collaboration features.

## 🚀 Features

### Role-Based Access Control
- **Student Dashboard**: View assigned tasks, update status, attend meetings, provide peer feedback
- **Mentor Dashboard**: Create/assign tasks, track student progress, provide mentor feedback, view reports
- **Coach Dashboard**: System-wide overview, team management, comprehensive analytics, user administration

### Real-Time Features
- Live task updates via Socket.IO
- Real-time notifications
- Collaborative task management
- Live progress tracking

### Task Management
- Kanban board interface
- Priority levels (Low, Medium, High, Critical)
- Status tracking (To Do, In Progress, Review, Done)
- Deadline management with overdue alerts
- File attachments support

## 🛠️ Technology Stack

### Frontend
- React 18 with Hooks
- React Router for navigation
- Socket.IO Client for real-time features
- Tailwind CSS for styling
- Lucide React for icons
- React Hot Toast for notifications
- Recharts for data visualization

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT Authentication
- Socket.IO for real-time communication
- Express Validator for input validation
- Multer for file uploads

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd TeamPulse
```

### 2. Install Dependencies

#### Backend Setup
```bash
cd server
npm install
```

#### Frontend Setup
```bash
cd client
npm install
```

### 3. Environment Configuration

Create a `.env` file in the server directory:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/teampulse

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Client URL for CORS
CLIENT_URL=http://localhost:3000
```

### 4. Database Setup

#### Start MongoDB
```bash
# Start MongoDB service (Windows)
net start MongoDB

# Or on macOS/Linux
sudo systemctl start mongod
```

#### Seed the Database
```bash
cd server
npm run seed
```

### 5. Start the Application

#### Start Backend Server
```bash
cd server
npm start
# Server will run on http://localhost:5000
```

#### Start Frontend Client
```bash
cd client
npm start
# Client will run on http://localhost:3000
```

## 👥 Demo Users

After running the seed script, you can login with these demo accounts:

| Role | Email | Password |
|------|-------|----------|
| Coach | coach@demo.com | password |
| Mentor | mentor@demo.com | password |
| Student 1 | student1@demo.com | password |
| Student 2 | student2@demo.com | password |

## 🎯 Role-Based Features

### Student Dashboard
- **View Assigned Tasks**: See only tasks assigned to them
- **Update Task Status**: Mark tasks as "In Progress" or "Done"
- **View Meetings**: See meetings they're invited to
- **Provide Feedback**: Give peer feedback to other students
- **Track Progress**: Monitor personal task completion

### Mentor Dashboard
- **Create Tasks**: Assign new tasks to students
- **Track Assignments**: View tasks they've assigned and student progress
- **Provide Feedback**: Give mentor feedback to students
- **View Reports**: Access student progress reports
- **Manage Students**: Overview of assigned students

### Coach Dashboard
- **System Overview**: View all tasks and projects across the system
- **Team Analytics**: Comprehensive progress reports and weekly summaries
- **User Management**: Oversee all users, meetings, and feedback
- **Performance Metrics**: Track completion rates, attendance, and feedback scores
- **Administrative Actions**: Full system control and configuration

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Tasks (Role-Based Filtering)
- `GET /api/tasks` - Get tasks (filtered by role)
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `PUT /api/tasks/:id/move` - Move task between columns
- `DELETE /api/tasks/:id` - Delete task

### Meetings
- `GET /api/meetings` - Get meetings (filtered by role)
- `POST /api/meetings` - Create meeting
- `PUT /api/meetings/:id` - Update meeting
- `DELETE /api/meetings/:id` - Delete meeting

### Feedback
- `GET /api/feedback` - Get feedback (filtered by role)
- `POST /api/feedback` - Create feedback
- `PUT /api/feedback/:id` - Update feedback

### Reports
- `GET /api/reports` - Get reports (filtered by role)

## 🎨 UI/UX Features

### Responsive Design
- Mobile-first approach
- Adaptive layouts for all screen sizes
- Touch-friendly interfaces

### Theme System
- Role-based color schemes
- Consistent visual hierarchy
- Accessible color contrasts

### Real-Time Updates
- Live task status changes
- Instant notifications
- Collaborative editing indicators

## 🔒 Security Features

- JWT-based authentication
- Role-based access control
- Input validation and sanitization
- Secure password hashing
- CORS configuration
- Protected API endpoints

## 📊 Data Flow

1. **Authentication**: Users login and receive JWT token
2. **Role Detection**: System identifies user role and redirects to appropriate dashboard
3. **Data Filtering**: API endpoints filter data based on user role
4. **Real-Time Updates**: Socket.IO broadcasts changes to relevant users
5. **Permission Checks**: Frontend components check user permissions before rendering

## 🧪 Testing the Role-Based System

### Demo Workflow

1. **Login as Coach**:
   - Navigate to http://localhost:3000
   - Login with `coach@demo.com` / `password`
   - View system-wide overview and analytics

2. **Login as Mentor**:
   - Login with `mentor@demo.com` / `password`
   - Create a new task and assign it to a student
   - View student progress and provide feedback

3. **Login as Student**:
   - Login with `student1@demo.com` / `password`
   - See the newly assigned task from the mentor
   - Update task status and provide peer feedback

4. **Real-Time Testing**:
   - Open multiple browser tabs with different user roles
   - Make changes in one tab and see updates in real-time across all tabs

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB Atlas or cloud MongoDB instance
2. Configure environment variables
3. Deploy to Heroku, Vercel, or AWS

### Frontend Deployment
1. Update API endpoints in production
2. Build the application: `npm run build`
3. Deploy to Netlify, Vercel, or AWS S3

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the demo workflow

---

**TeamPulse** - Empowering teams with role-based collaboration and real-time progress tracking.
