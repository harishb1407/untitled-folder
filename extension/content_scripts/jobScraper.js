// Job scraper for Meta, Tesla, and LinkedIn career pages

import config from '../config.js';
import { logError, logInfo } from '../utils/logger.js';

class JobScraper {
  constructor() {
    this.company = this.detectCompany();
  }

  detectCompany() {
    try {
      const url = window.location.href;
      if (url.includes('metacareers.com')) return config.COMPANIES.META;
      if (url.includes('tesla.com')) return config.COMPANIES.TESLA;
      if (url.includes('linkedin.com')) return config.COMPANIES.LINKEDIN;
      return null;
    } catch (error) {
      logError('Error detecting company:', error);
      return null;
    }
  }

  async scrapeJobs() {
    if (!this.company) return [];
    logInfo(`Scraping jobs for ${this.company}`);

    try {
      switch (this.company) {
        case config.COMPANIES.META:
          return this.scrapeMetaJobs();
        case config.COMPANIES.TESLA:
          return this.scrapeTeslaJobs();
        case config.COMPANIES.LINKEDIN:
          return this.scrapeLinkedInJobs();
        default:
          return [];
      }
    } catch (error) {
      logError(`Error scraping jobs for ${this.company}:`, error);
      return [];
    }
  }

  async scrapeMetaJobs() {
    const jobs = [];
    try {
      const jobCards = document.querySelectorAll('div[role="article"]');

      jobCards.forEach(card => {
        const titleElement = card.querySelector('a[role="link"]');
        if (!titleElement) return;

        const title = titleElement.textContent.trim();
        if (!title.toLowerCase().includes('program manager')) return;

        const location = card.querySelector('div[role="article"] div:nth-child(2)').textContent.trim();
        const url = titleElement.href;

        jobs.push({
          title,
          company: this.company,
          location,
          url,
          source: 'metacareers.com',
          timestamp: new Date().toISOString()
        });
      });
    } catch (error) {
      logError('Error scraping Meta jobs:', error);
    }
    return jobs;
  }

  async scrapeTeslaJobs() {
    const jobs = [];
    try {
      const jobCards = document.querySelectorAll('.job-tile');

      jobCards.forEach(card => {
        const titleElement = card.querySelector('.job-tile-title');
        if (!titleElement) return;

        const title = titleElement.textContent.trim();
        if (!title.toLowerCase().includes('program manager')) return;

        const location = card.querySelector('.job-tile-location').textContent.trim();
        const url = card.querySelector('a').href;

        jobs.push({
          title,
          company: this.company,
          location,
          url,
          source: 'tesla.com/careers',
          timestamp: new Date().toISOString()
        });
      });
    } catch (error) {
      logError('Error scraping Tesla jobs:', error);
    }
    return jobs;
  }

  async scrapeLinkedInJobs() {
    const jobs = [];
    try {
      const jobCards = document.querySelectorAll('.jobs-search-results__list-item');

      jobCards.forEach(card => {
        const titleElement = card.querySelector('.job-card-list__title');
        if (!titleElement) return;

        const title = titleElement.textContent.trim();
        if (!title.toLowerCase().includes('program manager')) return;

        const companyElement = card.querySelector('.job-card-container__company-name');
        const locationElement = card.querySelector('.job-card-container__metadata-item');
        const url = titleElement.href;

        jobs.push({
          title,
          company: this.company,
          location: locationElement ? locationElement.textContent.trim() : 'Remote',
          url,
          source: 'linkedin.com/jobs',
          timestamp: new Date().toISOString()
        });
      });
    } catch (error) {
      logError('Error scraping LinkedIn jobs:', error);
    }
    return jobs;
  }
}

// Initialize and run the scraper
const scraper = new JobScraper();
scraper.scrapeJobs().then(jobs => {
  if (jobs.length > 0) {
    logInfo(`Found ${jobs.length} jobs`);
    chrome.runtime.sendMessage({ type: 'NEW_JOBS', jobs });
  }
}).catch(error => logError('Error running scraper:', error));
