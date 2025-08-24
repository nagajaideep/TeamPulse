const express = require('express');
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const User = require('../models/User');
const Meeting = require('../models/Meeting');
const Feedback = require('../models/Feedback');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/tasks');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    // Allow all file types for attachments, audio files for voice notes
    cb(null, true);
  }
});

const router = express.Router();

// @route   GET /api/tasks/dashboard-stats
// @desc    Get dashboard statistics for current user
// @access  Private
router.get('/dashboard-stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's active tasks (tasks assigned to them that are not done)
    const activeTasks = await Task.countDocuments({
      assignee: userId,
      status: { $ne: 'Done' }
    });

    // Get completion rate for user's tasks
    const totalUserTasks = await Task.countDocuments({ assignee: userId });
    const completedUserTasks = await Task.countDocuments({ 
      assignee: userId, 
      status: 'Done' 
    });
    const completionRate = totalUserTasks > 0 ? 
      Math.round((completedUserTasks / totalUserTasks) * 100) : 0;

    // Get today's date range
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // Get today's meetings where user is an attendee
    const todaysMeetings = await Meeting.countDocuments({
      attendees: userId,
      datetime: {
        $gte: startOfDay,
        $lt: endOfDay
      }
    });

    // Get pending feedback requests (feedback requested from this user)
    const pendingFeedback = await Feedback.countDocuments({
      toUser: userId,
      status: { $ne: 'completed' }
    });

    res.json({
      activeTasks,
      todaysMeetings,
      pendingFeedback,
      completionRate
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/tasks
// @desc    Get all tasks (with optional filters)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { status, assignee, priority } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (assignee) filter.assignee = assignee;
    if (priority) filter.priority = priority;

    const tasks = await Task.find(filter)
      .populate('assignee', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/tasks
// @desc    Create a new task
// @access  Private
router.post('/', [
  auth,
  body('title', 'Title is required').not().isEmpty(),
  body('assignee', 'Assignee is required').not().isEmpty(),
  body('status').isIn(['To Do', 'In Progress', 'Review', 'Done']),
  body('priority').isIn(['Low', 'Medium', 'High', 'Critical'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, description, assignee, status, priority, deadline } = req.body;

    // Check if assignee exists
    const assigneeUser = await User.findById(assignee);
    if (!assigneeUser) {
      return res.status(400).json({ message: 'Assignee not found' });
    }

    // Role-based assignment restrictions
    const currentUser = await User.findById(req.user.id);
    
    // Students can only assign tasks to fellow students
    if (currentUser.role === 'student') {
      if (assigneeUser.role !== 'student') {
        return res.status(403).json({ 
          message: 'Students can only assign tasks to fellow students' 
        });
      }
    }
    
    // Mentors can assign to students and fellow mentors
    if (currentUser.role === 'mentor') {
      if (!['student', 'mentor'].includes(assigneeUser.role)) {
        return res.status(403).json({ 
          message: 'Mentors can only assign tasks to students and fellow mentors' 
        });
      }
    }
    
    // Coaches can assign to anyone (no restrictions)

    const task = new Task({
      title,
      description,
      assignee,
      status: status || 'To Do',
      priority: priority || 'Medium',
      deadline: deadline ? new Date(deadline) : null,
      createdBy: req.user.id
    });

    await task.save();

    // Populate the task with user details
    await task.populate('assignee', 'name email');
    await task.populate('createdBy', 'name email');

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    io.emit('taskCreated', task);

    res.json(task);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update a task
// @access  Private
router.put('/:id', [
  auth,
  body('title', 'Title is required').not().isEmpty(),
  body('status').isIn(['To Do', 'In Progress', 'Review', 'Done']),
  body('priority').isIn(['Low', 'Medium', 'High', 'Critical'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const { title, description, assignee, status, priority, deadline } = req.body;

    // If assignee is being changed, validate role-based assignment restrictions
    if (assignee && assignee !== task.assignee.toString()) {
      const assigneeUser = await User.findById(assignee);
      if (!assigneeUser) {
        return res.status(400).json({ message: 'Assignee not found' });
      }

      const currentUser = await User.findById(req.user.id);
      
      // Students can only assign tasks to fellow students
      if (currentUser.role === 'student') {
        if (assigneeUser.role !== 'student') {
          return res.status(403).json({ 
            message: 'Students can only assign tasks to fellow students' 
          });
        }
      }
      
      // Mentors can assign to students and fellow mentors
      if (currentUser.role === 'mentor') {
        if (!['student', 'mentor'].includes(assigneeUser.role)) {
          return res.status(403).json({ 
            message: 'Mentors can only assign tasks to students and fellow mentors' 
          });
        }
      }
      
      // Coaches can assign to anyone (no restrictions)
    }

    // Update task fields
    task.title = title;
    task.description = description || task.description;
    task.assignee = assignee || task.assignee;
    task.status = status;
    task.priority = priority;
    task.deadline = deadline ? new Date(deadline) : task.deadline;

    await task.save();

    // Populate the task with user details
    await task.populate('assignee', 'name email');
    await task.populate('createdBy', 'name email');

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    io.emit('taskUpdated', task);

    res.json(task);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/tasks/:id/move
// @desc    Move task between columns (status change)
// @access  Private
router.put('/:id/move', [
  auth,
  body('status', 'Status is required').isIn(['To Do', 'In Progress', 'Review', 'Done'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const { status } = req.body;
    task.status = status;
    await task.save();

    // Populate the task with user details
    await task.populate('assignee', 'name email');
    await task.populate('createdBy', 'name email');

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    io.emit('taskMoved', task);

    res.json(task);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await Task.findByIdAndDelete(req.params.id);

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    io.emit('taskDeleted', { id: req.params.id });

    res.json({ message: 'Task deleted' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/tasks/:id
// @desc    Get a single task
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignee', 'name email')
      .populate('createdBy', 'name email');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/tasks/:id/attachments
// @desc    Upload attachment to task
// @access  Private
router.post('/:id/attachments', auth, upload.single('file'), async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const attachmentData = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      url: `/uploads/tasks/${req.file.filename}`,
      type: path.extname(req.file.originalname).toLowerCase()
    };

    task.attachments.push(attachmentData);
    await task.save();

    res.json({ message: 'Attachment uploaded successfully', attachment: attachmentData });
  } catch (error) {
    console.error('Error uploading attachment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/tasks/:id/voice-notes
// @desc    Upload voice note to task
// @access  Private
router.post('/:id/voice-notes', auth, upload.single('voiceNote'), async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No voice note uploaded' });
    }

    const voiceNoteData = {
      url: `/uploads/tasks/${req.file.filename}`,
      duration: req.body.duration || 0,
      uploadedBy: req.user.id,
      transcript: req.body.transcript || ''
    };

    task.voiceNotes.push(voiceNoteData);
    await task.save();

    res.json({ message: 'Voice note uploaded successfully', voiceNote: voiceNoteData });
  } catch (error) {
    console.error('Error uploading voice note:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/tasks/:id/attachments/:attachmentId
// @desc    Delete attachment from task
// @access  Private
router.delete('/:id/attachments/:attachmentId', auth, async (req, res) => {
  try {
    console.log('Delete attachment request:', req.params);
    
    const task = await Task.findById(req.params.id);
    if (!task) {
      console.log('Task not found:', req.params.id);
      return res.status(404).json({ message: 'Task not found' });
    }

    console.log('Task found, attachments:', task.attachments.length);

    const attachmentIndex = task.attachments.findIndex(
      attachment => attachment._id.toString() === req.params.attachmentId
    );

    if (attachmentIndex === -1) {
      console.log('Attachment not found:', req.params.attachmentId);
      console.log('Available attachments:', task.attachments.map(a => a._id.toString()));
      return res.status(404).json({ message: 'Attachment not found' });
    }

    // Remove the attachment from the array
    const removedAttachment = task.attachments[attachmentIndex];
    console.log('Removing attachment:', removedAttachment);
    
    task.attachments.splice(attachmentIndex, 1);
    await task.save();

    // Delete the file from filesystem
    try {
      if (removedAttachment.path) {
        const filePath = path.join(__dirname, '..', removedAttachment.path);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log('File deleted from path:', filePath);
        }
      } else if (removedAttachment.url) {
        // Handle URL-based paths
        const fileName = removedAttachment.url.replace('/uploads/tasks/', '');
        const filePath = path.join(__dirname, '..', 'uploads', 'tasks', fileName);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log('File deleted from URL path:', filePath);
        }
      }
    } catch (fileError) {
      console.error('Error deleting file:', fileError);
      // Don't fail the request if file deletion fails
    }

    console.log('Attachment deleted successfully');
    res.json({ message: 'Attachment deleted successfully' });
  } catch (error) {
    console.error('Error deleting attachment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/tasks/:id/voice-notes/:voiceNoteId
// @desc    Delete voice note from task
// @access  Private
router.delete('/:id/voice-notes/:voiceNoteId', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const voiceNoteIndex = task.voiceNotes.findIndex(
      voiceNote => voiceNote._id.toString() === req.params.voiceNoteId
    );

    if (voiceNoteIndex === -1) {
      return res.status(404).json({ message: 'Voice note not found' });
    }

    // Remove the voice note from the array
    const removedVoiceNote = task.voiceNotes[voiceNoteIndex];
    task.voiceNotes.splice(voiceNoteIndex, 1);
    await task.save();

    // Optionally delete the file from filesystem
    if (removedVoiceNote.url) {
      const fileName = removedVoiceNote.url.replace('/uploads/tasks/', '');
      const filePath = path.join(__dirname, '..', 'uploads', 'tasks', fileName);
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

// @route   GET /api/tasks/:id/test-delete
// @desc    Test delete authentication and task access
// @access  Private
router.get('/:id/test-delete', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ 
      message: 'Delete access test successful',
      taskId: task._id,
      attachmentCount: task.attachments?.length || 0,
      voiceNoteCount: task.voiceNotes?.length || 0,
      attachments: task.attachments?.map(a => ({ id: a._id, name: a.originalName || a.name })) || [],
      voiceNotes: task.voiceNotes?.map(v => ({ id: v._id, url: v.url })) || []
    });
  } catch (error) {
    console.error('Error in test delete:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
