import React, { useState, useEffect } from 'react';
import { 
  Github, 
  FileText, 
  Book, 
  ExternalLink,
  FolderOpen,
  User,
  Calendar,
  Search,
  Filter
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const Resources = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const { user } = useAuth();

  useEffect(() => {
    fetchProjectsWithResources();
  }, []);

  const fetchProjectsWithResources = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // First get projects the user has access to
      const projectsResponse = await axios.get('/api/projects', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // For each project, fetch its integrations
      const projectsWithIntegrations = await Promise.all(
        projectsResponse.data.map(async (project) => {
          try {
            const integrationsResponse = await axios.get(`/api/integrations/project/${project._id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            return {
              ...project,
              integrations: integrationsResponse.data
            };
          } catch (error) {
            // If integrations fetch fails, return project without integrations
            return {
              ...project,
              integrations: {
                github: { linked: false },
                googleDocs: { linked: false },
                notion: { linked: false }
              }
            };
          }
        })
      );

      setProjects(projectsWithIntegrations);
    } catch (error) {
      console.error('Error fetching projects and resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIntegrationCount = (project) => {
    const integrations = project.integrations || {};
    return Object.values(integrations).filter(integration => integration.linked).length;
  };

  const hasAnyIntegrations = (project) => {
    return getIntegrationCount(project) > 0;
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.mentor?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    if (filterType === 'with-resources') {
      matchesFilter = hasAnyIntegrations(project);
    } else if (filterType === 'github') {
      matchesFilter = project.integrations?.github?.linked;
    } else if (filterType === 'docs') {
      matchesFilter = project.integrations?.googleDocs?.linked;
    } else if (filterType === 'notion') {
      matchesFilter = project.integrations?.notion?.linked;
    }

    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'active': return 'text-blue-600 bg-blue-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Project Resources</h1>
        <p className="mt-2 text-gray-600">
          Access linked GitHub repositories, Google Docs, and Notion pages for your projects
        </p>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search projects or mentors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
          >
            <option value="all">All Projects</option>
            <option value="with-resources">With Resources</option>
            <option value="github">GitHub Only</option>
            <option value="docs">Google Docs Only</option>
            <option value="notion">Notion Only</option>
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <FolderOpen className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Projects</p>
              <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Github className="h-8 w-8 text-gray-800" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">GitHub Repos</p>
              <p className="text-2xl font-bold text-gray-900">
                {projects.filter(p => p.integrations?.github?.linked).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Google Docs</p>
              <p className="text-2xl font-bold text-gray-900">
                {projects.filter(p => p.integrations?.googleDocs?.linked).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Book className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Notion Pages</p>
              <p className="text-2xl font-bold text-gray-900">
                {projects.filter(p => p.integrations?.notion?.linked).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-6">
        {filteredProjects.map((project) => (
          <div key={project._id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                  </span>
                </div>
                
                <div className="flex items-center text-sm text-gray-500 space-x-4 mb-3">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    {project.mentor?.name || 'No mentor assigned'}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Due: {formatDate(project.deadline)}
                  </div>
                  <div className="text-gray-600">
                    {getIntegrationCount(project)} resource{getIntegrationCount(project) !== 1 ? 's' : ''} linked
                  </div>
                </div>

                {project.description && (
                  <p className="text-gray-600 text-sm mb-4">{project.description}</p>
                )}
              </div>
            </div>

            {/* Resource Links */}
            {hasAnyIntegrations(project) ? (
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Available Resources:</h4>
                <div className="flex flex-wrap gap-3">
                  {project.integrations?.github?.linked && (
                    <a
                      href={project.integrations.github.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Github className="h-4 w-4 mr-2" />
                      GitHub Repository
                      <ExternalLink className="h-3 w-3 ml-2" />
                    </a>
                  )}
                  
                  {project.integrations?.googleDocs?.linked && (
                    <a
                      href={project.integrations.googleDocs.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Google Docs
                      <ExternalLink className="h-3 w-3 ml-2" />
                    </a>
                  )}
                  
                  {project.integrations?.notion?.linked && (
                    <a
                      href={project.integrations.notion.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-4 py-2 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 transition-colors"
                    >
                      <Book className="h-4 w-4 mr-2" />
                      Notion Page
                      <ExternalLink className="h-3 w-3 ml-2" />
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="border-t pt-4">
                <p className="text-sm text-gray-500 italic">No resources linked to this project yet.</p>
                {user?.role === 'mentor' && (
                  <p className="text-sm text-gray-400 mt-1">
                    You can add resources from the Projects Review page.
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            {searchTerm || filterType !== 'all' 
              ? 'No projects found matching your criteria.' 
              : 'No projects available.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Resources;
