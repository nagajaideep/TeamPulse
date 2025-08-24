import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getPriorityColor, formatDate, isOverdue } from '../../utils/taskUtils';
import { getStatusColor } from '../../utils/roleUtils';
import { 
  CheckSquare, 
  Calendar, 
  MessageSquare, 
  User
} from 'lucide-react';
import DashboardStats from '../common/DashboardStats';
import LoadingSpinner from '../common/LoadingSpinner';
import { mockQuery } from '../../mockData/roleBasedDashboardMockData';

const TaskCard = ({ task, onStatusUpdate }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus) => {
    setIsUpdating(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      onStatusUpdate(task._id, newStatus);
    } catch (error) {
      console.error('Failed to update task status:', error);
    } finally {
      setIsUpdating(false);
    }
  };






  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
          {task.title}
        </h4>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </span>
      </div>

      {task.description && (
        <p className="text-xs text-gray-500 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <User className="h-3 w-3 text-gray-400" />
          <span className="text-xs text-gray-600">
            Assigned by: {task.assignedBy?.name}
          </span>
        </div>
      </div>

      {task.deadline && (
        <div className="flex items-center mb-3">
          <Calendar className="h-3 w-3 text-gray-400 mr-1" />
          <span className={`text-xs ${isOverdue(task.deadline) ? 'text-red-600' : 'text-gray-500'}`}>
            Due: {formatDate(task.deadline)}
            {isOverdue(task.deadline) && ' (Overdue)'}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
          {task.status}
        </span>
        
        {task.status !== 'Done' && (
          <div className="flex space-x-1">
            {task.status === 'To Do' && (
              <button
                onClick={() => handleStatusChange('In Progress')}
                disabled={isUpdating}
                className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded hover:bg-blue-200 disabled:opacity-50"
              >
                Start
              </button>
            )}
            {task.status === 'In Progress' && (
              <button
                onClick={() => handleStatusChange('Done')}
                disabled={isUpdating}
                className="px-2 py-1 text-xs font-medium text-green-600 bg-green-100 rounded hover:bg-green-200 disabled:opacity-50"
              >
                Complete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const StudentDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  // ...existing code...
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate fetching student tasks
    const fetchTasks = async () => {
      try {
        // In real app, this would be: await axios.get('/api/tasks?assignee=' + user.id)
        await new Promise(resolve => setTimeout(resolve, 1000));
        setTasks(mockQuery.studentTasks);
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [user.id]);

  const handleTaskStatusUpdate = (taskId, newStatus) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task._id === taskId ? { ...task, status: newStatus } : task
      )
    );
  };

  const stats = mockQuery.dashboardStats.student;

  if (loading) {
    return <LoadingSpinner text="Loading your dashboard..." />;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
        <p className="mt-1 text-sm text-gray-500">
          Here's what's on your plate today.
        </p>
      </div>

      {/* Dashboard Statistics */}
      <div className="mb-8">
        <DashboardStats userRole="student" stats={stats} />
      </div>

      {/* My Tasks Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">My Tasks</h2>
          <button
            onClick={() => navigate('/dashboard/student/tasks')}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            View all tasks →
          </button>
        </div>

        {tasks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks assigned</h3>
            <p className="text-gray-500">You're all caught up! New tasks will appear here when assigned.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.slice(0, 6).map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onStatusUpdate={handleTaskStatusUpdate}
              />
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <button
              onClick={() => navigate('/dashboard/student/tasks')}
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg border border-gray-200 hover:border-gray-300"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-blue-50 text-blue-700 ring-4 ring-white">
                  <CheckSquare className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  View My Tasks
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Check and update your assigned tasks
                </p>
              </div>
            </button>

            <button
              onClick={() => navigate('/dashboard/student/calendar')}
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg border border-gray-200 hover:border-gray-300"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-700 ring-4 ring-white">
                  <Calendar className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  View Calendar
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Check upcoming meetings and deadlines
                </p>
              </div>
            </button>

            <button
              onClick={() => navigate('/dashboard/student/feedback')}
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg border border-gray-200 hover:border-gray-300"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-yellow-50 text-yellow-700 ring-4 ring-white">
                  <MessageSquare className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  Give Feedback
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Provide peer feedback and reviews
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;