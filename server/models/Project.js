const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['active', 'completed', 'overdue', 'on-hold'],
    default: 'active'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  deadline: {
    type: Date,
    required: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  tasksTotal: {
    type: Number,
    default: 0
  },
  tasksCompleted: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  files: [{
    name: String,
    url: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  githubRepo: {
    type: String,
    trim: true
  },
  googleDocsLink: {
    type: String,
    trim: true
  },
  notionLink: {
    type: String,
    trim: true
  },
  voiceNotes: [{
    url: String,
    duration: Number,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    transcript: String
  }]
}, {
  timestamps: true
});

// Update progress based on tasks
projectSchema.methods.updateProgress = async function() {
  const Task = mongoose.model('Task');
  const tasks = await Task.find({ project: this._id });
  const completedTasks = tasks.filter(task => task.status === 'Done');
  
  this.tasksTotal = tasks.length;
  this.tasksCompleted = completedTasks.length;
  this.progress = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;
  
  // Update status based on deadline and progress
  const now = new Date();
  if (this.progress === 100) {
    this.status = 'completed';
  } else if (this.deadline < now) {
    this.status = 'overdue';
  } else {
    this.status = 'active';
  }
  
  await this.save();
};

module.exports = mongoose.model('Project', projectSchema);
