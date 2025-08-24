import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  CheckSquare, 
  Users, 
  BarChart3, 
  TrendingUp,
  UserCheck,
  Calendar,
  MessageSquare,
  Settings
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import DashboardStats from '../common/DashboardStats';
import LoadingSpinner from '../common/LoadingSpinner';
import { mockQuery } from '../../mockData/roleBasedDashboardMockData';

const TeamOverviewCard = ({ title, members, type }) => {
  const getTypeColor = (type) => {
    switch (type) {
      case 'students': return 'text-blue-600 bg-blue-100';
      case 'mentors': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'students': return <UserCheck className="h-5 w-5" />;
      case 'mentors': return <Users className="h-5 w-5" />;
      default: return <Users className="h-5 w-5" />;
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <div className={`p-2 rounded-lg ${getTypeColor(type)}`}>
          {getTypeIcon(type)}
        </div>
      </div>
      
      <div className="space-y-3">
        {members.slice(0, 5).map((member) => (
          <div key={member._id} className="flex items-center space-x-3">
            <img
              src={member.avatarUrl}
              alt={member.name}
              className="h-8 w-8 rounded-full"
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{member.name}</p>
              <p className="text-xs text-gray-500">{member.email}</p>
            </div>
            <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getTypeColor(type)}`}>
              {member.role}
            </span>
          </div>
        ))}
        {members.length > 5 && (
          <p className="text-xs text-gray-500 text-center pt-2">
            +{members.length - 5} more
          </p>
        )}
      </div>
    </div>
  );
};

const CoachDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [taskStats, setTaskStats] = useState([]);
  const [users, setUsers] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate fetching coach data
    const fetchData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock task statistics for charts
        setTaskStats([
          { name: 'To Do', value: 8, color: '#6b7280' },
          { name: 'In Progress', value: 12, color: '#3b82f6' },
          { name: 'Review', value: 4, color: '#f59e0b' },
          { name: 'Done', value: 15, color: '#10b981' }
        ]);
        
        setUsers(mockQuery.users);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.id]);

  const stats = mockQuery.dashboardStats.coach;
  const students = users.filter(u => u.role === 'student');
  const mentors = users.filter(u => u.role === 'mentor');

  const COLORS = ['#6b7280', '#3b82f6', '#f59e0b', '#10b981'];

  if (loading) {
    return <LoadingSpinner text="Loading coach dashboard..." />;
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Coach Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              System overview and team management.
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard/coach/users')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            <Settings className="h-4 w-4 mr-2" />
            Manage Users
          </button>
        </div>
      </div>

      {/* Dashboard Statistics */}
      <div className="mb-8">
        <DashboardStats userRole="coach" stats={stats} />
      </div>

      {/* Team Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <TeamOverviewCard
          title="Active Students"
          members={students}
          type="students"
        />
        <TeamOverviewCard
          title="Active Mentors"
          members={mentors}
          type="mentors"
        />
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Task Status Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Task Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={taskStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Task Status Pie Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Task Completion Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={taskStats}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {taskStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* System Performance Metrics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">System Performance</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">92%</div>
              <div className="text-sm text-gray-500">Task Completion Rate</div>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">85%</div>
              <div className="text-sm text-gray-500">Meeting Attendance</div>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">4.2</div>
              <div className="text-sm text-gray-500">Average Feedback Rating</div>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '84%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Administrative Actions
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <button
              onClick={() => navigate('/dashboard/coach/tasks')}
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-purple-500 rounded-lg border border-gray-200 hover:border-gray-300"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-blue-50 text-blue-700 ring-4 ring-white">
                  <CheckSquare className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  All Tasks
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  View and manage all system tasks
                </p>
              </div>
            </button>

            <button
              onClick={() => navigate('/dashboard/coach/reports')}
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-purple-500 rounded-lg border border-gray-200 hover:border-gray-300"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-700 ring-4 ring-white">
                  <BarChart3 className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  Team Reports
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Comprehensive analytics and reports
                </p>
              </div>
            </button>

            <button
              onClick={() => navigate('/dashboard/coach/users')}
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-purple-500 rounded-lg border border-gray-200 hover:border-gray-300"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-yellow-50 text-yellow-700 ring-4 ring-white">
                  <Users className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  Manage Users
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  User management and permissions
                </p>
              </div>
            </button>

            <button
              onClick={() => navigate('/dashboard/coach/calendar')}
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-purple-500 rounded-lg border border-gray-200 hover:border-gray-300"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-purple-50 text-purple-700 ring-4 ring-white">
                  <Calendar className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  System Calendar
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Overview of all meetings and events
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachDashboard;