import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './index.css'
import StudentDashboard from './components/dashboards/StudentDashboard';
import MentorDashboard from './components/dashboards/MentorDashboard';
import CoachDashboard from './components/dashboards/CoachDashboard';
import { 
  LogOut, 
  Menu,
  Wifi
} from 'lucide-react';
import { getRoleIcon, getRoleColor, formatDashboardTitle } from './utils/roleUtils';

// Mock Auth Context for Preview
const MockAuthProvider = ({ children, userRole = 'student' }) => {
  const mockUsers = {
    student: {
      id: '507f1f77bcf86cd799439011',
      name: 'John Smith',
      email: 'john.smith@example.com',
      role: 'student',
      avatarUrl: 'https://i.pravatar.cc/150?img=1'
    },
    mentor: {
      id: '507f1f77bcf86cd799439013',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      role: 'mentor',
      avatarUrl: 'https://i.pravatar.cc/150?img=4'
    },
    coach: {
      id: '507f1f77bcf86cd799439019',
      name: 'Coach Williams',
      email: 'coach.williams@example.com',
      role: 'coach',
      avatarUrl: 'https://i.pravatar.cc/150?img=5'
    }
  };

  const mockAuthValue = {
    user: mockUsers[userRole],
    isAuthenticated: true,
    loading: false,
    login: () => {},
    logout: () => {},
    register: () => {}
  };

  return (
    <div>
      {React.cloneElement(children, { mockAuth: mockAuthValue })}
    </div>
  );
};

// Mock Socket Context for Preview
const MockSocketProvider = ({ children }) => {
  const mockSocketValue = {
    socket: null,
    connected: true,
    emit: () => {},
    on: () => {},
    off: () => {}
  };

  return (
    <div>
      {React.cloneElement(children, { mockSocket: mockSocketValue })}
    </div>
  );
};

const DashboardPreview = ({ userRole, mockAuth, mockSocket }) => {
  const [setSidebarOpen] = useState(false);

  // Ensure mockAuth is available
  const auth = mockAuth || {
    user: {
      id: '507f1f77bcf86cd799439011',
      name: 'John Smith',
      email: 'john.smith@example.com',
      role: userRole || 'student',
      avatarUrl: 'https://i.pravatar.cc/150?img=1'
    },
    isAuthenticated: true,
    loading: false,
    login: () => {},
    logout: () => {},
    register: () => {}
  };



  const renderDashboard = () => {
    // Mock the useAuth and useSocket hooks
    React.useContext = (context) => {
      if (context.displayName === 'AuthContext') {
        return auth;
      }
      if (context.displayName === 'SocketContext') {
        return mockSocket || {
          socket: null,
          connected: true,
          emit: () => {},
          on: () => {},
          off: () => {}
        };
      }
      return {};
    };

    switch (userRole) {
      case 'student':
        return <StudentDashboard />;
      case 'mentor':
        return <MentorDashboard />;
      case 'coach':
        return <CoachDashboard />;
      default:
        return <StudentDashboard />;
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 theme-${userRole}`}>
      {/* Simplified Navigation for Preview */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex h-16 items-center px-4">
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-semibold text-gray-900">TeamPulse</h1>
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(userRole)}`}>
                {getRoleIcon(userRole)}
                <span className="ml-1 capitalize">{userRole}</span>
              </div>
            </div>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            <div className="group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full bg-blue-100 text-blue-900">
              <span className="mr-3 h-5 w-5">📊</span>
              Dashboard
            </div>
            <div className="group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full text-gray-600">
              <span className="mr-3 h-5 w-5">✅</span>
              {userRole === 'student' ? 'My Tasks' : 'Tasks'}
            </div>
            <div className="group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full text-gray-600">
              <span className="mr-3 h-5 w-5">📅</span>
              Calendar
            </div>
            <div className="group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full text-gray-600">
              <span className="mr-3 h-5 w-5">💬</span>
              Feedback
            </div>
            {userRole !== 'student' && (
              <div className="group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full text-gray-600">
                <span className="mr-3 h-5 w-5">📈</span>
                {userRole === 'mentor' ? 'My Reports' : 'Team Reports'}
              </div>
            )}
            {userRole === 'coach' && (
              <div className="group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full text-gray-600">
                <span className="mr-3 h-5 w-5">👥</span>
                Manage Users
              </div>
            )}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1" />
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Connection status */}
              <div className="flex items-center gap-x-2">
                <Wifi className="h-4 w-4 text-green-500" />
                <span className="text-xs text-gray-500">Connected</span>
              </div>

              {/* User menu */}
              <div className="flex items-center gap-x-4">
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{auth.user?.name}</p>
                  <p className="text-gray-500 capitalize">{formatDashboardTitle(auth.user?.role)}</p>
                </div>
                <button className="flex items-center gap-x-2 text-sm text-gray-500 hover:text-gray-700">
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {renderDashboard()}
          </div>
        </main>
      </div>
    </div>
  );
};

function App() {
  const [selectedRole, setSelectedRole] = useState('student');

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />

        {/* Role Switcher for Preview */}
        <div className="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-lg p-4 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Preview Role:</h3>
          <div className="flex space-x-2">
            {['student', 'mentor', 'coach'].map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${
                  selectedRole === role
                    ? role === 'student' ? 'bg-blue-100 text-blue-700' :
                      role === 'mentor' ? 'bg-green-100 text-green-700' :
                      'bg-purple-100 text-purple-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard Preview */}
        <MockAuthProvider userRole={selectedRole}>
          <MockSocketProvider>
            <DashboardPreview userRole={selectedRole} />
          </MockSocketProvider>
        </MockAuthProvider>
      </div>
    </Router>
  );
}

export default App;