import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { 
  LogOut, 
  Menu, 
  X,
  Wifi,
  WifiOff
} from 'lucide-react';
import RoleBasedNavigation from './common/RoleBasedNavigation';
import PermissionGuard from './common/PermissionGuard';
import StudentDashboard from './dashboards/StudentDashboard';
import MentorDashboard from './dashboards/MentorDashboard';
import CoachDashboard from './dashboards/CoachDashboard';
import KanbanBoard from './tasks/KanbanBoard';
import CalendarView from './calendar/CalendarView';
import Feedback from './feedback/Feedback';
import Reports from './reports/Reports';
import LoadingSpinner from './common/LoadingSpinner';
import { formatDashboardTitle } from '../mockData/roleBasedDashboardMockData';

const RoleBasedDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Safe access to contexts — if providers are not mounted we avoid throwing
  let user = null;
  let logout = () => {};
  let connected = false;

  try {
    const auth = useAuth();
    user = auth?.user ?? null;
    logout = auth?.logout ?? (() => {});
  } catch (err) {
    // Auth context not available yet — fall back to defaults
    user = null;
    logout = () => {};
  }

  try {
    const sock = useSocket();
    connected = sock?.connected ?? false;
  } catch (err) {
    // Socket context not available — keep connected=false
    connected = false;
  }

  const handleLogout = () => {
    logout();
  };

  if (!user) {
    return <LoadingSpinner text="Loading user data..." />;
  }

  // Get the appropriate dashboard route based on user role
  const getDashboardRoute = () => {
  return user ? `/dashboard/${user.role}` : '/login';
  };

  return (
  <div className={`min-h-screen bg-gray-50 theme-${user?.role ?? 'guest'}`}>
      {/* Role-based Navigation */}
      <RoleBasedNavigation 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
      />

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
                {connected ? (
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-500" />
                )}
                <span className="text-xs text-gray-500">
                  {connected ? 'Connected' : 'Disconnected'}
                </span>
              </div>

              {/* User menu */}
              <div className="flex items-center gap-x-4">
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{user?.name}</p>
                  <p className="text-gray-500 capitalize">{formatDashboardTitle(user?.role)}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-x-2 text-sm text-gray-500 hover:text-gray-700"
                >
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
            <Routes>
              {/* Role-based dashboard routes */}
              <Route 
                path="/student" 
                element={
                  <PermissionGuard requiredRole="student" fallback={<Navigate to={getDashboardRoute()} />}>
                    <StudentDashboard />
                  </PermissionGuard>
                } 
              />
              <Route 
                path="/mentor" 
                element={
                  <PermissionGuard requiredRole="mentor" fallback={<Navigate to={getDashboardRoute()} />}>
                    <MentorDashboard />
                  </PermissionGuard>
                } 
              />
              <Route 
                path="/coach" 
                element={
                  <PermissionGuard requiredRole="coach" fallback={<Navigate to={getDashboardRoute()} />}>
                    <CoachDashboard />
                  </PermissionGuard>
                } 
              />

              {/* Role-based task routes */}
              <Route 
                path="/:role/tasks" 
                element={
                  <PermissionGuard allowedRoles={['student', 'mentor', 'coach']} fallback={<Navigate to={getDashboardRoute()} />}>
                    <KanbanBoard />
                  </PermissionGuard>
                } 
              />

              {/* Role-based calendar routes */}
              <Route 
                path="/:role/calendar" 
                element={<CalendarView />} 
              />

              {/* Role-based feedback routes */}
              <Route 
                path="/:role/feedback" 
                element={<Feedback />} 
              />

              {/* Role-based reports routes */}
              <Route 
                path="/mentor/reports" 
                element={
                  <PermissionGuard allowedRoles={['mentor']} fallback={<Navigate to={getDashboardRoute()} />}>
                    <Reports />
                  </PermissionGuard>
                } 
              />
              <Route 
                path="/coach/reports" 
                element={
                  <PermissionGuard requiredRole="coach" fallback={<Navigate to={getDashboardRoute()} />}>
                    <Reports />
                  </PermissionGuard>
                } 
              />

              {/* User management for coaches */}
              <Route 
                path="/coach/users" 
                element={
                  <PermissionGuard requiredRole="coach" fallback={<Navigate to={getDashboardRoute()} />}>
                    <div className="text-center py-12">
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">User Management</h2>
                      <p className="text-gray-500">User management interface coming soon...</p>
                    </div>
                  </PermissionGuard>
                } 
              />

              {/* Default redirect to role-based dashboard */}
              <Route 
                path="/" 
                element={<Navigate to={getDashboardRoute()} />} 
              />
              
              {/* Fallback route */}
              <Route 
                path="*" 
                element={<Navigate to={getDashboardRoute()} />} 
              />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default RoleBasedDashboard;