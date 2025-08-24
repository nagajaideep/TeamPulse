import React, { useState, useEffect } from 'react';
import { X, FolderOpen, Clock, CheckCircle, AlertCircle, Users, Calendar, Settings, Github, FileText, Link } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import AttachmentManager from '../common/AttachmentManager';
import IntegrationsModal from '../integrations/IntegrationsModal';

const ProjectModal = ({ project, onClose, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [projectData, setProjectData] = useState(project);
  const [showIntegrationsModal, setShowIntegrationsModal] = useState(false);

  const fetchProjectData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/projects/${project._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjectData(response.data);
      onUpdate?.(response.data);
    } catch (error) {
      console.error('Error fetching project data:', error);
    }
  };

  const updateStatus = async (newStatus) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`/api/projects/${project._id}`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setProjectData(response.data);
      onUpdate?.(response.data);
      toast.success('Project status updated!');
    } catch (error) {
      toast.error('Failed to update project status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'active': return 'text-blue-600 bg-blue-100';
      case 'on-hold': return 'text-yellow-600 bg-yellow-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'active': return <Clock className="h-4 w-4" />;
      case 'on-hold': return <AlertCircle className="h-4 w-4" />;
      case 'overdue': return <AlertCircle className="h-4 w-4" />;
      default: return <FolderOpen className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  const isOverdue = (deadline) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date() && projectData.status !== 'completed';
  };

  const openExternalLink = (url) => {
    if (url) {
      window.open(url.startsWith('http') ? url : `https://${url}`, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 mx-auto p-5 border w-full max-w-6xl shadow-lg rounded-md bg-white my-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <FolderOpen className="h-6 w-6 text-blue-600" />
            <h3 className="text-xl font-semibold text-gray-900">
              {projectData.name}
            </h3>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(projectData.priority)}`}>
              {projectData.priority?.toUpperCase()}
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
                {projectData.description || 'No description provided.'}
              </p>
            </div>

            {/* Progress */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Progress</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                  <span className="text-sm text-gray-600">{projectData.progress || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${projectData.progress || 0}%` }}
                  ></div>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  {projectData.tasksCompleted || 0} of {projectData.tasksTotal || 0} tasks completed
                </div>
              </div>
            </div>

            {/* Integrations */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-lg font-medium text-gray-900">Integrations</h4>
                <button
                  onClick={() => setShowIntegrationsModal(true)}
                  className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
                >
                  <Settings className="h-4 w-4" />
                  <span>Manage</span>
                </button>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                {projectData.githubRepo && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Github className="h-5 w-5 text-gray-600" />
                      <span className="text-sm text-gray-700">GitHub Repository</span>
                    </div>
                    <button
                      onClick={() => openExternalLink(projectData.githubRepo)}
                      className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
                    >
                      <Link className="h-4 w-4" />
                      <span>View</span>
                    </button>
                  </div>
                )}
                
                {projectData.googleDocsLink && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-gray-600" />
                      <span className="text-sm text-gray-700">Google Docs</span>
                    </div>
                    <button
                      onClick={() => openExternalLink(projectData.googleDocsLink)}
                      className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
                    >
                      <Link className="h-4 w-4" />
                      <span>View</span>
                    </button>
                  </div>
                )}

                {projectData.notionLink && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-gray-600" />
                      <span className="text-sm text-gray-700">Notion</span>
                    </div>
                    <button
                      onClick={() => openExternalLink(projectData.notionLink)}
                      className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
                    >
                      <Link className="h-4 w-4" />
                      <span>View</span>
                    </button>
                  </div>
                )}

                {!projectData.githubRepo && !projectData.googleDocsLink && !projectData.notionLink && (
                  <p className="text-sm text-gray-500">No integrations configured</p>
                )}
              </div>
            </div>

            {/* Attachments */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Files & Voice Notes</h4>
              <AttachmentManager
                entityId={projectData._id}
                entityType="project"
                attachments={projectData.files || []}
                voiceNotes={projectData.voiceNotes || []}
                onAttachmentsUpdate={fetchProjectData}
                canUpload={true}
                canDelete={true}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Status</h4>
              <div className="space-y-2">
                {['active', 'on-hold', 'completed'].map((status) => (
                  <button
                    key={status}
                    onClick={() => updateStatus(status)}
                    disabled={loading}
                    className={`w-full flex items-center space-x-2 px-3 py-2 rounded-md text-sm transition-colors ${
                      projectData.status === status
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

            {/* Team Members */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Team</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-gray-500">Mentor</p>
                    <p className="text-gray-900">{projectData.mentor?.name}</p>
                  </div>
                </div>
                
                {projectData.students && projectData.students.length > 0 && (
                  <div>
                    <p className="text-gray-500 mb-1">Students</p>
                    <div className="space-y-1">
                      {projectData.students.map((student, index) => (
                        <p key={index} className="text-gray-900 text-sm">
                          {student.name}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Timeline</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-gray-500">Start Date</p>
                    <p className="text-gray-900">{formatDate(projectData.startDate)}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-gray-500">Deadline</p>
                    <p className={`${isOverdue(projectData.deadline) ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                      {formatDate(projectData.deadline)}
                      {isOverdue(projectData.deadline) && (
                        <span className="ml-1 text-xs">(Overdue)</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-gray-500">Created</p>
                    <p className="text-gray-900">
                      {formatDate(projectData.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tags */}
            {projectData.tags && projectData.tags.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Tags</h4>
                <div className="flex flex-wrap gap-1">
                  {projectData.tags.map((tag, index) => (
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

        {/* Integrations Modal */}
        {showIntegrationsModal && (
          <IntegrationsModal
            projectId={projectData._id}
            currentIntegrations={{
              githubRepo: projectData.githubRepo,
              googleDocsLink: projectData.googleDocsLink,
              notionLink: projectData.notionLink
            }}
            onClose={() => setShowIntegrationsModal(false)}
            onUpdate={fetchProjectData}
          />
        )}
      </div>
    </div>
  );
};

export default ProjectModal;
