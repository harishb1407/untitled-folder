// Constants
const API_BASE_URL = 'http://localhost:3000/api';
const CHECK_INTERVAL = 1; // minutes
const ALARM_NAME = 'checkNewJobs';
const COMPANIES = {
  META: 'Meta',
  TESLA: 'Tesla',
  LINKEDIN: 'LinkedIn'
};

// Initialize extension
chrome.runtime.onInstalled.addListener(async () => {
  // Set up initial storage
  const settings = {
    notifyBrowser: true,
    openNewTabs: true
  };

  await chrome.storage.local.set({
    lastCheck: Date.now(),
    settings,
    isOnline: true
  });

  // Request notification permission
  if (Notification.permission !== 'granted') {
    Notification.requestPermission();
  }

  // Set up periodic check
  chrome.alarms.create(ALARM_NAME, {
    periodInMinutes: CHECK_INTERVAL
  });
});

// Listen for alarm
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) {
    checkForNewJobs();
  }
});

// Check for new jobs
async function checkForNewJobs() {
  try {
    // Check Meta careers page
    await injectScraperScript('https://www.metacareers.com/jobs?q=program%20manager');
    // Check Tesla careers page
    await injectScraperScript('https://www.tesla.com/careers/search/?query=program%20manager');
    // Check LinkedIn jobs
    await injectScraperScript('https://www.linkedin.com/jobs/search/?keywords=program%20manager&f_TPR=r86400');
  } catch (error) {
    console.error('Error checking for jobs:', error);
  }
}

// Inject scraper script into target page
async function injectScraperScript(url) {
  try {
    const tab = await chrome.tabs.create({ url, active: false });
    
    // Wait for page to load
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Then inject scraper
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content_scripts/jobScraper.js']
    });

    // Close the tab after scraping
    setTimeout(() => chrome.tabs.remove(tab.id), 10000);
  } catch (error) {
    console.error('Error injecting scraper:', error);
  }
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'NEW_JOBS') {
    handleNewJobs(request.jobs);
  }
});

// Handle new jobs
async function handleNewJobs(newJobs) {
  if (!newJobs.length) return;

  try {
    // Send jobs to backend
    const response = await fetch(`${API_BASE_URL}/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newJobs)
    });

    if (!response.ok) {
      throw new Error('Failed to send jobs to server');
    }

    const result = await response.json();
    
    if (result.jobsAdded > 0) {
      // Get current settings
      const { settings } = await chrome.storage.local.get('settings');
      
      // Update last check time
      await chrome.storage.local.set({ lastCheck: Date.now() });
      
      // Show browser notification if enabled
      if (settings.notifyBrowser) {
        await showBrowserNotification(result.jobsAdded);
      }

      // Open new tabs for new jobs if enabled
      if (settings.openNewTabs) {
        await openNewJobTabs(newJobs.slice(0, result.jobsAdded));
      }
    }
  } catch (error) {
    console.error('Error handling new jobs:', error);
  }
}

// Open new tabs for jobs
async function openNewJobTabs(jobs) {
  for (const job of jobs) {
    await chrome.tabs.create({
      url: job.url,
      active: false
    });
  }
}

// Show browser notification
async function showBrowserNotification(jobCount) {
  await chrome.notifications.create({
    type: 'basic',
    iconUrl: '/icons/icon128.png',
    title: 'New Job Listings Found!',
    message: `Found ${jobCount} new Program Manager position(s). Opening in new tabs.`,
    priority: 2
  });
}
