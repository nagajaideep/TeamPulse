const express = require('express');
const axios = require('axios');
const Project = require('../models/Project');
const auth = require('../middleware/auth');

const router = express.Router();

// GitHub Integration Routes

// Link GitHub repository to project
router.post('/github/link', auth, async (req, res) => {
  try {
    const { projectId, githubRepo } = req.body;

    // Validate GitHub repo format (owner/repo)
    const githubRepoRegex = /^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/;
    if (!githubRepoRegex.test(githubRepo)) {
      return res.status(400).json({ message: 'Invalid GitHub repository format. Use: owner/repo' });
    }

    // Verify the project exists and user has access
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is mentor or assigned student
    const hasAccess = project.mentor.toString() === req.user.id || 
                     project.students.includes(req.user.id) ||
                     req.user.role === 'coach';
    
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Optional: Verify GitHub repo exists (requires GitHub API token)
    // For now, we'll just validate format and save

    project.githubRepo = githubRepo;
    await project.save();

    res.json({ 
      message: 'GitHub repository linked successfully',
      githubRepo: project.githubRepo 
    });

  } catch (error) {
    console.error('Error linking GitHub repo:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get GitHub repository information
router.get('/github/:projectId', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (!project.githubRepo) {
      return res.status(404).json({ message: 'No GitHub repository linked to this project' });
    }

    // Return basic repo info
    res.json({
      githubRepo: project.githubRepo,
      githubUrl: `https://github.com/${project.githubRepo}`,
      status: 'linked'
    });

  } catch (error) {
    console.error('Error fetching GitHub info:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Google Docs Integration Routes

// Link Google Docs to project
router.post('/googledocs/link', auth, async (req, res) => {
  try {
    const { projectId, googleDocsLink } = req.body;

    // Validate Google Docs URL format
    const googleDocsRegex = /^https:\/\/docs\.google\.com\/document\/d\/[a-zA-Z0-9-_]+/;
    if (!googleDocsRegex.test(googleDocsLink)) {
      return res.status(400).json({ message: 'Invalid Google Docs URL format' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check access permissions
    const hasAccess = project.mentor.toString() === req.user.id || 
                     project.students.includes(req.user.id) ||
                     req.user.role === 'coach';
    
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    project.googleDocsLink = googleDocsLink;
    await project.save();

    res.json({ 
      message: 'Google Docs linked successfully',
      googleDocsLink: project.googleDocsLink 
    });

  } catch (error) {
    console.error('Error linking Google Docs:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Notion Integration Routes

// Link Notion page to project
router.post('/notion/link', auth, async (req, res) => {
  try {
    const { projectId, notionLink } = req.body;

    // Validate Notion URL format
    const notionRegex = /^https:\/\/www\.notion\.so\/[a-zA-Z0-9-_]+/;
    if (!notionRegex.test(notionLink)) {
      return res.status(400).json({ message: 'Invalid Notion URL format' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check access permissions
    const hasAccess = project.mentor.toString() === req.user.id || 
                     project.students.includes(req.user.id) ||
                     req.user.role === 'coach';
    
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    project.notionLink = notionLink;
    await project.save();

    res.json({ 
      message: 'Notion page linked successfully',
      notionLink: project.notionLink 
    });

  } catch (error) {
    console.error('Error linking Notion page:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all integrations for a project
router.get('/project/:projectId', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user has access to this project
    const hasAccess = project.mentor.toString() === req.user.id || 
                     project.students.includes(req.user.id) ||
                     req.user.role === 'coach';
    
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const integrations = {
      github: {
        linked: !!project.githubRepo,
        repo: project.githubRepo,
        url: project.githubRepo ? `https://github.com/${project.githubRepo}` : null
      },
      googleDocs: {
        linked: !!project.googleDocsLink,
        url: project.googleDocsLink
      },
      notion: {
        linked: !!project.notionLink,
        url: project.notionLink
      }
    };

    res.json(integrations);

  } catch (error) {
    console.error('Error fetching integrations:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove integration
router.delete('/:type/:projectId', auth, async (req, res) => {
  try {
    const { type, projectId } = req.params;
    
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check access permissions
    const hasAccess = project.mentor.toString() === req.user.id || 
                     project.students.includes(req.user.id) ||
                     req.user.role === 'coach';
    
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    switch(type) {
      case 'github':
        project.githubRepo = undefined;
        break;
      case 'googledocs':
      case 'googleDocs':
        project.googleDocsLink = undefined;
        break;
      case 'notion':
        project.notionLink = undefined;
        break;
      default:
        return res.status(400).json({ message: 'Invalid integration type' });
    }

    await project.save();
    res.json({ message: `${type} integration removed successfully` });

  } catch (error) {
    console.error('Error removing integration:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
