import React, { useState } from 'react';
import { Download, Eye, Trash2, File, Image, Music, Video, FileText, ExternalLink } from 'lucide-react';

const AttachmentList = ({ 
  attachments = [], 
  voiceNotes = [], 
  onDelete,
  canDelete = false,
  className = '' 
}) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const getFileIcon = (type) => {
    if (type?.startsWith('image/')) return <Image className="w-5 h-5 text-blue-500" />;
    if (type?.startsWith('audio/')) return <Music className="w-5 h-5 text-purple-500" />;
    if (type?.startsWith('video/')) return <Video className="w-5 h-5 text-red-500" />;
    if (type?.includes('text') || type?.includes('document')) return <FileText className="w-5 h-5 text-green-500" />;
    return <File className="w-5 h-5 text-gray-500" />;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const openPreview = (url, type) => {
    if (type?.startsWith('image/')) {
      setPreviewUrl(url);
      setShowPreview(true);
    } else {
      // For non-image files, open in new tab
      window.open(url, '_blank');
    }
  };

  const downloadFile = (url, name) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = (id, type) => {
    if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
      onDelete?.(id, type);
    }
  };

  if (attachments.length === 0 && voiceNotes.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        <File className="w-12 h-12 mx-auto mb-2 text-gray-300" />
        <p>No attachments or voice notes yet</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* File Attachments */}
      {attachments.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-medium text-gray-900 mb-3">Attachments</h4>
          <div className="space-y-2">
            {attachments.map((attachment, index) => (
              <div
                key={attachment._id || index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {getFileIcon(attachment.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {attachment.name || attachment.originalName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(attachment.size)} • Uploaded {new Date(attachment.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openPreview(attachment.url, attachment.type)}
                    className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                    title="Preview/Open"
                  >
                    {attachment.type?.startsWith('image/') ? <Eye className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
                  </button>
                  
                  <button
                    onClick={() => downloadFile(attachment.url, attachment.name || attachment.originalName)}
                    className="p-1 text-gray-400 hover:text-green-500 transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  
                  {canDelete && (
                    <button
                      onClick={() => handleDelete(attachment._id, 'attachment')}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Voice Notes */}
      {voiceNotes.length > 0 && (
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-3">Voice Notes</h4>
          <div className="space-y-2">
            {voiceNotes.map((voiceNote, index) => (
              <div
                key={voiceNote._id || index}
                className="flex items-center justify-between p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <div className="flex items-center space-x-3 flex-1">
                  <Music className="w-5 h-5 text-purple-500" />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900">
                        Voice Note
                      </p>
                      <span className="text-xs text-purple-600 bg-purple-200 px-2 py-1 rounded">
                        {formatDuration(voiceNote.duration)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Recorded {new Date(voiceNote.uploadedAt).toLocaleDateString()}
                    </p>
                    {voiceNote.transcript && (
                      <p className="text-xs text-gray-600 mt-1 italic">
                        "{voiceNote.transcript.substring(0, 100)}..."
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <audio controls className="h-8">
                    <source src={voiceNote.url} type="audio/webm" />
                    <source src={voiceNote.url} type="audio/mp3" />
                    Your browser does not support the audio element.
                  </audio>
                  
                  <button
                    onClick={() => downloadFile(voiceNote.url, `voice-note-${index + 1}.webm`)}
                    className="p-1 text-gray-400 hover:text-green-500 transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  
                  {canDelete && (
                    <button
                      onClick={() => handleDelete(voiceNote._id, 'voiceNote')}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setShowPreview(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <div className="w-8 h-8 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                ×
              </div>
            </button>
            <img
              src={previewUrl}
              alt="Preview"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AttachmentList;
