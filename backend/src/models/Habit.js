const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['health', 'work', 'learning', 'sport', 'other'],
    default: 'other'
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    default: 'daily'
  },
  goal: {
    type: Number,
    default: 1
  },
  color: {
    type: String,
    default: '#3B82F6'
  },
  icon: {
    type: String,
    default: '📝'
  },
  streaks: [{
    date: Date,
    completed: Boolean,
    count: Number
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Habit', habitSchema);