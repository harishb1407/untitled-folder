const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const logger = require('../utils/logger');

// Get recent jobs
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find({ isActive: true })
      .sort({ timestamp: -1 })
      .limit(50);

    logger.info('Retrieved recent jobs', { jobs });
    res.json(jobs);
  } catch (error) {
    logger.error('Error fetching jobs:', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// Add new jobs
router.post('/', async (req, res) => {
  try {
    const newJobs = req.body;
    
    // Log incoming job search
    logger.info('Checking for new jobs', {
      jobs: newJobs,
      timestamp: new Date().toISOString()
    });
    
    // Filter out existing jobs
    const existingUrls = await Job.find({
      url: { $in: newJobs.map(job => job.url) }
    }).distinct('url');
    
    const uniqueNewJobs = newJobs.filter(job => !existingUrls.includes(job.url));
    
    if (uniqueNewJobs.length === 0) {
      logger.info('No new jobs found');
      return res.json({ 
        message: 'No new jobs to add',
        jobsAdded: 0
      });
    }

    // Insert new jobs
    const insertedJobs = await Job.insertMany(uniqueNewJobs);
    
    logger.info('New jobs added successfully', {
      jobsAdded: insertedJobs.length,
      jobs: insertedJobs
    });
    
    res.status(201).json({
      message: 'Jobs added successfully',
      jobsAdded: insertedJobs.length
    });
  } catch (error) {
    logger.error('Error adding jobs:', { error: error.message });
    res.status(500).json({ error: 'Failed to add jobs' });
  }
});

module.exports = router;
