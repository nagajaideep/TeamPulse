import React, { useState, useEffect } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { Plus, Star, User, MessageSquare } from 'lucide-react';
import axios from 'axios';
import CreateFeedbackModal from './CreateFeedbackModal';

const Feedback = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { on, off } = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    fetchFeedback();

    on('feedbackAdded', handleFeedbackAdded);

    return () => {
      off('feedbackAdded', handleFeedbackAdded);
    };
  }, []);

  const fetchFeedback = async () => {
    try {
      const response = await axios.get('/api/feedback');
      setFeedback(response.data);
    } catch (error) {
      toast.error('Failed to fetch feedback');
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackAdded = (newFeedback) => {
    setFeedback(prev => [newFeedback, ...prev]);
    toast.success('New feedback submitted!');
  };

  const getRatingStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const getFeedbackTypeColor = (type) => {
    switch (type) {
      case 'task': return 'bg-blue-100 text-blue-800';
      case 'user': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Feedback</h1>
          <p className="mt-1 text-sm text-gray-500">
            Share and view feedback with your team
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Give Feedback
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Feedback */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Feedback</h2>
            <div className="space-y-4">
              {feedback.slice(0, 5).map((item) => (
                <div key={item._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">
                        {item.fromUser?.name}
                      </span>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getFeedbackTypeColor(item.type)}`}>
                      {item.type}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">{item.content}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      {getRatingStars(item.rating)}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {item.toUser && (
                    <div className="mt-2 text-xs text-gray-500">
                      To: {item.toUser.name}
                    </div>
                  )}

                  {item.taskId && (
                    <div className="mt-2 text-xs text-gray-500">
                      Task: {item.taskId.title}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Feedback Statistics */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Feedback Statistics</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center">
                  <MessageSquare className="h-8 w-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-blue-600">Total Feedback</p>
                    <p className="text-2xl font-bold text-blue-900">{feedback.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center">
                  <Star className="h-8 w-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-600">Avg Rating</p>
                    <p className="text-2xl font-bold text-green-900">
                      {feedback.length > 0 
                        ? (feedback.reduce((sum, item) => sum + item.rating, 0) / feedback.length).toFixed(1)
                        : '0.0'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">Feedback by Type</h3>
              <div className="space-y-2">
                {['task', 'user', 'general'].map((type) => {
                  const count = feedback.filter(item => item.type === type).length;
                  const percentage = feedback.length > 0 ? (count / feedback.length * 100).toFixed(1) : 0;
                  
                  return (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 capitalize">{type}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900">{count}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <CreateFeedbackModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={(newFeedback) => {
            setFeedback(prev => [newFeedback, ...prev]);
          }}
        />
      )}
    </div>
  );
};

export default Feedback;
