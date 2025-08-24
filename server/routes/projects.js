const express = require('express');
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/projects/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|zip|rar/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only allowed file types are permitted'));
    }
  }
});

// Get all projects (for coach/mentor)
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    
    // Filter based on user role
    if (req.user.role === 'mentor') {
      query.mentor = req.user.id;
    } else if (req.user.role === 'student') {
      query.students = req.user.id;
    }
    // Coaches can see all projects
    
    const projects = await Project.find(query)
      .populate('mentor', 'name email')
      .populate('students', 'name email')
      .sort({ createdAt: -1 });

    // Update progress for each project
    for (let project of projects) {
      await project.updateProgress();
    }

    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get project statistics (for analytics)
router.get('/stats', auth, async (req, res) => {
  try {
    const totalProjects = await Project.countDocuments();
    const activeProjects = await Project.countDocuments({ status: 'active' });
    const completedProjects = await Project.countDocuments({ status: 'completed' });
    const overdueProjects = await Project.countDocuments({ status: 'overdue' });
    
    // Monthly project completion data
    const monthlyData = await Project.aggregate([
      {
        $match: {
          status: 'completed',
          updatedAt: { $gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$updatedAt' },
            month: { $month: '$updatedAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      totalProjects,
      activeProjects,
      completedProjects,
      overdueProjects,
      monthlyData
    });
  } catch (error) {
    console.error('Error fetching project stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new project
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, mentor, students, deadline, priority, githubRepo, googleDocsLink, notionLink } = req.body;
    
    const project = new Project({
      name,
      description,
      mentor,
      students,
      deadline,
      priority,
      githubRepo,
      googleDocsLink,
      notionLink
    });

    await project.save();
    await project.populate(['mentor', 'students']);
    
    res.status(201).json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update project
router.put('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check permissions
    if (req.user.role !== 'coach' && project.mentor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    Object.assign(project, req.body);
    await project.save();
    await project.populate(['mentor', 'students']);
    
    res.json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload file to project
router.post('/:id/upload', auth, upload.single('file'), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileData = {
      name: req.file.originalname,
      url: `/uploads/projects/${req.file.filename}`,
      uploadedBy: req.user.id
    };

    project.files.push(fileData);
    await project.save();

    res.json({ message: 'File uploaded successfully', file: fileData });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload voice note to project
router.post('/:id/voice-note', auth, upload.single('voiceNote'), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No voice note uploaded' });
    }

    const voiceNoteData = {
      url: `/uploads/projects/${req.file.filename}`,
      duration: req.body.duration || 0,
      uploadedBy: req.user.id,
      transcript: req.body.transcript || ''
    };

    project.voiceNotes.push(voiceNoteData);
    await project.save();

    res.json({ message: 'Voice note uploaded successfully', voiceNote: voiceNoteData });
  } catch (error) {
    console.error('Error uploading voice note:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete project
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only coaches can delete projects
    if (req.user.role !== 'coach') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/projects/:id/files/:fileId
// @desc    Delete file from project
// @access  Private
router.delete('/:id/files/:fileId', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const fileIndex = project.files.findIndex(
      file => file._id.toString() === req.params.fileId
    );

    if (fileIndex === -1) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Remove the file from the array
    const removedFile = project.files[fileIndex];
    project.files.splice(fileIndex, 1);
    await project.save();

    // Delete the file from filesystem
    if (removedFile.url) {
      const fileName = removedFile.url.replace('/uploads/projects/', '');
      const filePath = path.join(__dirname, '..', 'uploads', 'projects', fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/projects/:id/voice-notes/:voiceNoteId
// @desc    Delete voice note from project
// @access  Private
router.delete('/:id/voice-notes/:voiceNoteId', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const voiceNoteIndex = project.voiceNotes.findIndex(
      voiceNote => voiceNote._id.toString() === req.params.voiceNoteId
    );

    if (voiceNoteIndex === -1) {
      return res.status(404).json({ message: 'Voice note not found' });
    }

    // Remove the voice note from the array
    const removedVoiceNote = project.voiceNotes[voiceNoteIndex];
    project.voiceNotes.splice(voiceNoteIndex, 1);
    await project.save();

    // Delete the file from filesystem
    if (removedVoiceNote.url) {
      const fileName = removedVoiceNote.url.replace('/uploads/projects/', '');
      const filePath = path.join(__dirname, '..', 'uploads', 'projects', fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.json({ message: 'Voice note deleted successfully' });
  } catch (error) {
    console.error('Error deleting voice note:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
