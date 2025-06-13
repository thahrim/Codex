const qrcode = require('qrcode');
const fs = require('fs');
const ip = require('ip');
const path = require('path');

const qrPath = path.join(__dirname, 'qr.png');
const ipCachePath = path.join(__dirname, 'qr_ip.txt');
const currentIp = ip.address();
const uploadURL = `http://${currentIp}:8080/dashboard`;

function generateQRCode() {
  qrcode.toFile(qrPath, uploadURL, {
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    },
    width: 200
  }, function (err) {
    if (err) console.error('❌ QR generation failed:', err);
    else {
      fs.writeFileSync(ipCachePath, currentIp);
      console.log('✅ QR Code updated at', qrPath);
    }
  });
}

function maybeGenerateQR() {
  let regenerate = false;
  if (!fs.existsSync(qrPath)) {
    regenerate = true;
  } else {
    try {
      const lastIp = fs.readFileSync(ipCachePath, 'utf8').trim();
      if (lastIp !== currentIp) {
        regenerate = true;
      }
    } catch {
      regenerate = true;
    }
  }

  if (regenerate) {
    generateQRCode();
  } else {
    console.log('ℹ️ Existing QR is current. No regeneration needed.');
  }
}

module.exports = { maybeGenerateQR };