# Job Monitor Chrome Extension

A Chrome extension that monitors Meta and Tesla career pages for new Program Manager positions and sends notifications when new jobs are posted.

## Features
- Monitors specific career pages automatically
- Real-time notifications for new job postings
- Email notifications
- Browser notifications
- Easy to configure and use

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- Chrome browser

### Installation
1. Clone this repository
2. Install backend dependencies:
   ```bash
   cd server
   npm install
   ```
3. Install extension:
   - Open Chrome
   - Go to chrome://extensions/
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `extension` folder

### Configuration
1. Create a `.env` file in the server directory
2. Add required environment variables:
   ```
   MONGODB_URI=your_mongodb_uri
   EMAIL_SERVICE=your_email_service
   EMAIL_USER=your_email
   EMAIL_PASS=your_email_password
   ```

## Development
- Extension source code is in the `extension` directory
- Backend server code is in the `server` directory
- Follow the execution plan in EXECUTION_PLAN.md for development steps

## License
MIT
