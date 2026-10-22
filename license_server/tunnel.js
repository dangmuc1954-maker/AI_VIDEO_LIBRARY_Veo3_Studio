const { spawn } = require('child_process');
const http = require('http');

let currentUrl = '';

function startTunnel() {
  console.log('[*] Đang khởi tạo đường hầm kết nối Webhook...');
  
  // Connect via SSH with strong keepalive flags
  const ssh = spawn('ssh', [
    '-o', 'StrictHostKeyChecking=no',
    '-o', 'ServerAliveInterval=15',
    '-o', 'ServerAliveCountMax=5',
    '-o', 'ExitOnForwardFailure=yes',
    '-R', '80:127.0.0.1:8787',
    'nokey@localhost.run'
  ]);

  ssh.stdout.on('data', data => {
    const str = data.toString();
    console.log('[Tunnel Output]', str);
    const match = str.match(/https:\/\/([a-zA-Z0-9.-]+\.lhr\.life)/);
    if (match) {
      currentUrl = `https://${match[1]}/api/webhook/payment`;
      console.log(`\n============================================================`);
      console.log(`🚀 WEBHOOK PUBLIC URL HIỆN TẠI: ${currentUrl}`);
      console.log(`============================================================\n`);
    }
  });

  ssh.stderr.on('data', data => {
    console.log('[Tunnel Info]', data.toString());
  });

  ssh.on('close', code => {
    console.log(`[!] Đường hầm bị ngắt (mã ${code}), đang tự động kết nối lại sau 3 giây...`);
    setTimeout(startTunnel, 3000);
  });

  ssh.on('error', err => {
    console.error('[Tunnel Error]', err);
    setTimeout(startTunnel, 3000);
  });
}

// Keep-alive heartbeat: ping local server every 20 seconds
setInterval(() => {
  http.get('http://127.0.0.1:8787/v1/plans', res => {
    // Keep socket warm
  }).on('error', () => {});
}, 20000);

startTunnel();
