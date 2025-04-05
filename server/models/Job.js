const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: true,
    enum: ['Meta', 'Tesla', 'LinkedIn']
  },
  location: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true,
    unique: true
  },
  source: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

// Index for faster queries
jobSchema.index({ company: 1, url: 1 });
jobSchema.index({ timestamp: -1 });

module.exports = mongoose.model('Job', jobSchema);
