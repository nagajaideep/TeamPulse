import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  toUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  type: {
    type: String,
    enum: ['task', 'user', 'general'],
    default: 'general'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure either toUser or taskId is provided
feedbackSchema.pre('save', function(next) {
  if (!this.toUser && !this.taskId) {
    return next(new Error('Feedback must be associated with either a user or a task'));
  }
  next();
});

export default mongoose.model('Feedback', feedbackSchema);
