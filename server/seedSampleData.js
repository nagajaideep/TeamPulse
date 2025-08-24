const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Task = require('./models/Task');
const Project = require('./models/Project');
const Issue = require('./models/Issue');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/teampulse')
  .then(() => console.log('MongoDB connected for seeding'))
  .catch(err => console.error('MongoDB connection error:', err));

const seedData = async () => {
  try {
    console.log('🌱 Starting to seed sample data...');

    // Get existing users to assign to projects
    const mentors = await User.find({ role: 'mentor' }).limit(5);
    const students = await User.find({ role: 'student' }).limit(10);
    const coaches = await User.find({ role: 'coach' }).limit(2);

    console.log(`Found ${mentors.length} mentors, ${students.length} students, ${coaches.length} coaches`);

    // If we don't have enough users, create some
    if (mentors.length < 3) {
      console.log('Creating additional mentor users...');
      const additionalMentors = [];
      
      for (let i = mentors.length; i < 5; i++) {
        const hashedPassword = await bcrypt.hash('password123', 10);
        const mentor = new User({
          name: ['Sarah Johnson', 'John Davis', 'Mike Chen', 'Lisa Wang', 'Alex Rivera'][i],
          email: `mentor${i+1}@teampulse.com`,
          password: hashedPassword,
          role: 'mentor'
        });
        additionalMentors.push(mentor);
      }
      
      await User.insertMany(additionalMentors);
      console.log(`Created ${additionalMentors.length} additional mentors`);
    }

    if (students.length < 8) {
      console.log('Creating additional student users...');
      const additionalStudents = [];
      
      for (let i = students.length; i < 12; i++) {
        const hashedPassword = await bcrypt.hash('password123', 10);
        const student = new User({
          name: ['Emma Wilson', 'James Brown', 'Sophia Garcia', 'William Miller', 'Olivia Taylor', 'Benjamin Moore', 'Charlotte Davis', 'Lucas Anderson'][i - students.length] || `Student ${i+1}`,
          email: `student${i+1}@teampulse.com`,
          password: hashedPassword,
          role: 'student'
        });
        additionalStudents.push(student);
      }
      
      await User.insertMany(additionalStudents);
      console.log(`Created ${additionalStudents.length} additional students`);
    }

    // Refresh user lists
    const allMentors = await User.find({ role: 'mentor' });
    const allStudents = await User.find({ role: 'student' });

    // Create sample projects
    console.log('📁 Creating sample projects...');
    
    const sampleProjects = [
      {
        name: 'Mobile App Development',
        description: 'Building a React Native mobile application with user authentication and real-time features',
        mentor: allMentors[0]._id,
        students: [allStudents[0]._id, allStudents[1]._id, allStudents[2]._id],
        status: 'active',
        priority: 'high',
        progress: 75,
        deadline: new Date('2025-09-15'),
        startDate: new Date('2025-07-01'),
        tasksTotal: 20,
        tasksCompleted: 15,
        githubRepo: 'https://github.com/teampulse/mobile-app',
        googleDocsLink: 'https://docs.google.com/document/d/mobile-app-spec'
      },
      {
        name: 'Web Design Portfolio',
        description: 'Creating a responsive portfolio website using modern CSS and JavaScript',
        mentor: allMentors[1]._id,
        students: [allStudents[3]._id, allStudents[4]._id],
        status: 'active',
        priority: 'medium',
        progress: 60,
        deadline: new Date('2025-09-30'),
        startDate: new Date('2025-07-15'),
        tasksTotal: 15,
        tasksCompleted: 9,
        githubRepo: 'https://github.com/teampulse/portfolio-site'
      },
      {
        name: 'Data Analysis Project',
        description: 'Analyzing sales data using Python, pandas, and creating visualizations',
        mentor: allMentors[2]._id,
        students: [allStudents[5]._id, allStudents[6]._id, allStudents[7]._id],
        status: 'completed',
        priority: 'high',
        progress: 100,
        deadline: new Date('2025-08-20'),
        startDate: new Date('2025-06-01'),
        tasksTotal: 12,
        tasksCompleted: 12,
        notionLink: 'https://notion.so/data-analysis-project'
      },
      {
        name: 'Machine Learning Study',
        description: 'Learning ML fundamentals and building a prediction model',
        mentor: allMentors[3]._id,
        students: [allStudents[8]._id, allStudents[9]._id],
        status: 'overdue',
        priority: 'high',
        progress: 40,
        deadline: new Date('2025-08-10'),
        startDate: new Date('2025-06-15'),
        tasksTotal: 18,
        tasksCompleted: 7,
        githubRepo: 'https://github.com/teampulse/ml-study'
      },
      {
        name: 'Frontend Development Bootcamp',
        description: 'Comprehensive frontend development course covering React, Vue, and Angular',
        mentor: allMentors[4]._id,
        students: [allStudents[10]._id, allStudents[11]._id],
        status: 'active',
        priority: 'low',
        progress: 30,
        deadline: new Date('2025-10-15'),
        startDate: new Date('2025-08-01'),
        tasksTotal: 25,
        tasksCompleted: 8,
        googleDocsLink: 'https://docs.google.com/document/d/frontend-bootcamp'
      }
    ];

    // Clear existing projects and insert new ones
    await Project.deleteMany({});
    const projects = await Project.insertMany(sampleProjects);
    console.log(`Created ${projects.length} sample projects`);

    // Create sample tasks for the projects
    console.log('📋 Creating sample tasks...');
    
    const sampleTasks = [];
    
    // Tasks for Mobile App Development
    const mobileAppTasks = [
      { title: 'Set up React Native environment', status: 'Done', priority: 'High' },
      { title: 'Design user authentication flow', status: 'Done', priority: 'High' },
      { title: 'Implement login/register screens', status: 'Done', priority: 'High' },
      { title: 'Set up navigation structure', status: 'Done', priority: 'Medium' },
      { title: 'Create main dashboard layout', status: 'In Progress', priority: 'High' },
      { title: 'Implement real-time messaging', status: 'To Do', priority: 'Medium' },
      { title: 'Add push notifications', status: 'To Do', priority: 'Low' },
      { title: 'Write unit tests', status: 'To Do', priority: 'Medium' }
    ];

    // Tasks for Web Design Portfolio
    const portfolioTasks = [
      { title: 'Create wireframes and mockups', status: 'Done', priority: 'High' },
      { title: 'Set up HTML structure', status: 'Done', priority: 'High' },
      { title: 'Style with CSS Grid and Flexbox', status: 'In Progress', priority: 'High' },
      { title: 'Add JavaScript interactivity', status: 'To Do', priority: 'Medium' },
      { title: 'Optimize for mobile devices', status: 'To Do', priority: 'High' },
      { title: 'Test across browsers', status: 'To Do', priority: 'Medium' }
    ];

    // Add tasks to projects
    for (let i = 0; i < mobileAppTasks.length; i++) {
      sampleTasks.push({
        ...mobileAppTasks[i],
        description: `Task for mobile app development project - ${mobileAppTasks[i].title}`,
        assignee: allStudents[i % 3]._id,
        project: projects[0]._id,
        createdBy: allMentors[0]._id,
        deadline: new Date(Date.now() + (i + 1) * 7 * 24 * 60 * 60 * 1000), // Tasks due in 1-8 weeks
        createdAt: new Date(Date.now() - (30 - i * 3) * 24 * 60 * 60 * 1000), // Created over last month
        updatedAt: new Date(Date.now() - (15 - i) * 24 * 60 * 60 * 1000)
      });
    }

    for (let i = 0; i < portfolioTasks.length; i++) {
      sampleTasks.push({
        ...portfolioTasks[i],
        description: `Task for portfolio project - ${portfolioTasks[i].title}`,
        assignee: allStudents[(i + 3) % allStudents.length]._id,
        project: projects[1]._id,
        createdBy: allMentors[1]._id,
        deadline: new Date(Date.now() + (i + 1) * 5 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - (25 - i * 2) * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - (10 - i) * 24 * 60 * 60 * 1000)
      });
    }

    // Add some general tasks not tied to projects
    const generalTasks = [
      { title: 'Complete onboarding checklist', status: 'Done', priority: 'High' },
      { title: 'Attend weekly standup meeting', status: 'Done', priority: 'Medium' },
      { title: 'Review code for peer project', status: 'In Progress', priority: 'Medium' },
      { title: 'Update personal learning goals', status: 'To Do', priority: 'Low' },
      { title: 'Submit monthly progress report', status: 'Review', priority: 'High' }
    ];

    for (let i = 0; i < generalTasks.length; i++) {
      sampleTasks.push({
        ...generalTasks[i],
        description: `General task - ${generalTasks[i].title}`,
        assignee: allStudents[i % allStudents.length]._id,
        createdBy: allMentors[i % allMentors.length]._id,
        deadline: new Date(Date.now() + (i + 1) * 3 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - (20 - i * 2) * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - (5 - i) * 24 * 60 * 60 * 1000)
      });
    }

    // Insert all tasks
    await Task.insertMany(sampleTasks);
    console.log(`Created ${sampleTasks.length} sample tasks`);

    // Create sample issues
    console.log('⚠️ Creating sample issues...');
    
    const sampleIssues = [
      {
        title: 'Student Not Responding to Mentor',
        description: 'Emma Wilson hasn\'t responded to mentor messages for 5 days. Multiple attempts to reach out via email and messaging platform.',
        severity: 'high',
        status: 'open',
        assignedTo: allMentors[0]._id,
        reportedBy: allMentors[0]._id,
        project: projects[0]._id,
        student: allStudents[0]._id,
        studentName: allStudents[0].name,
        category: 'communication',
        tags: ['communication', 'mentorship', 'urgent']
      },
      {
        title: 'Missing Project Submissions',
        description: 'Multiple students in Web Design Portfolio haven\'t submitted required deliverables on time. Need to address this pattern.',
        severity: 'medium',
        status: 'in-progress',
        assignedTo: allMentors[1]._id,
        reportedBy: allMentors[1]._id,
        project: projects[1]._id,
        studentName: 'Multiple Students',
        category: 'academic',
        tags: ['deadlines', 'submissions', 'portfolio']
      },
      {
        title: 'Technical Setup Issues',
        description: 'Students unable to set up development environment for ML project. Python dependencies and Jupyter notebook configuration problems.',
        severity: 'high',
        status: 'open',
        assignedTo: allMentors[3]._id,
        reportedBy: allStudents[8]._id,
        project: projects[3]._id,
        student: allStudents[8]._id,
        studentName: allStudents[8].name,
        category: 'technical',
        tags: ['setup', 'python', 'environment']
      },
      {
        title: 'Mentor Scheduling Conflicts',
        description: 'Mentor availability doesn\'t align with student schedules for the frontend bootcamp. Need to find alternative meeting times.',
        severity: 'low',
        status: 'resolved',
        assignedTo: allMentors[4]._id,
        reportedBy: allStudents[10]._id,
        project: projects[4]._id,
        student: allStudents[10]._id,
        studentName: allStudents[10].name,
        category: 'other',
        tags: ['scheduling', 'availability', 'meetings'],
        resolvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Poor Task Completion Rate',
        description: 'Task completion rate below 50% for the past two weeks in the mobile app project. Need intervention.',
        severity: 'medium',
        status: 'open',
        assignedTo: allMentors[0]._id,
        reportedBy: coaches.length > 0 ? coaches[0]._id : allMentors[0]._id,
        project: projects[0]._id,
        studentName: 'Mobile App Team',
        category: 'academic',
        tags: ['performance', 'completion-rate', 'intervention']
      },
      {
        title: 'Code Review Bottleneck',
        description: 'Code reviews are taking too long, causing delays in the development workflow. Students are blocked waiting for feedback.',
        severity: 'medium',
        status: 'in-progress',
        assignedTo: allMentors[2]._id,
        reportedBy: allStudents[5]._id,
        project: projects[2]._id,
        student: allStudents[5]._id,
        studentName: allStudents[5].name,
        category: 'technical',
        tags: ['code-review', 'workflow', 'bottleneck']
      }
    ];

    // Insert issues
    await Issue.insertMany(sampleIssues);
    console.log(`Created ${sampleIssues.length} sample issues`);

    console.log('✅ Sample data seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Projects: ${projects.length}`);
    console.log(`- Tasks: ${sampleTasks.length}`);
    console.log(`- Issues: ${sampleIssues.length}`);
    console.log(`- Mentors: ${allMentors.length}`);
    console.log(`- Students: ${allStudents.length}`);

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    mongoose.connection.close();
    console.log('📂 Database connection closed');
  }
};

// Run the seed function
seedData();
