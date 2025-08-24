const express = require('express');
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

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

module.exports = router;
