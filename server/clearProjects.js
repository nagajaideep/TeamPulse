const mongoose = require('mongoose');
const Project = require('./models/Project');
const Issue = require('./models/Issue');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/teampulse')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const clearProjectsAndIssues = async () => {
  try {
    console.log('🗑️ Clearing existing projects and issues...');
    
    const projectCount = await Project.countDocuments();
    const issueCount = await Issue.countDocuments();
    
    console.log(`Found ${projectCount} projects and ${issueCount} issues`);
    
    await Project.deleteMany({});
    await Issue.deleteMany({});
    
    console.log('✅ Cleared all projects and issues from database');
    console.log('Now the Coach Dashboard will show empty states until you create real data through the app');
    
    process.exit(0);
  } catch (error) {
    console.error('Error clearing data:', error);
    process.exit(1);
  }
};

clearProjectsAndIssues();
