const fs = require('fs');
const os = require('os');

function getLANIP() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return '127.0.0.1';
}

const lanIP = getLANIP();

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost'; // fallback
}

const localIP = getLocalIP();

console.log(lanIP, localIP)
const envContent = `VITE_BACKEND_URL=https://${lanIP}:3000\n`;

fs.writeFileSync('./.env', envContent);
fs.writeFileSync('./frontend/.env', envContent);
console.log(`✅ Generated .env with: ${envContent}`);
