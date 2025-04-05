// Constants
const API_BASE_URL = 'http://localhost:3000/api';
const CHECK_INTERVAL = 1; // minutes
const ALARM_NAME = 'checkNewJobs';
let isOnline = false;

// Update status display
function updateStatus(online) {
  isOnline = online;
  const statusEl = document.getElementById('status');
  const statusTextEl = statusEl.querySelector('span');
  
  statusEl.className = `status ${online ? 'online' : 'offline'}`;
  statusTextEl.textContent = online ? 'Online' : 'Offline';
}

// Toggle monitoring status
async function toggleStatus() {
  if (isOnline) {
    // Turn off monitoring
    await chrome.alarms.clear(ALARM_NAME);
    updateStatus(false);
  } else {
    // Turn on monitoring
    await chrome.alarms.create(ALARM_NAME, {
      periodInMinutes: CHECK_INTERVAL
    });
    updateStatus(true);
  }
  
  // Save status
  await chrome.storage.local.set({ isOnline });
}

// Load and display jobs
async function loadJobs() {
  try {
    const response = await fetch(`${API_BASE_URL}/jobs`);
    if (!response.ok) throw new Error('Failed to fetch jobs');
    
    const jobs = await response.json();
    const container = document.getElementById('jobs-container');
    
    if (jobs.length === 0) {
      container.innerHTML = '<p>No jobs found yet.</p>';
      return;
    }
    
    container.innerHTML = jobs.map(job => `
      <div class="job-item" data-url="${job.url}">
        <div class="job-title">${job.title}</div>
        <div class="job-meta">
          ${job.company} • ${job.location}
        </div>
      </div>
    `).join('');
    
    // Add click handlers to job items
    container.querySelectorAll('.job-item').forEach(item => {
      item.addEventListener('click', () => {
        chrome.tabs.create({ url: item.dataset.url });
      });
    });
  } catch (error) {
    console.error('Error loading jobs:', error);
    document.getElementById('jobs-container').innerHTML = 
      '<p>Failed to load jobs. Please try again later.</p>';
  }
}

// Update last check time
function updateLastCheck() {
  chrome.storage.local.get('lastCheck', ({ lastCheck }) => {
    if (!lastCheck) return;
    
    const lastCheckDate = new Date(lastCheck);
    const now = new Date();
    const diffMinutes = Math.round((now - lastCheckDate) / 1000 / 60);
    
    let timeText;
    if (diffMinutes < 1) {
      timeText = 'just now';
    } else if (diffMinutes === 1) {
      timeText = '1 minute ago';
    } else if (diffMinutes < 60) {
      timeText = `${diffMinutes} minutes ago`;
    } else {
      timeText = `${Math.floor(diffMinutes / 60)} hours ago`;
    }
    
    document.getElementById('lastCheck').textContent = 
      `Last checked: ${timeText}`;
  });
}

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  // Load saved settings
  const { settings, isOnline: savedStatus } = await chrome.storage.local.get(['settings', 'isOnline']);
  
  if (settings) {
    document.getElementById('notifyBrowser').checked = settings.notifyBrowser;
    document.getElementById('openNewTabs').checked = settings.openNewTabs;
  }
  
  // Update status
  updateStatus(savedStatus ?? true);
  
  // Add status click handler
  document.getElementById('status').addEventListener('click', toggleStatus);
  
  // Add settings save handler
  document.getElementById('saveSettings').addEventListener('click', async () => {
    const settings = {
      notifyBrowser: document.getElementById('notifyBrowser').checked,
      openNewTabs: document.getElementById('openNewTabs').checked
    };
    
    await chrome.storage.local.set({ settings });
    // Visual feedback
    const button = document.getElementById('saveSettings');
    button.textContent = 'Saved!';
    setTimeout(() => button.textContent = 'Save Settings', 2000);
  });
  
  // Load initial data
  loadJobs();
  updateLastCheck();
  
  // Refresh data every minute
  setInterval(() => {
    loadJobs();
    updateLastCheck();
  }, 60000);
});
