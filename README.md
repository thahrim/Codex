# Parcina Display

Parcina Display is a local-first slideshow and reminder display app. It started as a Windows/Electron room display, and the current codebase is being moved toward a multiplatform product that can run on desktops, tablets, and browser-based shells.

## What it does today

- Shows a fullscreen photo slideshow.
- Displays rotating reminders in large, configurable text.
- Hosts a local dashboard for uploading photos and changing settings.
- Generates a QR code that points family/caregivers to the dashboard on the same Wi-Fi network.
- Runs in Electron for desktop display mode or in any browser connected to the local Express server.

## Multiplatform direction

The app is now structured around a browser-compatible display route (`/`) backed by HTTP APIs instead of Electron-only filesystem access. This is the first step toward wrapping the same app core for:

- Windows and macOS using Electron or Tauri.
- iPad, Android tablets, and Amazon Fire tablets using Capacitor.
- Browser/PWA deployments for testing and local-network use.

## Project files

- `server.js` - Express server for the display, dashboard, photo uploads, settings, and reminders.
- `index.html` - Browser-compatible slideshow display.
- `dashboard.html` - Local dashboard for uploads, gallery management, reminders, and settings.
- `main.js` - Electron launcher that starts the local server and opens the display route.
- `generateQR.js` - QR code generator for the local dashboard URL.

## Getting started

Install dependencies:

```bash
npm install
```

Run the desktop display with Electron:

```bash
npm start
```

Run only the local web server:

```bash
npm run start:web
```

Then open:

- Display: `http://localhost:8080/`
- Dashboard: `http://localhost:8080/dashboard`

## Storage configuration

By default, Parcina Display stores app data in a platform-appropriate user data directory:

- Windows: `%APPDATA%/Parcina Display`
- macOS: `~/Library/Application Support/Parcina Display`
- Linux: `$XDG_DATA_HOME/parcina-display` or `~/.local/share/parcina-display`

Photos are stored in a `photos` folder under that data directory. You can override these paths with environment variables:

```bash
PARCINA_DATA_DIR=/path/to/data npm run start:web
PARCINA_PHOTOS_DIR=/path/to/photos npm run start:web
PARCINA_SETTINGS_PATH=/path/to/settings.json npm run start:web
PARCINA_REMINDERS_PATH=/path/to/reminders.txt npm run start:web
```

For the original Windows-style storage layout, set:

```powershell
$env:PARCINA_PHOTOS_DIR = "C:/Photos"
npm start
```

## Build commands

Current desktop packaging command for Windows:

```bash
npm run build:win
```

Future app-store work should add Capacitor iOS/Android projects and desktop release packaging after the shared web app is migrated into a modern React/TypeScript frontend.

## Privacy and network note

The current app is intended for trusted local networks. Before public app-store distribution, protect dashboard write actions with authentication and prepare privacy disclosures for photo access, local-network access, reminders, and any future cloud features.
