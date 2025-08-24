import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Target,
  Award,
  Calendar,
  ArrowLeft
} from 'lucide-react';
import axios from 'axios';

const AnalyticsView = ({ onBack }) => {
  const [analytics, setAnalytics] = useState({
    summary: {
      totalTasks: 0,
      avgCompletionTime: 0,
      activeMentors: 0,
      satisfactionScore: 0
    },
    monthlyProgress: [],
    topMentors: [],
    weeklyActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/analytics/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      // Keep default empty data if API fails
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center mb-8">
        <button 
          onClick={onBack}
          className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="mt-2 text-gray-600">Detailed insights and performance metrics</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.summary.totalTasks}</p>
              <p className="text-sm text-gray-500">All time</p>
            </div>
            <Target className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Completion Time</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.summary.avgCompletionTime} days</p>
              <p className="text-sm text-gray-500">Last 30 days</p>
            </div>
            <Calendar className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-indigo-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Mentors</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.summary.activeMentors}</p>
              <p className="text-sm text-gray-500">Currently active</p>
            </div>
            <Users className="h-8 w-8 text-indigo-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Satisfaction Score</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.summary.satisfactionScore}/5</p>
              <p className="text-sm text-gray-500">Average rating</p>
            </div>
            <Award className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Progress Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 text-blue-600 mr-2" />
            Monthly Task Progress
          </h3>
          <div className="space-y-4">
            {analytics.monthlyProgress.map((month, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 w-12">{month.month}</span>
                <div className="flex-1 mx-4">
                  <div className="flex space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-3 relative">
                      <div 
                        className="bg-blue-500 h-3 rounded-full"
                        style={{ width: `${month.assigned > 0 ? (month.completed / month.assigned) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <span className="text-sm text-gray-600">{month.completed || 0}/{month.assigned || 0}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performing Mentors */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
            Top Performing Mentors
          </h3>
          <div className="space-y-4">
            {analytics.topMentors.map((mentor, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold ${
                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-400' : 'bg-gray-300'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{mentor.name}</p>
                    <p className="text-xs text-gray-500">{mentor.tasksCompleted} tasks completed</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{mentor.completionRate}%</p>
                  <p className="text-xs text-gray-500">completion rate</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly Activity */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Task Activity</h3>
        <div className="flex items-end space-x-2 h-64">
          {analytics.weeklyActivity.map((day, index) => {
            const maxTasks = Math.max(...analytics.weeklyActivity.map(d => d.tasks), 1);
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="bg-blue-500 w-full rounded-t-md mb-2 transition-all hover:bg-blue-600"
                  style={{ height: `${(day.tasks / maxTasks) * 100}%`, minHeight: '4px' }}
                ></div>
                <span className="text-xs text-gray-600">{day.day}</span>
                <span className="text-xs font-semibold text-gray-900">{day.tasks}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
