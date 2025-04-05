const winston = require('winston');
const path = require('path');

// Custom format for job search logs
const jobSearchFormat = winston.format.printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} | ${level.toUpperCase()} | ${message}`;
  
  if (metadata.jobs) {
    msg += '\nJobs Found:';
    metadata.jobs.forEach(job => {
      msg += `\n  • ${job.title} at ${job.company} (${job.location})`;
    });
  }
  
  if (metadata.error) {
    msg += `\nError: ${metadata.error}`;
  }
  
  return msg;
});

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  transports: [
    // Error logs
    new winston.transports.File({ 
      filename: path.join(__dirname, '../logs/error.log'),
      level: 'error'
    }),
    // Combined logs
    new winston.transports.File({ 
      filename: path.join(__dirname, '../logs/combined.log')
    }),
    // Job search specific logs with custom format
    new winston.transports.File({ 
      filename: path.join(__dirname, '../logs/job_searches.log'),
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        jobSearchFormat
      )
    })
  ]
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

module.exports = logger;
