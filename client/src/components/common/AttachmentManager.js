import React, { useState } from 'react';
import { Paperclip, Mic, Plus, X } from 'lucide-react';
import axios from 'axios';
import FileUpload from './FileUpload';
import VoiceRecorder from './VoiceRecorder';
import AttachmentList from './AttachmentList';

const AttachmentManager = ({ 
  entityId,
  entityType, // 'project', 'issue', or 'task'
  attachments = [],
  voiceNotes = [],
  onAttachmentsUpdate,
  canUpload = true,
  canDelete = true,
  className = '' 
}) => {
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const getUploadEndpoint = (type) => {
    const baseUrl = `/api/${entityType}s/${entityId}`;
    return type === 'voice' ? `${baseUrl}/voice-notes` : `${baseUrl}/attachments`;
  };

  const handleUploadSuccess = (response, type) => {
    setSuccessMessage(`${type === 'voice' ? 'Voice note' : 'File'} uploaded successfully!`);
    setUploadError('');
    setShowFileUpload(false);
    setShowVoiceRecorder(false);
    
    // Refresh the attachments
    onAttachmentsUpdate?.();
    
    // Clear success message after 3 seconds
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleUploadError = (error) => {
    setUploadError(error);
    setSuccessMessage('');
  };

  const handleDelete = async (attachmentId, type) => {
    try {
      let endpoint;
      
      if (type === 'attachment') {
        if (entityType === 'project') {
          endpoint = `/api/projects/${entityId}/files/${attachmentId}`;
        } else {
          endpoint = `/api/${entityType}s/${entityId}/attachments/${attachmentId}`;
        }
      } else if (type === 'voiceNote') {
        endpoint = `/api/${entityType}s/${entityId}/voice-notes/${attachmentId}`;
      }

      console.log('Deleting attachment:', { endpoint, attachmentId, type, entityId, entityType });

      const response = await axios.delete(endpoint);

      console.log('Delete response:', response.data);

      setSuccessMessage(`${type === 'voiceNote' ? 'Voice note' : 'File'} deleted successfully!`);
      setUploadError('');
      
      // Refresh the attachments
      onAttachmentsUpdate?.();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting:', error);
      console.error('Error response:', error.response?.data);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          `Failed to delete ${type === 'voiceNote' ? 'voice note' : 'file'}`;
      
      setUploadError(errorMessage);
      setSuccessMessage('');
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Controls */}
      {canUpload && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setShowFileUpload(!showFileUpload);
              setShowVoiceRecorder(false);
            }}
            className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Paperclip className="w-4 h-4" />
            <span>Add Files</span>
          </button>
          
          <button
            onClick={() => {
              setShowVoiceRecorder(!showVoiceRecorder);
              setShowFileUpload(false);
            }}
            className="flex items-center space-x-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Mic className="w-4 h-4" />
            <span>Voice Note</span>
          </button>
        </div>
      )}

      {/* Error/Success Messages */}
      {uploadError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {uploadError}
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}

      {/* File Upload Component */}
      {showFileUpload && (
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Upload Files</h3>
            <button
              onClick={() => setShowFileUpload(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <FileUpload
            endpoint={getUploadEndpoint('file')}
            onUploadSuccess={(response) => handleUploadSuccess(response, 'file')}
            onUploadError={handleUploadError}
            multiple={true}
            label="Choose files to upload"
          />
        </div>
      )}

      {/* Voice Recorder Component */}
      {showVoiceRecorder && (
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Record Voice Note</h3>
            <button
              onClick={() => setShowVoiceRecorder(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <VoiceRecorder
            endpoint={getUploadEndpoint('voice')}
            onUploadSuccess={(response) => handleUploadSuccess(response, 'voice')}
            onUploadError={handleUploadError}
          />
        </div>
      )}

      {/* Attachments List */}
      <AttachmentList
        attachments={attachments}
        voiceNotes={voiceNotes}
        onDelete={handleDelete}
        canDelete={canDelete}
      />
    </div>
  );
};

export default AttachmentManager;
