import express from 'express';
import { body, validationResult } from 'express-validator';
import Task from '../models/Task.js';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/tasks
// @desc    Get all tasks (with role-based filtering)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { status, assignee, priority } = req.query;
    const filter = {};

    // Apply role-based filtering
    if (req.user.role === 'student') {
      // Students only see tasks assigned to them
      filter.assignee = req.user.id;
    } else if (req.user.role === 'mentor') {
      // Mentors only see tasks they created/assigned
      filter.assignedBy = req.user.id;
    }
    // Coaches see all tasks (no additional filter)

    // Apply additional filters
    if (status) filter.status = status;
    if (assignee) filter.assignee = assignee;
    if (priority) filter.priority = priority;

    const tasks = await Task.find(filter)
      .populate('assignee', 'name email role')
      .populate('assignedBy', 'name email role')
      .populate('createdBy', 'name email role')
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

    const task = new Task({
      title,
      description,
      assignee,
      assignedBy: req.user.id,
      status: status || 'To Do',
      priority: priority || 'Medium',
      deadline: deadline ? new Date(deadline) : null,
      createdBy: req.user.id
    });

    await task.save();

    // Populate the task with user details
    await task.populate('assignee', 'name email role');
    await task.populate('assignedBy', 'name email role');
    await task.populate('createdBy', 'name email role');

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

    // Update task fields
    task.title = title;
    task.description = description || task.description;
    task.assignee = assignee || task.assignee;
    task.status = status;
    task.priority = priority;
    task.deadline = deadline ? new Date(deadline) : task.deadline;

    await task.save();

    // Populate the task with user details
    await task.populate('assignee', 'name email role');
    await task.populate('assignedBy', 'name email role');
    await task.populate('createdBy', 'name email role');

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
    await task.populate('assignee', 'name email role');
    await task.populate('assignedBy', 'name email role');
    await task.populate('createdBy', 'name email role');

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
      .populate('assignee', 'name email role')
      .populate('assignedBy', 'name email role')
      .populate('createdBy', 'name email role');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

export default router;