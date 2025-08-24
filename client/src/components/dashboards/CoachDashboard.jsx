import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { 
  Users, 
  TrendingUp, 
  BarChart3, 
  Award, 
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  UserCheck,
  Zap,
  Plus,
  Eye
} from 'lucide-react';
import axios from 'axios';
import AnalyticsView from '../analytics/AnalyticsView';
import ProjectsReview from '../projects/ProjectsReview';
import IssuesView from '../issues/IssuesView';

const CoachDashboard = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [loading, setLoading] = useState(true);
  const [programStats, setProgramStats] = useState({
    totalMentors: 0,
    totalStudents: 0,
    activeProjects: 0,
    completionRate: 0,
    avgMentorRating: 0,
    criticalIssues: 0
  });
  const [mentorPerformance, setMentorPerformance] = useState([]);
  const [projectOverview, setProjectOverview] = useState([]);
  const [showAddMentorModal, setShowAddMentorModal] = useState(false);
  const [newMentor, setNewMentor] = useState({ name: '', email: '', password: '' });
  const [currentView, setCurrentView] = useState('dashboard');

  useEffect(() => {
    fetchCoachData();
  }, []);

  const fetchCoachData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/coach/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const { programStats, mentorPerformance, projectOverview } = response.data;
      setProgramStats(programStats);
      setMentorPerformance(mentorPerformance);
      setProjectOverview(projectOverview);
    } catch (error) {
      console.error('Error fetching coach data:', error);
      // Keep default values if API fails
    } finally {
      setLoading(false);
    }
  };

  const handleAddMentor = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/coach/add-mentor', newMentor, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('Mentor added successfully!');
      setShowAddMentorModal(false);
      setNewMentor({ name: '', email: '', password: '' });
      fetchCoachData(); // Refresh data
    } catch (error) {
      alert('Error adding mentor: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleViewAnalytics = () => {
    setCurrentView('analytics');
  };

  const handleReviewProjects = () => {
    setCurrentView('projects');
  };

  const handleAddressIssues = () => {
    setCurrentView('issues');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'needs-attention': return 'text-yellow-600 bg-yellow-100';
      case 'on-track': return 'text-green-600 bg-green-100';
      case 'ahead': return 'text-emerald-600 bg-emerald-100';
      case 'at-risk': return 'text-orange-600 bg-orange-100';
      case 'behind': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getProgressBarColor = (progress, status) => {
    if (status === 'ahead') return 'bg-emerald-500';
    if (status === 'on-track') return 'bg-green-500';
    if (status === 'at-risk') return 'bg-orange-500';
    if (status === 'behind') return 'bg-red-500';
    return 'bg-blue-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Handle different views
  if (currentView === 'analytics') {
    return <AnalyticsView onBack={() => setCurrentView('dashboard')} />;
  }

  if (currentView === 'projects') {
    return <ProjectsReview onBack={() => setCurrentView('dashboard')} />;
  }

  if (currentView === 'issues') {
    return <IssuesView onBack={() => setCurrentView('dashboard')} />;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Coach Dashboard</h1>
        <p className="mt-2 text-gray-600">Strategic oversight and program management</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Mentors</p>
              <p className="text-2xl font-semibold text-gray-900">{programStats.totalMentors}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Students</p>
              <p className="text-2xl font-semibold text-gray-900">{programStats.totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100">
              <Target className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Projects</p>
              <p className="text-2xl font-semibold text-gray-900">{programStats.activeProjects}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-emerald-100">
              <TrendingUp className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Completion Rate</p>
              <p className="text-2xl font-semibold text-gray-900">{programStats.completionRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <Award className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg Rating</p>
              <p className="text-2xl font-semibold text-gray-900">{programStats.avgMentorRating}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Critical Issues</p>
              <p className="text-2xl font-semibold text-gray-900">{programStats.criticalIssues}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Mentor Performance */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Mentor Performance Overview</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {mentorPerformance.map((mentor) => (
                <div key={mentor.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{mentor.name}</h3>
                    <p className="text-sm text-gray-500">{mentor.students} students • {mentor.completionRate}% completion</p>
                    <div className="flex items-center mt-2">
                      <div className="flex items-center">
                        <Award className="h-4 w-4 text-yellow-500 mr-1" />
                        <span className="text-sm text-gray-600">{mentor.rating}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(mentor.status)}`}>
                    {mentor.status.replace('-', ' ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Project Overview */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Project Status Overview</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {projectOverview.map((project) => (
                <div key={project.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{project.name}</h3>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                      {project.status.replace('-', ' ')}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Mentor: {project.mentor} • {project.students} students • Due: {project.deadline}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getProgressBarColor(project.progress, project.status)}`}
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{project.progress}% complete</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button 
              onClick={() => setShowAddMentorModal(true)}
              className="flex items-center px-4 py-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors border border-purple-200"
            >
              <Users className="h-5 w-5 mr-2" />
              <span className="font-medium">Add Mentor</span>
            </button>
            <button 
              onClick={handleViewAnalytics}
              className="flex items-center px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors border border-blue-200"
            >
              <BarChart3 className="h-5 w-5 mr-2" />
              <span className="font-medium">View Analytics</span>
            </button>
            <button 
              onClick={handleReviewProjects}
              className="flex items-center px-4 py-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors border border-green-200"
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              <span className="font-medium">Review Projects</span>
            </button>
            <button 
              onClick={handleAddressIssues}
              className="flex items-center px-4 py-3 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg transition-colors border border-orange-200"
            >
              <AlertTriangle className="h-5 w-5 mr-2" />
              <span className="font-medium">Address Issues</span>
            </button>
          </div>
        </div>
      </div>

      {/* Add Mentor Modal */}
      {showAddMentorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Mentor</h3>
            <form onSubmit={handleAddMentor}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={newMentor.name}
                  onChange={(e) => setNewMentor({ ...newMentor, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={newMentor.email}
                  onChange={(e) => setNewMentor({ ...newMentor, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  minLength="6"
                  value={newMentor.password}
                  onChange={(e) => setNewMentor({ ...newMentor, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
                >
                  Add Mentor
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddMentorModal(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoachDashboard;
