const express = require('express');
const User = require('../models/User');
const Task = require('../models/Task');
const Project = require('../models/Project');
const Issue = require('../models/Issue');
const auth = require('../middleware/auth');

const router = express.Router();

// Get comprehensive analytics data (Coach only)
router.get('/dashboard', auth, async (req, res) => {
  try {
    // Check if user is a coach
    if (req.user.role !== 'coach') {
      return res.status(403).json({ message: 'Access denied. Coach role required.' });
    }
    // Overall statistics
    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ status: 'Done' });
    const totalProjects = await Project.countDocuments();
    const totalMentors = await User.countDocuments({ role: 'mentor' });
    const totalStudents = await User.countDocuments({ role: 'student' });
    const openIssues = await Issue.countDocuments({ status: { $in: ['open', 'in-progress'] } });

    // Calculate completion rate
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Average completion time (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentCompletedTasks = await Task.find({
      status: 'Done',
      updatedAt: { $gte: thirtyDaysAgo }
    });

    let avgCompletionTime = 0;
    if (recentCompletedTasks.length > 0) {
      const totalCompletionTime = recentCompletedTasks.reduce((sum, task) => {
        const completionTime = task.updatedAt - task.createdAt;
        return sum + completionTime;
      }, 0);
      avgCompletionTime = Math.round(totalCompletionTime / recentCompletedTasks.length / (1000 * 60 * 60 * 24 * 1000)); // Convert to days
    }

    // Monthly progress data (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyProgress = await Task.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: { year: '$_id.year', month: '$_id.month' },
          assigned: { $sum: '$count' },
          completed: {
            $sum: {
              $cond: [{ $eq: ['$_id.status', 'Done'] }, '$count', 0]
            }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Format monthly data
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedMonthlyProgress = monthlyProgress.map(item => ({
      month: monthNames[item._id.month - 1],
      completed: item.completed,
      assigned: item.assigned
    }));

    // Top performing mentors
    const mentorPerformance = await User.aggregate([
      {
        $match: { role: 'mentor' }
      },
      {
        $lookup: {
          from: 'tasks',
          localField: '_id',
          foreignField: 'assignee',
          as: 'assignedTasks'
        }
      },
      {
        $lookup: {
          from: 'tasks',
          let: { mentorId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$assignee', '$$mentorId'] },
                    { $eq: ['$status', 'Done'] }
                  ]
                }
              }
            }
          ],
          as: 'completedTasks'
        }
      },
      {
        $addFields: {
          tasksCompleted: { $size: '$completedTasks' },
          totalTasks: { $size: '$assignedTasks' },
          completionRate: {
            $cond: [
              { $eq: [{ $size: '$assignedTasks' }, 0] },
              0,
              {
                $round: [
                  {
                    $multiply: [
                      { $divide: [{ $size: '$completedTasks' }, { $size: '$assignedTasks' }] },
                      100
                    ]
                  },
                  0
                ]
              }
            ]
          }
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          tasksCompleted: 1,
          completionRate: 1
        }
      },
      { $sort: { completionRate: -1, tasksCompleted: -1 } },
      { $limit: 10 }
    ]);

    // Weekly activity (last 7 days)
    const weeklyActivity = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));
      
      const tasksCount = await Task.countDocuments({
        updatedAt: { $gte: startOfDay, $lte: endOfDay }
      });
      
      weeklyActivity.push({
        day: dayNames[date.getDay()],
        tasks: tasksCount
      });
    }

    // Satisfaction score (mock for now - would need feedback system)
    const satisfactionScore = 4.8;

    res.json({
      summary: {
        totalTasks,
        avgCompletionTime,
        activeMentors: totalMentors,
        satisfactionScore
      },
      monthlyProgress: formattedMonthlyProgress,
      topMentors: mentorPerformance,
      weeklyActivity
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get task analytics
router.get('/tasks', auth, async (req, res) => {
  try {
    const { timeframe = '30' } = req.query; // days
    const daysAgo = new Date(Date.now() - parseInt(timeframe) * 24 * 60 * 60 * 1000);

    // Task status distribution
    const taskStatusDistribution = await Task.aggregate([
      { $match: { createdAt: { $gte: daysAgo } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Task priority distribution
    const taskPriorityDistribution = await Task.aggregate([
      { $match: { createdAt: { $gte: daysAgo } } },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    // Daily task creation
    const dailyTaskCreation = await Task.aggregate([
      { $match: { createdAt: { $gte: daysAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    res.json({
      taskStatusDistribution,
      taskPriorityDistribution,
      dailyTaskCreation
    });

  } catch (error) {
    console.error('Error fetching task analytics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user analytics
router.get('/users', auth, async (req, res) => {
  try {
    // User role distribution
    const userRoleDistribution = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    // Recent user registrations (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentRegistrations = await User.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    res.json({
      userRoleDistribution,
      recentRegistrations
    });

  } catch (error) {
    console.error('Error fetching user analytics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
