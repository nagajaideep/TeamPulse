const express = require('express');
const { body, validationResult } = require('express-validator');
const Feedback = require('../models/Feedback');
const User = require('../models/User');
const Task = require('../models/Task');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/feedback
// @desc    Get all feedback (with optional filters)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { type, toUser, taskId } = req.query;
    const filter = {};

    if (type) filter.type = type;
    if (toUser) filter.toUser = toUser;
    if (taskId) filter.taskId = taskId;

    const feedback = await Feedback.find(filter)
      .populate('fromUser', 'name email')
      .populate('toUser', 'name email')
      .populate('taskId', 'title')
      .sort({ createdAt: -1 });

    res.json(feedback);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/feedback
// @desc    Submit new feedback
// @access  Private
router.post('/', [
  auth,
  body('content', 'Content is required').not().isEmpty(),
  body('rating', 'Rating must be between 1 and 5').isInt({ min: 1, max: 5 }),
  body('type', 'Type must be task, user, or general').isIn(['task', 'user', 'general'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    console.log('Feedback submission request body:', req.body);
    console.log('User from token:', req.user);
    
    const { content, rating, type, toUser, taskId } = req.body;

    // Validate that either toUser or taskId is provided based on type
    if (type === 'user' && !toUser) {
      return res.status(400).json({ message: 'toUser is required for user feedback' });
    }
    if (type === 'task' && !taskId) {
      return res.status(400).json({ message: 'taskId is required for task feedback' });
    }

    // Validate user/task exists if provided
    if (toUser) {
      const userExists = await User.findById(toUser);
      if (!userExists) {
        return res.status(400).json({ message: 'Target user not found' });
      }
    }

    if (taskId) {
      const taskExists = await Task.findById(taskId);
      if (!taskExists) {
        return res.status(400).json({ message: 'Task not found' });
      }
    }

    const feedback = new Feedback({
      fromUser: req.user.id,
      toUser,
      taskId,
      content,
      rating,
      type
    });

    await feedback.save();

    // Populate feedback with user/task details
    await feedback.populate('fromUser', 'name email');
    await feedback.populate('toUser', 'name email');
    await feedback.populate('taskId', 'title');

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    io.emit('feedbackAdded', feedback);

    res.json(feedback);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/feedback/:id
// @desc    Get a single feedback
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id)
      .populate('fromUser', 'name email')
      .populate('toUser', 'name email')
      .populate('taskId', 'title');

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    res.json(feedback);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
