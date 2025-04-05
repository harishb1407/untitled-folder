import fs from 'fs';
import path from 'path';

const LOG_DIR = path.join(__dirname, '../logs');

// Ensure the log directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR);
}

function getTimestamp() {
  const now = new Date();
  return now.toISOString().replace(/:/g, '-');
}

function logToFile(message, level = 'INFO') {
  const timestamp = getTimestamp();
  const logFileName = `log-${timestamp}.txt`;
  const logFilePath = path.join(LOG_DIR, logFileName);

  const logMessage = `[${new Date().toISOString()}] [${level}] ${message}\n`;

  fs.appendFileSync(logFilePath, logMessage, 'utf8');
}

export function logInfo(message) {
  console.log(`INFO: ${message}`);
  logToFile(message, 'INFO');
}

export function logError(message, error) {
  console.error(`ERROR: ${message}`, error);
  logToFile(`${message} - ${error.message}`, 'ERROR');
}
