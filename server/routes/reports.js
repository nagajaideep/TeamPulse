import express from 'express';
import Task from '../models/Task.js';
import Meeting from '../models/Meeting.js';
import Feedback from '../models/Feedback.js';
import User from '../models/User.js';
import auth from '../middleware/auth.js';
import moment from 'moment';

const router = express.Router();

// @route   GET /api/reports/weekly
// @desc    Get weekly aggregated report
// @access  Private
router.get('/weekly', auth, async (req, res) => {
  try {
    const startOfWeek = moment().startOf('week').toDate();
    const endOfWeek = moment().endOf('week').toDate();

    // Get tasks statistics
    const tasksStats = await Task.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfWeek, $lte: endOfWeek }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get completed tasks this week
    const completedTasks = await Task.find({
      status: 'Done',
      updatedAt: { $gte: startOfWeek, $lte: endOfWeek }
    }).populate('assignee', 'name');

    // Get pending tasks
    const pendingTasks = await Task.find({
      status: { $in: ['To Do', 'In Progress', 'Review'] }
    }).populate('assignee', 'name');

    // Get meetings this week
    const weeklyMeetings = await Meeting.find({
      datetime: { $gte: startOfWeek, $lte: endOfWeek }
    }).populate('attendees', 'name');

    // Get feedback statistics
    const feedbackStats = await Feedback.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfWeek, $lte: endOfWeek }
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' }
        }
      }
    ]);

    // Get recent feedback
    const recentFeedback = await Feedback.find({
      createdAt: { $gte: startOfWeek, $lte: endOfWeek }
    })
    .populate('fromUser', 'name')
    .populate('toUser', 'name')
    .populate('taskId', 'title')
    .sort({ createdAt: -1 })
    .limit(10);

    // Calculate task completion rate
    const totalTasksThisWeek = tasksStats.reduce((sum, stat) => sum + stat.count, 0);
    const completedTasksThisWeek = tasksStats.find(stat => stat._id === 'Done')?.count || 0;
    const completionRate = totalTasksThisWeek > 0 ? (completedTasksThisWeek / totalTasksThisWeek) * 100 : 0;

    // Get user performance
    const userPerformance = await Task.aggregate([
      {
        $match: {
          status: 'Done',
          updatedAt: { $gte: startOfWeek, $lte: endOfWeek }
        }
      },
      {
        $group: {
          _id: '$assignee',
          completedTasks: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          name: '$user.name',
          email: '$user.email',
          completedTasks: 1
        }
      }
    ]);

    const report = {
      period: {
        start: startOfWeek,
        end: endOfWeek
      },
      tasks: {
        stats: tasksStats,
        completed: completedTasks.length,
        pending: pendingTasks.length,
        completionRate: Math.round(completionRate * 100) / 100
      },
      meetings: {
        count: weeklyMeetings.length,
        upcoming: weeklyMeetings.filter(m => m.datetime > new Date()).length
      },
      feedback: {
        stats: feedbackStats,
        recent: recentFeedback,
        total: recentFeedback.length
      },
      performance: {
        users: userPerformance
      }
    };

    res.json(report);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/reports/users
// @desc    Get all users for reports
// @access  Private
router.get('/users', auth, async (req, res) => {
  try {
    const users = await User.find().select('name email role');
    res.json(users);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

export default router;
