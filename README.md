# ThreatLens Web Demo - Hackathon Prototype

Interactive web simulation of ThreatLens mobile app for Google Hackathon submission.

## Quick Start

### Option 1: Open Locally

Double-click `index.html` to open in your browser.

### Option 2: Deploy for Live URL 

#### GitHub Pages

1. Push this folder to a GitHub repo
2. Settings → Pages → Deploy from main branch
3. Get `username.github.io/repo` URL

## Features Demonstrated

### 1. Notification Interception

- Simulated notification inbox with phishing/scam/spam examples
- Simulated AI analysis for phishing patterns, scam indicators, and threats
- Color-coded threat classification
- Actionable AI guidance for each threat

### 2. Image Protection & Verification

- Upload images to "protect" (sign)
- Cryptographic signature simulation with SHA-256, pHash
- Verify uploaded images for authenticity
- Visual trust status badges

### 3. Breach Monitoring

- Add emails/usernames to monitor
- Simulated breach database with realistic demo results
- AI-powered remediation guidance
- Interactive breach cards with data classes

## Technical Details

- **Zero dependencies** - Pure HTML/CSS/JS
- **Responsive design** - Works on desktop, tablet, mobile
- **Simulated AI mode** - No external API calls or secret keys required
- **Demo breach data** - Uses local mock records for offline playback

## Files

- `index.html` - Main page structure
- `styles.css` - ThreatLens theme styling
- `app.js` - Interactive functionality + API calls

## Demo Mode

The app now runs entirely on simulated data:

- Notification analysis is generated locally
- Breach results are mocked locally
- No `.env` file or external API keys are needed
