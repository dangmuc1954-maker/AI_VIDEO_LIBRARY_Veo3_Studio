const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

function ln(r, e, t) {
  return spawn(r, e, { stdio: ['ignore', 'pipe', 'pipe'] });
}

function F(r) {
  if (r?.aborted) throw new Error('Aborted');
}

function Io(r, e) {
  return new Promise((t, o) => {
    const n = ln(r, ['-version']);
    let s = !1;
    const a = (d, l) => {
      s || (s = !0, clearTimeout(i), e?.removeEventListener('abort', c), l ? o(l) : t(d));
    };
    const i = setTimeout(() => {
      n.kill('SIGKILL');
      a(!1);
    }, 5000);
    const c = () => {
      n.kill('SIGKILL');
      a(!1);
    };
    e?.addEventListener('abort', c, { once: !0 });
    e?.aborted && c();
    n.on('error', () => a(!1));
    n.on('close', d => a(d === 0));
  });
}

async function oa(r) {
  if (F(r)) return;
  if (await Io('ffmpeg', r)) return 'ffmpeg';
  throw new Error('FFmpeg not found');
}

async function test() {
  const ac = new AbortController();
  const bin = await oa(ac.signal);
  console.log('oa returned ffmpeg binary:', bin);
}

test().catch(e => console.error(e));
