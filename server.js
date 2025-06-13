const express = require('express');
const fs = require('fs');
const path = require('path');
const ip = require('ip');
const multer = require('multer');
const app = express();
const port = 8080;

const settingsPath = path.join(__dirname, 'settings.json');
const remindersPath = path.join('C:/Photos', 'reminders.txt');
const photosDir = path.join('C:/Photos');

if (!fs.existsSync(settingsPath)) fs.writeFileSync(settingsPath, JSON.stringify({ showQR: true, qrPosition: "bottom-right" }, null, 2));
if (!fs.existsSync(remindersPath)) fs.writeFileSync(remindersPath, "Move your limbs now");
if (!fs.existsSync(photosDir)) fs.mkdirSync(photosDir, { recursive: true });

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/photos', express.static(photosDir));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, photosDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

app.get('/settings', (req, res) => {
  try {
    const settings = JSON.parse(fs.readFileSync(settingsPath));
    res.json(settings);
  } catch {
    res.json({ showQR: true, qrPosition: "bottom-right" });
  }
});

app.post('/settings', (req, res) => {
  const newSettings = {
    showQR: req.body.showQR === "on",
    qrPosition: req.body.qrPosition || "bottom-right",
    reminderPosition: req.body.reminderPosition || "bottom",
    reminderSize: req.body.reminderSize === "custom" ? (req.body.customSize || "32px") : req.body.reminderSize || "medium"
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
  fs.writeFileSync(remindersPath, reminders.join('\n'));
  res.json({ success: true });
});

app.post('/upload', upload.array('photos'), (req, res) => {
  res.json({ success: true });
});

app.get('/photos', (req, res) => {
  fs.readdir(photosDir, (err, files) => {
    if (err) return res.status(500).json([]);
    const images = files.filter(f => /\.(jpg|jpeg|png|gif)$/i.test(f));
    res.json(images);
  });
});

app.post('/delete-photo', (req, res) => {
  const { fileName } = req.body;
  const filePath = path.join(photosDir, fileName);
  fs.unlink(filePath, err => {
    if (err) return res.status(500).json({ success: false });
    res.json({ success: true });
  });
});

app.listen(port, () => {
  const dashboardUrl = `http://${ip.address()}:${port}/dashboard`;
  console.log(`Dashboard available at ${dashboardUrl}`);
});
