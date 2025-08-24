import React, { useState, useEffect } from 'react';
import { Github, FileText, Book } from 'lucide-react';
import axios from 'axios';

const IntegrationStatus = ({ projectId, className = "" }) => {
  const [integrations, setIntegrations] = useState({
    github: { linked: false },
    googleDocs: { linked: false },
    notion: { linked: false }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (projectId) {
      fetchIntegrations();
    }
  }, [projectId]);

  const fetchIntegrations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/integrations/project/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIntegrations(response.data);
    } catch (error) {
      console.error('Error fetching integration status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`flex space-x-1 ${className}`}>
        <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  const integrationIcons = [
    {
      icon: Github,
      linked: integrations.github?.linked,
      name: 'GitHub'
    },
    {
      icon: FileText,
      linked: integrations.googleDocs?.linked,
      name: 'Google Docs'
    },
    {
      icon: Book,
      linked: integrations.notion?.linked,
      name: 'Notion'
    }
  ];

  return (
    <div className={`flex space-x-1 ${className}`}>
      {integrationIcons.map((integration, index) => {
        const Icon = integration.icon;
        return (
          <div
            key={index}
            className={`p-1 rounded ${
              integration.linked 
                ? 'text-green-600 bg-green-100' 
                : 'text-gray-400 bg-gray-100'
            }`}
            title={`${integration.name}: ${integration.linked ? 'Connected' : 'Not connected'}`}
          >
            <Icon className="h-3 w-3" />
          </div>
        );
      })}
    </div>
  );
};

export default IntegrationStatus;
