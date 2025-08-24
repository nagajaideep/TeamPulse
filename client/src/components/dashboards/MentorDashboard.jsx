import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getPriorityColor, formatDate } from '../../utils/taskUtils';
import { getStatusColor } from '../../utils/roleUtils';
import { 
  CheckSquare, 
  Calendar, 
  MessageSquare, 
  Plus,
  Users,
  User,
  TrendingUp,
  ArrowUp01
} from 'lucide-react';
import DashboardStats from '../common/DashboardStats';
import LoadingSpinner from '../common/LoadingSpinner';
import CreateTaskModal from '../tasks/CreateTaskModal';
import { mockQuery } from '../../mockData/roleBasedDashboardMockData';

const StudentProgressCard = ({ student, tasksCount, completionRate }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
    <div className="flex items-center space-x-3 mb-3">
      <img
        src={student.avatarUrl}
        alt={student.name}
        className="h-10 w-10 rounded-full"
      />
      <div>
        <h4 className="text-sm font-medium text-gray-900">{student.name}</h4>
        <p className="text-xs text-gray-500">{student.email}</p>
      </div>
    </div>
    
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Tasks: {tasksCount}</span>
        <span className="text-gray-600">{completionRate}% complete</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-green-600 h-2 rounded-full" 
          style={{ width: `${completionRate}%` }}
        ></div>
      </div>
    </div>
  </div>
);

const TaskOverviewCard = ({ task }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
          {task.title}
        </h4>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </span>
      </div>

      <div className="flex items-center space-x-2 mb-2">
        <User className="h-3 w-3 text-gray-400" />
        <span className="text-xs text-gray-600">
          {task.assignee?.name}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
          {task.status}
        </span>
        {task.deadline && (
          <span className="text-xs text-gray-500">
            Due: {formatDate(task.deadline)}
          </span>
        )}
      </div>
    </div>
  );
};

const MentorDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate fetching mentor data
    const fetchData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setTasks(mockQuery.mentorTasks);
        setStudents(mockQuery.users.filter(u => u.role === 'student'));
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.id]);

  const handleTaskCreate = (newTask) => {
    setTasks(prevTasks => [...prevTasks, newTask]);
  };

  const stats = mockQuery.dashboardStats.mentor;

  if (loading) {
    return <LoadingSpinner text="Loading mentor dashboard..." />;
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mentor Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your students and track their progress.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <ArrowUp01 className="h-4 w-4 mr-2" />
            Assign Task
          </button>
        </div>
      </div>

      {/* Dashboard Statistics */}
      <div className="mb-8">
        <DashboardStats userRole="mentor" stats={stats} />
      </div>

      {/* Student Progress Overview */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Student Progress</h2>
          <button
            onClick={() => navigate('/dashboard/mentor/reports')}
            className="text-sm text-green-600 hover:text-green-800"
          >
            View detailed reports →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map((student) => (
            <StudentProgressCard
              key={student._id}
              student={student}
              tasksCount={Math.floor(Math.random() * 5) + 1}
              completionRate={Math.floor(Math.random() * 40) + 60}
            />
          ))}
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Tasks You Assigned</h2>
          <button
            onClick={() => navigate('/dashboard/mentor/tasks')}
            className="text-sm text-green-600 hover:text-green-800"
          >
            Manage all tasks →
          </button>
        </div>

        {tasks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks created yet</h3>
            <p className="text-gray-500 mb-4">Start by creating and assigning tasks to your students.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Task
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.slice(0, 6).map((task) => (
              <TaskOverviewCard key={task._id} task={task} />
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
              onClick={() => setShowCreateModal(true)}
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-green-500 rounded-lg border border-gray-200 hover:border-gray-300"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-700 ring-4 ring-white">
                  <ArrowUp01 className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  Assign New Task
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Create and assign tasks to your students
                </p>
              </div>
            </button>

            <button
              onClick={() => navigate('/dashboard/mentor/reports')}
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-green-500 rounded-lg border border-gray-200 hover:border-gray-300"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-blue-50 text-blue-700 ring-4 ring-white">
                  <TrendingUp className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  View Reports
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Track student progress and performance
                </p>
              </div>
            </button>

            <button
              onClick={() => navigate('/dashboard/mentor/feedback')}
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-green-500 rounded-lg border border-gray-200 hover:border-gray-300"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-yellow-50 text-yellow-700 ring-4 ring-white">
                  <MessageSquare className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  Provide Feedback
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Give feedback to your students
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <CreateTaskModal
          users={students}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleTaskCreate}
        />
      )}
    </div>
  );
};

export default MentorDashboard;