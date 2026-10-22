const { spawn } = require('child_process');
const http = require('http');

const SUBDOMAIN = 'aiforge-sepay-v3';
const PORT = 8787;

function launchTunnel() {
  console.log(`[*] Khởi chạy Localtunnel với subdomain cố định: ${SUBDOMAIN}...`);
  
  const lt = spawn('npx.cmd', ['-y', 'localtunnel', '--port', String(PORT), '--subdomain', SUBDOMAIN], {
    shell: true
  });

  lt.stdout.on('data', data => {
    const str = data.toString();
    console.log('[Tunnel Output]', str.trim());
  });

  lt.stderr.on('data', data => {
    console.log('[Tunnel Info]', data.toString().trim());
  });

  lt.on('close', code => {
    console.log(`[!] Localtunnel ngắt kết nối (mã ${code}), đang tự khởi động lại sau 3s...`);
    setTimeout(launchTunnel, 3000);
  });

  lt.on('error', err => {
    console.error('[Tunnel Error]', err);
    setTimeout(launchTunnel, 3000);
  });
}

// Keepalive heartbeat
setInterval(() => {
  http.get('http://127.0.0.1:8787/v1/plans', () => {}).on('error', () => {});
}, 15000);

launchTunnel();
