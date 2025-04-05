const config = {
  API_BASE_URL: 'http://localhost:3000/api',
  CHECK_INTERVAL: 1, // minutes
  COMPANIES: {
    META: 'Meta',
    TESLA: 'Tesla',
    LINKEDIN: 'LinkedIn'
  },
  LOG_FILE: 'job_monitor.log',
  ALARM_NAME: 'checkNewJobs'
};

export { config as default };
