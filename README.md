# Parcina Slideshow Display

A personalized fullscreen slideshow and dashboard app created for Parcina, designed to:

- Show a continuous fullscreen photo slideshow
- Display custom reminders (e.g. in Bengali/English)
- Auto start and stop via Task Scheduler
- Allow QR code-based photo uploads
- Support remote configuration via a browser-accessible dashboard

## 🔧 Features

- **Electron-based app** with fullscreen display
- **Dashboard** with settings for:
  - QR code visibility and placement
  - Custom reminders (single-line format)
- **Photo upload server** protected by a password
- **Auto start/stop** and screen dimming support
- Designed for **long-term care semi-private rooms**

## 📂 Folder Structure

- `/dist/` – build output (excluded from Git)
- `/C:/Photos/` – image folder for slideshow & `reminders.txt`
- `server.js` – Express.js server for dashboard + uploads
- `main.js` – Electron launcher for the fullscreen app

## 🚀 Getting Started

```bash
npm install
npm start

Or build for deployment:
npm run build

🛡️ Local Configuration
Store photos in C:/Photos/

Add reminders in reminders.txt (one per line)

Settings saved in settings.json

🧠 Made with ❤️ for Parcina (mom)
By Thahrim (@thahrim) — built for accessibility, ease, and love.
