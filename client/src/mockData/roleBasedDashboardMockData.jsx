import { formatUserRole, formatDashboardTitle } from '../utils/roleUtils.js';

// Role-based dashboard mock data
export const UserRole = {
  STUDENT: 'student',
  MENTOR: 'mentor', 
  COACH: 'coach'
};

export const DashboardType = {
  STUDENT: 'student',
  MENTOR: 'mentor',
  COACH: 'coach'
};

export const TaskPermission = {
  VIEW_ONLY: 'view_only',
  UPDATE_STATUS: 'update_status', 
  FULL_EDIT: 'full_edit',
  CREATE_ASSIGN: 'create_assign',
  VIEW_ALL: 'view_all'
};
// Import utility functions from centralized location
// Re-export for backward compatibility
export { formatUserRole, formatDashboardTitle };

export const formatTaskCount = (count, role) => {
  if (role === 'student') {
    return count === 1 ? '1 assigned task' : `${count} assigned tasks`;
  } else if (role === 'mentor') {
    return count === 1 ? '1 created task' : `${count} created tasks`;
  } else {
    return count === 1 ? '1 task' : `${count} tasks`;
  }
};

// Mock data for global state store
export const mockStore = {
  currentUser: {
    id: '507f1f77bcf86cd799439011',
    name: 'John Smith',
    email: 'john.smith@example.com',
    role: 'student',
    avatarUrl: 'https://i.pravatar.cc/150?img=1'
  },
  dashboardType: 'student',
  permissions: ['view_only', 'update_status']
};

// Mock data for API queries
export const mockQuery = {
  studentTasks: [
    {
      _id: '507f1f77bcf86cd799439012',
      title: 'Complete React Component',
      description: 'Build the user profile component with form validation',
      status: 'In Progress',
      priority: 'High',
      deadline: '2024-01-15T10:00:00Z',
      assignee: {
        _id: '507f1f77bcf86cd799439011',
        name: 'John Smith',
        email: 'john.smith@example.com'
      },
      assignedBy: {
        _id: '507f1f77bcf86cd799439013',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@example.com'
      },
      createdAt: '2024-01-10T09:00:00Z'
    },
    {
      _id: '507f1f77bcf86cd799439014',
      title: 'Write Unit Tests',
      description: 'Create comprehensive unit tests for the authentication module',
      status: 'To Do',
      priority: 'Medium',
      deadline: '2024-01-20T17:00:00Z',
      assignee: {
        _id: '507f1f77bcf86cd799439011',
        name: 'John Smith',
        email: 'john.smith@example.com'
      },
      assignedBy: {
        _id: '507f1f77bcf86cd799439013',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@example.com'
      },
      createdAt: '2024-01-12T14:30:00Z'
    }
  ],
  
  mentorTasks: [
    {
      _id: '507f1f77bcf86cd799439015',
      title: 'Database Schema Design',
      description: 'Design the database schema for the new feature',
      status: 'Review',
      priority: 'High',
      deadline: '2024-01-18T12:00:00Z',
      assignee: {
        _id: '507f1f77bcf86cd799439016',
        name: 'Mike Chen',
        email: 'mike.chen@example.com'
      },
      assignedBy: {
        _id: '507f1f77bcf86cd799439013',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@example.com'
      },
      createdAt: '2024-01-08T11:00:00Z'
    },
    {
      _id: '507f1f77bcf86cd799439020',
      title: 'API Documentation',
      description: 'Create comprehensive API documentation for the new endpoints',
      status: 'In Progress',
      priority: 'Medium',
      deadline: '2024-01-22T15:00:00Z',
      assignee: {
        _id: '507f1f77bcf86cd799439021',
        name: 'Emma Wilson',
        email: 'emma.wilson@example.com'
      },
      assignedBy: {
        _id: '507f1f77bcf86cd799439013',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@example.com'
      },
      createdAt: '2024-01-14T10:00:00Z'
    }
  ],
  
  allTasks: [

    {
      _id: '507f1f77bcf86cd799439017',
      title: 'System Performance Review',
      description: 'Conduct comprehensive performance analysis',
      status: 'Done',
      priority: 'Critical',
      deadline: '2024-01-12T16:00:00Z',
      assignee: {
        _id: '507f1f77bcf86cd799439018',
        name: 'Alex Rodriguez',
        email: 'alex.rodriguez@example.com'
      },
      assignedBy: {
        _id: '507f1f77bcf86cd799439019',
        name: 'Coach Williams',
        email: 'coach.williams@example.com'
      },
      createdAt: '2024-01-05T08:00:00Z'
    }
  ],
  
  dashboardStats: {
    student: {
      activeTasks: 2,
      completedTasks: 1,
      upcomingMeetings: 1,
      pendingFeedback: 0
    },
    mentor: {
      assignedTasks: 5,
      studentsManaged: 3,
      upcomingMeetings: 2,
      feedbackProvided: 8
    },
    coach: {
      totalTasks: 25,
      totalStudents: 12,
      totalMentors: 4,
      completionRate: 78
    }
  },
  
  users: [
    {
      _id: '507f1f77bcf86cd799439011',
      name: 'John Smith',
      email: 'john.smith@example.com',
      role: 'student',
      avatarUrl: 'https://i.pravatar.cc/150?img=1'
    },
    {
      _id: '507f1f77bcf86cd799439016',
      name: 'Mike Chen',
      email: 'mike.chen@example.com',
      role: 'student',
      avatarUrl: 'https://i.pravatar.cc/150?img=2'
    },
    {
      _id: '507f1f77bcf86cd799439021',
      name: 'Emma Wilson',
      email: 'emma.wilson@example.com',
      role: 'student',
      avatarUrl: 'https://i.pravatar.cc/150?img=3'
    },
    {
      _id: '507f1f77bcf86cd799439013',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      role: 'mentor',
      avatarUrl: 'https://i.pravatar.cc/150?img=4'
    },
    {
      _id: '507f1f77bcf86cd799439019',
      name: 'Coach Williams',
      email: 'coach.williams@example.com',
      role: 'coach',
      avatarUrl: 'https://i.pravatar.cc/150?img=5'
    }
  ]
};

// Mock data for component props
export const mockRootProps = {
  userRole: 'student',
  dashboardType: 'student',
  permissions: ['view_only', 'update_status']
};