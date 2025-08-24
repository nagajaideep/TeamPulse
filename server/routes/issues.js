const express = require('express');
const Issue = require('../models/Issue');
const Project = require('../models/Project');
const User = require('../models/User');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/issues/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Get all issues
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    
    // Filter based on user role
    if (req.user.role === 'mentor') {
      query.assignedTo = req.user.id;
    } else if (req.user.role === 'student') {
      query.student = req.user.id;
    }
    // Coaches can see all issues

    const { status, severity } = req.query;
    if (status && status !== 'all') {
      query.status = status;
    }
    if (severity && severity !== 'all') {
      query.severity = severity;
    }
    
    const issues = await Issue.find(query)
      .populate('assignedTo', 'name email')
      .populate('reportedBy', 'name email')
      .populate('project', 'name')
      .populate('student', 'name email')
      .sort({ createdAt: -1 });

    res.json(issues);
  } catch (error) {
    console.error('Error fetching issues:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get issue statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const totalIssues = await Issue.countDocuments();
    const openIssues = await Issue.countDocuments({ status: 'open' });
    const inProgressIssues = await Issue.countDocuments({ status: 'in-progress' });
    const resolvedIssues = await Issue.countDocuments({ status: 'resolved' });
    const highPriorityIssues = await Issue.countDocuments({ severity: 'high' });
    const criticalIssues = await Issue.countDocuments({ severity: 'critical' });
    
    // Issues by category
    const issuesByCategory = await Issue.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    // Monthly issue resolution data
    const monthlyResolution = await Issue.aggregate([
      {
        $match: {
          status: 'resolved',
          resolvedAt: { $gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$resolvedAt' },
            month: { $month: '$resolvedAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      totalIssues,
      openIssues,
      inProgressIssues,
      resolvedIssues,
      highPriorityIssues,
      criticalIssues,
      issuesByCategory,
      monthlyResolution
    });
  } catch (error) {
    console.error('Error fetching issue stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new issue
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, severity, assignedTo, project, student, studentName, category } = req.body;
    
    const issue = new Issue({
      title,
      description,
      severity,
      assignedTo,
      reportedBy: req.user.id,
      project,
      student,
      studentName,
      category
    });

    await issue.save();
    await issue.populate(['assignedTo', 'reportedBy', 'project', 'student']);
    
    res.status(201).json(issue);
  } catch (error) {
    console.error('Error creating issue:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update issue status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const issue = await Issue.findById(req.params.id);
    
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Check permissions - assigned mentor or coach can update
    if (req.user.role !== 'coach' && issue.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    issue.status = status;
    await issue.save();
    
    res.json(issue);
  } catch (error) {
    console.error('Error updating issue status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add comment to issue
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { text } = req.body;
    const issue = await Issue.findById(req.params.id);
    
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    const comment = {
      text,
      author: req.user.id
    };

    issue.comments.push(comment);
    await issue.save();
    await issue.populate('comments.author', 'name');
    
    res.json(issue);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload attachment to issue
router.post('/:id/attachments', auth, upload.single('file'), async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const attachmentData = {
      name: req.file.originalname,
      url: `/uploads/issues/${req.file.filename}`,
      type: path.extname(req.file.originalname).toLowerCase(),
      uploadedBy: req.user.id
    };

    issue.attachments.push(attachmentData);
    await issue.save();

    res.json({ message: 'Attachment uploaded successfully', attachment: attachmentData });
  } catch (error) {
    console.error('Error uploading attachment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload voice note to issue
router.post('/:id/voice-notes', auth, upload.single('voiceNote'), async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No voice note uploaded' });
    }

    const voiceNoteData = {
      url: `/uploads/issues/${req.file.filename}`,
      duration: req.body.duration || 0,
      uploadedBy: req.user.id,
      transcript: req.body.transcript || ''
    };

    issue.voiceNotes.push(voiceNoteData);
    await issue.save();

    res.json({ message: 'Voice note uploaded successfully', voiceNote: voiceNoteData });
  } catch (error) {
    console.error('Error uploading voice note:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete issue
router.delete('/:id', auth, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Only coaches or the reporter can delete
    if (req.user.role !== 'coach' && issue.reportedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Issue.findByIdAndDelete(req.params.id);
    res.json({ message: 'Issue deleted successfully' });
  } catch (error) {
    console.error('Error deleting issue:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/issues/:id/attachments/:attachmentId
// @desc    Delete attachment from issue
// @access  Private
router.delete('/:id/attachments/:attachmentId', auth, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    const attachmentIndex = issue.attachments.findIndex(
      attachment => attachment._id.toString() === req.params.attachmentId
    );

    if (attachmentIndex === -1) {
      return res.status(404).json({ message: 'Attachment not found' });
    }

    // Remove the attachment from the array
    const removedAttachment = issue.attachments[attachmentIndex];
    issue.attachments.splice(attachmentIndex, 1);
    await issue.save();

    // Delete the file from filesystem
    if (removedAttachment.url) {
      const fileName = removedAttachment.url.replace('/uploads/issues/', '');
      const filePath = path.join(__dirname, '..', 'uploads', 'issues', fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.json({ message: 'Attachment deleted successfully' });
  } catch (error) {
    console.error('Error deleting attachment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/issues/:id/voice-notes/:voiceNoteId
// @desc    Delete voice note from issue
// @access  Private
router.delete('/:id/voice-notes/:voiceNoteId', auth, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    const voiceNoteIndex = issue.voiceNotes.findIndex(
      voiceNote => voiceNote._id.toString() === req.params.voiceNoteId
    );

    if (voiceNoteIndex === -1) {
      return res.status(404).json({ message: 'Voice note not found' });
    }

    // Remove the voice note from the array
    const removedVoiceNote = issue.voiceNotes[voiceNoteIndex];
    issue.voiceNotes.splice(voiceNoteIndex, 1);
    await issue.save();

    // Delete the file from filesystem
    if (removedVoiceNote.url) {
      const fileName = removedVoiceNote.url.replace('/uploads/issues/', '');
      const filePath = path.join(__dirname, '..', 'uploads', 'issues', fileName);
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
