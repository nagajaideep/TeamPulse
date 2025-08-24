import React, { useState, useEffect } from 'react';
import { 
  X, 
  Github, 
  FileText, 
  Book, 
  ExternalLink, 
  Plus, 
  Trash2, 
  CheckCircle,
  AlertCircle 
} from 'lucide-react';
import axios from 'axios';

const IntegrationsModal = ({ projectId, isOpen, onClose }) => {
  const [integrations, setIntegrations] = useState({
    github: { linked: false, repo: '', url: null },
    googleDocs: { linked: false, url: null },
    notion: { linked: false, url: null }
  });
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    githubRepo: '',
    googleDocsLink: '',
    notionLink: ''
  });
  const [activeForm, setActiveForm] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (isOpen && projectId) {
      fetchIntegrations();
    }
  }, [isOpen, projectId]);

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/integrations/project/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Fetched integrations:', response.data);
      setIntegrations(response.data);
    } catch (error) {
      console.error('Error fetching integrations:', error);
      showMessage('error', 'Failed to load integrations');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleLinkIntegration = async (type) => {
    try {
      const token = localStorage.getItem('token');
      let endpoint = '';
      let payload = { projectId };

      switch(type) {
        case 'github':
          endpoint = '/api/integrations/github/link';
          payload.githubRepo = formData.githubRepo;
          break;
        case 'googleDocs':
          endpoint = '/api/integrations/googledocs/link';
          payload.googleDocsLink = formData.googleDocsLink;
          break;
        case 'notion':
          endpoint = '/api/integrations/notion/link';
          payload.notionLink = formData.notionLink;
          break;
        default:
          return;
      }

      await axios.post(endpoint, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      showMessage('success', `${type === 'googleDocs' ? 'Google Docs' : type.charAt(0).toUpperCase() + type.slice(1)} linked successfully!`);
      setActiveForm(null);
      setFormData({ githubRepo: '', googleDocsLink: '', notionLink: '' });
      fetchIntegrations();
    } catch (error) {
      console.error('Error linking integration:', error);
      showMessage('error', error.response?.data?.message || 'Failed to link integration');
    }
  };

  const handleRemoveIntegration = async (type) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/integrations/${type}/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      showMessage('success', 'Integration removed successfully!');
      fetchIntegrations();
    } catch (error) {
      console.error('Error removing integration:', error);
      showMessage('error', 'Failed to remove integration');
    }
  };

  const integrationConfigs = [
    {
      type: 'github',
      name: 'GitHub',
      icon: Github,
      color: 'text-gray-800 bg-gray-100',
      description: 'Link your GitHub repository for code collaboration',
      placeholder: 'e.g., username/repository-name',
      formField: 'githubRepo',
      validation: /^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/
    },
    {
      type: 'googleDocs',
      name: 'Google Docs',
      icon: FileText,
      color: 'text-blue-800 bg-blue-100',
      description: 'Link Google Docs for documentation and collaboration',
      placeholder: 'Paste your Google Docs URL here',
      formField: 'googleDocsLink',
      validation: /^https:\/\/docs\.google\.com\/document\/d\/[a-zA-Z0-9-_]+/
    },
    {
      type: 'notion',
      name: 'Notion',
      icon: Book,
      color: 'text-purple-800 bg-purple-100',
      description: 'Link Notion pages for project documentation',
      placeholder: 'Paste your Notion page URL here',
      formField: 'notionLink',
      validation: /^https:\/\/www\.notion\.so\/[a-zA-Z0-9-_]+/
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Project Integrations</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`p-4 border-l-4 ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-400 text-green-700' 
              : 'bg-red-50 border-red-400 text-red-700'
          }`}>
            <div className="flex items-center">
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5 mr-2" />
              ) : (
                <AlertCircle className="h-5 w-5 mr-2" />
              )}
              {message.text}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            integrationConfigs.map((config) => {
              const integration = integrations[config.type];
              const Icon = config.icon;

              return (
                <div key={config.type} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg ${config.color} mr-3`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{config.name}</h3>
                        <p className="text-sm text-gray-500">{config.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {integration?.linked ? (
                        <>
                          {integration.url && (
                            <a
                              href={integration.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Open in new tab"
                              onClick={(e) => {
                                console.log('Opening URL:', integration.url);
                                // Let the default behavior handle the link
                              }}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                          <button
                            onClick={() => handleRemoveIntegration(config.type)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove integration"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setActiveForm(config.type)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Add integration"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Status */}
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    integration?.linked 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {integration?.linked ? 'Connected' : 'Not Connected'}
                  </div>

                  {/* Connected Info */}
                  {integration?.linked && (
                    <div className="mt-2 text-sm text-gray-600">
                      {config.type === 'github' && integration.repo && (
                        <span>Repository: {integration.repo}</span>
                      )}
                      {config.type !== 'github' && integration.url && (
                        <span>Document linked</span>
                      )}
                    </div>
                  )}

                  {/* Add Form */}
                  {activeForm === config.type && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder={config.placeholder}
                          value={formData[config.formField]}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            [config.formField]: e.target.value
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleLinkIntegration(config.type)}
                            disabled={!config.validation.test(formData[config.formField])}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                          >
                            Link
                          </button>
                          <button
                            onClick={() => {
                              setActiveForm(null);
                              setFormData(prev => ({ ...prev, [config.formField]: '' }));
                            }}
                            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default IntegrationsModal;
