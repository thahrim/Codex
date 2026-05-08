const express = require('express');
const fs = require('fs');
const path = require('path');
const ip = require('ip');
const multer = require('multer');

const app = express();
const port = Number(process.env.PORT || 8080);
const defaultSettings = {
  showQR: true,
  qrPosition: 'bottom-right',
  reminderPosition: 'bottom',
  reminderSize: 'medium'
};

function getDefaultDataDir() {
  if (process.platform === 'win32') {
    return path.join(process.env.APPDATA || process.env.USERPROFILE || __dirname, 'Parcina Display');
  }

  if (process.platform === 'darwin') {
    return path.join(process.env.HOME || __dirname, 'Library', 'Application Support', 'Parcina Display');
  }

  return path.join(process.env.XDG_DATA_HOME || path.join(process.env.HOME || __dirname, '.local', 'share'), 'parcina-display');
}

const dataDir = process.env.PARCINA_DATA_DIR || getDefaultDataDir();
const photosDir = process.env.PARCINA_PHOTOS_DIR || path.join(dataDir, 'photos');
const settingsPath = process.env.PARCINA_SETTINGS_PATH || path.join(dataDir, 'settings.json');
const remindersPath = process.env.PARCINA_REMINDERS_PATH || path.join(photosDir, 'reminders.txt');

function ensureFile(filePath, contents) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, contents);
}

function readSettings() {
  try {
    return { ...defaultSettings, ...JSON.parse(fs.readFileSync(settingsPath, 'utf-8')) };
  } catch {
    return defaultSettings;
  }
}

function safePhotoPath(fileName) {
  const targetPath = path.resolve(photosDir, fileName);
  const rootPath = path.resolve(photosDir);

  if (!targetPath.startsWith(rootPath + path.sep)) {
    return null;
  }

  return targetPath;
}

fs.mkdirSync(photosDir, { recursive: true });
ensureFile(settingsPath, JSON.stringify(defaultSettings, null, 2));
ensureFile(remindersPath, 'Move your limbs now');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, photosDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + path.basename(file.originalname))
});
const upload = multer({ storage });

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/qr.png', (req, res) => {
  res.sendFile(path.join(__dirname, 'qr.png'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

app.get('/settings', (req, res) => {
  res.json(readSettings());
});

app.post('/settings', (req, res) => {
  const newSettings = {
    showQR: req.body.showQR === 'on' || req.body.showQR === true,
    qrPosition: req.body.qrPosition || 'bottom-right',
    reminderPosition: req.body.reminderPosition || 'bottom',
    reminderSize: req.body.reminderSize === 'custom' ? (req.body.customSize || '32px') : req.body.reminderSize || 'medium'
  };

  try {
    fs.writeFileSync(settingsPath, JSON.stringify(newSettings, null, 2));
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false });
  }
});

app.get('/reminders', (req, res) => {
  try {
    const lines = fs.readFileSync(remindersPath, 'utf-8').split('\n').filter(Boolean);
    res.json({ reminders: lines });
  } catch {
    res.status(500).json({ error: 'Could not load reminders' });
  }
});

app.post('/reminders', (req, res) => {
  const { reminders } = req.body;

  if (!Array.isArray(reminders)) {
    return res.status(400).json({ success: false, error: 'reminders must be an array' });
  }

  fs.writeFileSync(remindersPath, reminders.join('\n'));
  return res.json({ success: true });
});

app.post('/upload', upload.array('photos'), (req, res) => {
  res.json({ success: true });
});

app.get('/photos', (req, res) => {
  fs.readdir(photosDir, (err, files) => {
    if (err) return res.status(500).json([]);
    const images = files.filter(f => /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(f));
    return res.json(images);
  });
});

app.use('/photos', express.static(photosDir));

app.post('/delete-photo', (req, res) => {
  const { fileName } = req.body;
  const filePath = safePhotoPath(fileName || '');

  if (!filePath) {
    return res.status(400).json({ success: false });
  }

  return fs.unlink(filePath, err => {
    if (err) return res.status(500).json({ success: false });
    return res.json({ success: true });
  });
});

const server = app.listen(port, () => {
  const localAddress = ip.address();
  const displayUrl = `http://${localAddress}:${port}/`;
  const dashboardUrl = `http://${localAddress}:${port}/dashboard`;

  console.log(`Display available at ${displayUrl}`);
  console.log(`Dashboard available at ${dashboardUrl}`);
  console.log(`Photos directory: ${photosDir}`);
});

module.exports = { app, server, paths: { dataDir, photosDir, settingsPath, remindersPath } };
