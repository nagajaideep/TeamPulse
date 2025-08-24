import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Clock, CheckCircle, XCircle, User, Calendar, MessageSquare } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import AttachmentManager from '../common/AttachmentManager';

const IssueModal = ({ issue, onClose, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [issueData, setIssueData] = useState(issue);

  useEffect(() => {
    fetchComments();
  }, [issue._id]);

  const fetchComments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/issues/${issue._id}/comments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const fetchIssueData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/issues/${issue._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIssueData(response.data);
      onUpdate?.(response.data);
    } catch (error) {
      console.error('Error fetching issue data:', error);
    }
  };

  const addComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/issues/${issue._id}/comments`, 
        { text: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setNewComment('');
      fetchComments();
      toast.success('Comment added successfully!');
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`/api/issues/${issue._id}`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setIssueData(response.data);
      onUpdate?.(response.data);
      toast.success('Issue status updated!');
    } catch (error) {
      toast.error('Failed to update issue status');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100 border-red-200';
      case 'high': return 'text-red-600 bg-red-100 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'text-green-600 bg-green-100';
      case 'closed': return 'text-gray-600 bg-gray-100';
      case 'in-progress': return 'text-blue-600 bg-blue-100';
      default: return 'text-orange-600 bg-orange-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'closed': return <XCircle className="h-4 w-4" />;
      case 'in-progress': return <Clock className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white my-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <h3 className="text-xl font-semibold text-gray-900">
              {issueData.title}
            </h3>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(issueData.severity)}`}>
              {issueData.severity?.toUpperCase()}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Description</h4>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                {issueData.description}
              </p>
            </div>

            {/* Attachments */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Attachments & Voice Notes</h4>
              <AttachmentManager
                entityId={issueData._id}
                entityType="issue"
                attachments={issueData.attachments || []}
                voiceNotes={issueData.voiceNotes || []}
                onAttachmentsUpdate={fetchIssueData}
                canUpload={true}
                canDelete={true}
              />
            </div>

            {/* Comments */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Comments</h4>
              <div className="space-y-3 mb-4">
                {comments.map((comment, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center space-x-2 mb-1">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">
                        {comment.author?.name || 'Unknown User'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{comment.text}</p>
                  </div>
                ))}
              </div>

              {/* Add Comment */}
              <form onSubmit={addComment} className="flex space-x-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={loading || !newComment.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  <MessageSquare className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Status</h4>
              <div className="space-y-2">
                {['open', 'in-progress', 'resolved', 'closed'].map((status) => (
                  <button
                    key={status}
                    onClick={() => updateStatus(status)}
                    disabled={loading}
                    className={`w-full flex items-center space-x-2 px-3 py-2 rounded-md text-sm transition-colors ${
                      issueData.status === status
                        ? `${getStatusColor(status)} border`
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {getStatusIcon(status)}
                    <span className="capitalize">{status.replace('-', ' ')}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Details */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Details</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-gray-500">Reported by</p>
                    <p className="text-gray-900">{issueData.reportedBy?.name}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-gray-500">Assigned to</p>
                    <p className="text-gray-900">{issueData.assignedTo?.name}</p>
                  </div>
                </div>

                {issueData.student && (
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-gray-500">Student</p>
                      <p className="text-gray-900">{issueData.studentName}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-gray-500">Created</p>
                    <p className="text-gray-900">
                      {new Date(issueData.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {issueData.tags && issueData.tags.length > 0 && (
                  <div>
                    <p className="text-gray-500 mb-1">Tags</p>
                    <div className="flex flex-wrap gap-1">
                      {issueData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueModal;
