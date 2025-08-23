const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Task = require('./models/Task');
const Meeting = require('./models/Meeting');
const Feedback = require('./models/Feedback');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/teampulse')
  .then(() => console.log('MongoDB connected for seeding'))
  .catch(err => console.error('MongoDB connection error:', err));

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Task.deleteMany({});
    await Meeting.deleteMany({});
    await Feedback.deleteMany({});

    console.log('Cleared existing data');

    // Create demo users
    const users = await User.create([
      {
        name: 'Sarah Johnson',
        email: 'mentor@demo.com',
        password: 'password',
        role: 'mentor'
      },
      {
        name: 'Alex Chen',
        email: 'student1@demo.com',
        password: 'password',
        role: 'student'
      },
      {
        name: 'Maria Rodriguez',
        email: 'student2@demo.com',
        password: 'password',
        role: 'student'
      }
    ]);

    console.log('Created demo users');

    const [mentor, student1, student2] = users;

    // Create demo tasks
    const tasks = await Task.create([
      {
        title: 'Design User Interface',
        description: 'Create wireframes and mockups for the new dashboard',
        assignee: student1._id,
        status: 'In Progress',
        priority: 'High',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        createdBy: mentor._id
      },
      {
        title: 'Implement Authentication',
        description: 'Set up JWT authentication and user management',
        assignee: student2._id,
        status: 'To Do',
        priority: 'Critical',
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        createdBy: mentor._id
      },
      {
        title: 'Write API Documentation',
        description: 'Document all endpoints and create usage examples',
        assignee: student1._id,
        status: 'Review',
        priority: 'Medium',
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        createdBy: mentor._id
      },
      {
        title: 'Set up Database Schema',
        description: 'Design and implement MongoDB schemas',
        assignee: student2._id,
        status: 'Done',
        priority: 'High',
        deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        createdBy: mentor._id
      },
      {
        title: 'Create Unit Tests',
        description: 'Write comprehensive test coverage for core functionality',
        assignee: student1._id,
        status: 'To Do',
        priority: 'Medium',
        deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        createdBy: mentor._id
      },
      {
        title: 'Deploy to Production',
        description: 'Set up CI/CD pipeline and deploy application',
        assignee: student2._id,
        status: 'To Do',
        priority: 'Critical',
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        createdBy: mentor._id
      }
    ]);

    console.log('Created demo tasks');

    // Create demo meeting
    const meeting = await Meeting.create({
      title: 'Weekly Progress Review',
      description: 'Review progress on current tasks and plan next week',
      datetime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      duration: 60,
      attendees: [mentor._id, student1._id, student2._id],
      createdBy: mentor._id
    });

    console.log('Created demo meeting');

    // Create demo feedback
    const feedback = await Feedback.create([
      {
        fromUser: mentor._id,
        toUser: student1._id,
        content: 'Great work on the UI design! The wireframes look professional and user-friendly.',
        rating: 5,
        type: 'user'
      },
      {
        fromUser: mentor._id,
        taskId: tasks[0]._id,
        content: 'The design direction is excellent. Consider adding more interactive elements.',
        rating: 4,
        type: 'task'
      },
      {
        fromUser: student1._id,
        toUser: student2._id,
        content: 'Thanks for helping with the database setup. Your explanations were very clear!',
        rating: 5,
        type: 'user'
      }
    ]);

    console.log('Created demo feedback');

    console.log('\n=== SEED DATA SUMMARY ===');
    console.log(`Users created: ${users.length}`);
    console.log(`Tasks created: ${tasks.length}`);
    console.log(`Meetings created: 1`);
    console.log(`Feedback created: ${feedback.length}`);
    console.log('\nDemo credentials:');
    console.log('Mentor: mentor@demo.com / password');
    console.log('Student 1: student1@demo.com / password');
    console.log('Student 2: student2@demo.com / password');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
