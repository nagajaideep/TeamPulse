# TeamPulse Test Setup Guide

## Quick Verification Checklist

### 1. Database Connection
- [ ] MongoDB is running
- [ ] Seed script executed successfully
- [ ] Demo users created (Coach, Mentor, 2 Students)

### 2. Backend Server
- [ ] Server starts without errors on port 5000
- [ ] API endpoints respond correctly
- [ ] JWT authentication working
- [ ] Socket.IO connection established

### 3. Frontend Client
- [ ] Client starts without errors on port 3000
- [ ] Login page loads correctly
- [ ] Role-based routing works
- [ ] Dashboard components render properly

### 4. Role-Based Testing

#### Test Coach Login
```bash
Email: coach@demo.com
Password: password
Expected: Coach dashboard with system overview
```

#### Test Mentor Login
```bash
Email: mentor@demo.com
Password: password
Expected: Mentor dashboard with task assignment capabilities
```

#### Test Student Login
```bash
Email: student1@demo.com
Password: password
Expected: Student dashboard with assigned tasks
```

### 5. Real-Time Features
- [ ] Task status updates broadcast to relevant users
- [ ] Socket connection indicators work
- [ ] Live notifications function properly

### 6. API Endpoint Testing

#### Authentication
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json
{
  "email": "coach@demo.com",
  "password": "password"
}
```

#### Tasks (with role-based filtering)
```bash
GET http://localhost:5000/api/tasks
Authorization: Bearer <jwt-token>
```

### 7. Common Issues & Solutions

#### Issue: "Cannot read properties of undefined (reading 'user')"
**Solution**: Ensure AuthContext is properly wrapped around the app in index.jsx

#### Issue: MongoDB connection failed
**Solution**: 
- Start MongoDB service
- Check MONGO_URI in .env file
- Verify database exists

#### Issue: CORS errors
**Solution**: 
- Check CLIENT_URL in server .env
- Ensure client is running on correct port

#### Issue: Socket connection failed
**Solution**:
- Verify Socket.IO server is running
- Check client socket configuration
- Ensure proper CORS settings

### 8. Performance Testing

#### Load Testing
- Multiple users logging in simultaneously
- Real-time updates across multiple tabs
- Task creation and assignment under load

#### Browser Testing
- Chrome, Firefox, Safari, Edge
- Mobile responsive design
- Touch interactions

### 9. Security Testing

#### Authentication
- [ ] Invalid credentials rejected
- [ ] JWT tokens expire correctly
- [ ] Protected routes require authentication

#### Authorization
- [ ] Students can't access mentor features
- [ ] Mentors can't access coach features
- [ ] Role-based API filtering works

### 10. Data Integrity

#### Task Assignment
- [ ] Students only see their assigned tasks
- [ ] Mentors only see tasks they created
- [ ] Coaches see all tasks

#### Real-Time Updates
- [ ] Task status changes reflect immediately
- [ ] New tasks appear for assigned users
- [ ] Deleted tasks disappear from all views

## Success Criteria

✅ All role-based dashboards load correctly
✅ Real-time updates work across multiple users
✅ API endpoints filter data by user role
✅ Authentication and authorization work properly
✅ No console errors in browser
✅ No server errors in terminal
✅ Database operations complete successfully
✅ Socket connections establish and maintain

## Next Steps

1. **Production Deployment**: Configure environment variables for production
2. **Performance Optimization**: Implement caching and database indexing
3. **Additional Features**: Add file uploads, advanced reporting, notifications
4. **Testing Suite**: Implement automated testing with Jest and Cypress
5. **Documentation**: Create API documentation and user guides
