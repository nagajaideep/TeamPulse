const express = require('express');
const User = require('../models/User');
const Task = require('../models/Task');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/coach/stats
// @desc    Get coach dashboard statistics
// @access  Private (coach only)
router.get('/stats', auth, async (req, res) => {
  try {
    // Verify user is a coach
    if (req.user.role !== 'coach') {
      return res.status(403).json({ message: 'Access denied. Coach role required.' });
    }

    // Get total mentors and students
    const totalMentors = await User.countDocuments({ role: 'mentor' });
    const totalStudents = await User.countDocuments({ role: 'student' });

    // Get all tasks to calculate projects and completion rate
    const allTasks = await Task.find({}).populate('assignee', 'name email role');
    
    // Group tasks by assignee to create "projects"
    const projectGroups = {};
    allTasks.forEach(task => {
      const assigneeName = task.assignee.name;
      if (!projectGroups[assigneeName]) {
        projectGroups[assigneeName] = {
          tasks: [],
          mentor: task.assignee.role === 'student' ? 'Unknown' : 'Self-assigned'
        };
      }
      projectGroups[assigneeName].tasks.push(task);
    });

    const activeProjects = Object.keys(projectGroups).length;
    
    // Calculate completion rate
    const completedTasks = allTasks.filter(task => task.status === 'Done').length;
    const completionRate = allTasks.length > 0 ? Math.round((completedTasks / allTasks.length) * 100) : 0;

    // Get mentor performance
    const mentors = await User.find({ role: 'mentor' });
    const mentorPerformance = await Promise.all(
      mentors.map(async (mentor) => {
        const mentorTasks = await Task.find({ createdBy: mentor._id });
        const completedMentorTasks = mentorTasks.filter(task => task.status === 'Done').length;
        const mentorCompletionRate = mentorTasks.length > 0 ? Math.round((completedMentorTasks / mentorTasks.length) * 100) : 0;
        
        // Get students assigned to this mentor (simplified)
        const studentsManaged = await User.countDocuments({ 
          role: 'student',
          // Add mentor assignment logic here if you have it in your schema
        });

        // Calculate rating (simplified - you might want to add a proper rating system)
        let rating = 4.0;
        if (mentorCompletionRate >= 90) rating = 4.8;
        else if (mentorCompletionRate >= 80) rating = 4.5;
        else if (mentorCompletionRate >= 70) rating = 4.2;
        else if (mentorCompletionRate >= 60) rating = 3.9;
        else rating = 3.5;

        let status = 'good';
        if (mentorCompletionRate >= 85) status = 'excellent';
        else if (mentorCompletionRate < 70) status = 'needs-attention';

        return {
          id: mentor._id,
          name: mentor.name,
          students: Math.max(1, Math.floor(Math.random() * 5) + 1), // Random for now
          completionRate: mentorCompletionRate,
          rating,
          status
        };
      })
    );

    // Get project overview (simplified)
    const projects = Object.keys(projectGroups).slice(0, 4).map((assigneeName, index) => {
      const project = projectGroups[assigneeName];
      const completedTasks = project.tasks.filter(task => task.status === 'Done').length;
      const progress = project.tasks.length > 0 ? Math.round((completedTasks / project.tasks.length) * 100) : 0;
      
      let status = 'on-track';
      if (progress >= 90) status = 'ahead';
      else if (progress < 50) status = 'at-risk';
      else if (progress < 30) status = 'behind';

      const projectNames = [
        'E-commerce Platform',
        'Mobile Banking App', 
        'Healthcare Dashboard',
        'Social Media Tool',
        'Learning Management System',
        'Data Analytics Platform'
      ];

      return {
        id: index + 1,
        name: projectNames[index] || `Project ${index + 1}`,
        mentor: project.mentor,
        students: Math.floor(Math.random() * 4) + 2,
        progress,
        deadline: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status
      };
    });

    // Calculate critical issues (tasks overdue or high priority)
    const today = new Date();
    const criticalIssues = allTasks.filter(task => 
      (task.deadline && new Date(task.deadline) < today && task.status !== 'Done') ||
      (task.priority === 'Critical' && task.status !== 'Done')
    ).length;

    // Calculate average mentor rating
    const avgMentorRating = mentorPerformance.length > 0 
      ? (mentorPerformance.reduce((sum, mentor) => sum + mentor.rating, 0) / mentorPerformance.length).toFixed(1)
      : 0;

    res.json({
      programStats: {
        totalMentors,
        totalStudents,
        activeProjects,
        completionRate,
        avgMentorRating: parseFloat(avgMentorRating),
        criticalIssues
      },
      mentorPerformance,
      projectOverview: projects
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/coach/add-mentor
// @desc    Add a new mentor (for coach quick actions)
// @access  Private (coach only)
router.post('/add-mentor', auth, async (req, res) => {
  try {
    if (req.user.role !== 'coach') {
      return res.status(403).json({ message: 'Access denied. Coach role required.' });
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new mentor
    user = new User({
      name,
      email,
      password,
      role: 'mentor'
    });

    await user.save();

    res.json({ 
      message: 'Mentor added successfully',
      mentor: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
