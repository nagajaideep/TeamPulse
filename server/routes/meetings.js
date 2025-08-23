const express = require('express');
const { body, validationResult } = require('express-validator');
const Meeting = require('../models/Meeting');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/meetings
// @desc    Get all meetings
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const meetings = await Meeting.find()
      .populate('attendees', 'name email')
      .populate('createdBy', 'name email')
      .populate('attendanceLogs.userId', 'name email')
      .sort({ datetime: 1 });

    res.json(meetings);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/meetings
// @desc    Schedule a new meeting
// @access  Private
router.post('/', [
  auth,
  body('title', 'Title is required').not().isEmpty(),
  body('datetime', 'Valid datetime is required').isISO8601(),
  body('attendees', 'At least one attendee is required').isArray({ min: 1 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, description, datetime, duration, attendees } = req.body;

    // Validate attendees exist
    const attendeeUsers = await User.find({ _id: { $in: attendees } });
    if (attendeeUsers.length !== attendees.length) {
      return res.status(400).json({ message: 'One or more attendees not found' });
    }

    const meeting = new Meeting({
      title,
      description,
      datetime: new Date(datetime),
      duration: duration || 60,
      attendees,
      createdBy: req.user.id
    });

    await meeting.save();

    // Populate meeting with user details
    await meeting.populate('attendees', 'name email');
    await meeting.populate('createdBy', 'name email');

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    io.emit('meetingScheduled', meeting);

    res.json(meeting);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/meetings/:id/checkin
// @desc    Log attendance for a meeting
// @access  Private
router.post('/:id/checkin', auth, async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    // Check if user is already logged
    const existingLog = meeting.attendanceLogs.find(
      log => log.userId.toString() === req.user.id
    );

    if (existingLog) {
      return res.status(400).json({ message: 'Attendance already logged' });
    }

    // Add attendance log
    meeting.attendanceLogs.push({
      userId: req.user.id,
      timestamp: new Date(),
      status: 'present'
    });

    await meeting.save();

    // Populate meeting with user details
    await meeting.populate('attendees', 'name email');
    await meeting.populate('createdBy', 'name email');
    await meeting.populate('attendanceLogs.userId', 'name email');

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    io.emit('meetingCheckin', meeting);

    res.json(meeting);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/meetings/:id
// @desc    Get a single meeting
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id)
      .populate('attendees', 'name email')
      .populate('createdBy', 'name email')
      .populate('attendanceLogs.userId', 'name email');

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    res.json(meeting);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
