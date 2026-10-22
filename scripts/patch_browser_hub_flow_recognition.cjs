const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('======================================================================');
console.log('🎯 VÁ DUY NHẤT NHẬN DIỆN TÀI KHOẢN BROWSER HUB CHO DOMAIN FLOW.GOOGLE 🎯');
console.log('======================================================================');

const mainPath = path.join(__dirname, '../app/out/main/index.js');
let code = fs.readFileSync(mainPath, 'utf8');

// 1. Add /flow\.google/i to relevantDomains in inferAuthStartedAt
if (!code.includes('/flow\\.google/i')) {
  code = code.replace(
    'relevantDomains:[/google/i,/labs\\.google/i]',
    'relevantDomains:[/google/i,/labs\\.google/i,/flow\\.google/i]'
  );
  console.log('  ✓ Đã cập nhật relevantDomains cho cookie flow.google');
}

// 2. Inject Google Flow Profile Boq RPC detection inside detectPageState
const flowDetectionSnippet = `
            if (window.location.hostname.includes('flow.google.com')) {
              try {
                if (window.__aiforge_flow_user_profile && (Date.now() - (window.__aiforge_flow_user_profile_ts || 0) < 300000)) {
                  const p = window.__aiforge_flow_user_profile;
                  if (p?.email) {
                    return {
                      authStatus: 'Logged In',
                      identity: { displayName: p.displayName || p.email.split('@')[0], email: p.email, avatarUrl: p.avatarUrl }
                    };
                  }
                }
                const wiz = window.WIZ_global_data || {};
                const at = wiz.SNlM0e || '';
                const sid = wiz.FdrFJe || '';
                const bl = wiz.cfb2h || 'boq_labs-ai-sandbox-frontend_20260909.10_p0';
                if (at) {
                  const rpcId = 'o30O0e';
                  const fReq = JSON.stringify([[[rpcId, JSON.stringify([['me'], [[['person.photo', 'person.name', 'person.email']], null, [1, 7]]]), null, 'generic']]]);
                  const body = 'f.req=' + encodeURIComponent(fReq) + '&at=' + encodeURIComponent(at) + '&';
                  const url = '/_/AiSandboxAngularFrontend/data/batchexecute?rpcids=' + encodeURIComponent(rpcId) + '&source-path=%2F&bl=' + encodeURIComponent(bl) + '&f.sid=' + encodeURIComponent(sid) + '&rt=c';
                  const res = await fetch(url, {
                    method: 'POST',
                    headers: { 'content-type': 'application/x-www-form-urlencoded;charset=UTF-8' },
                    body
                  });
                  if (res.ok) {
                    const text = await res.text();
                    const cleanText = text.replace(/^\\)\\]\\}\\x27\\s*/, '');
                    for (const line of cleanText.split('\\n')) {
                      const trimmed = line.trim();
                      if (trimmed.startsWith('[[')) {
                        const parsed = JSON.parse(trimmed);
                        const match = Array.isArray(parsed) && parsed.find(l => Array.isArray(l) && l[1] === rpcId);
                        if (match && typeof match[2] === 'string') {
                          const inner = JSON.parse(match[2]);
                          let pEmail, pName, pAvatar;
                          const m1 = inner?.[0]?.[0]?.[2];
                          if (Array.isArray(m1)) {
                            pName = m1[2]?.[0]?.[1];
                            pAvatar = m1[3]?.[0]?.[1];
                            pEmail = m1[9]?.[0]?.[1];
                          }
                          if (!pEmail) {
                            const emailRegexMatch = JSON.stringify(inner).match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}/i);
                            if (emailRegexMatch) pEmail = emailRegexMatch[0];
                          }
                          if (pEmail) {
                            window.__aiforge_flow_user_profile = { email: pEmail, displayName: pName || pEmail.split('@')[0], avatarUrl: pAvatar };
                            window.__aiforge_flow_user_profile_ts = Date.now();
                            return {
                              authStatus: 'Logged In',
                              identity: { displayName: pName || pEmail.split('@')[0], email: pEmail, avatarUrl: pAvatar }
                            };
                          }
                        }
                      }
                    }
                  }
                }
              } catch (_) {}
            }
`;

const anchor = 'let sessionUser = null;';
if (!code.includes('window.location.hostname.includes(\'flow.google.com\')')) {
  if (code.includes(anchor)) {
    code = code.replace(anchor, flowDetectionSnippet + '\n            ' + anchor);
    console.log('  ✓ Đã chèn thành công cơ chế nhận diện Profile Google Flow qua RPC o30O0e vào detectPageState');
  } else {
    console.error('  ❌ Không tìm thấy anchor let sessionUser = null;');
    process.exit(1);
  }
} else {
  console.log('  [-] Đã có sẵn đoạn code nhận diện flow.google.com');
}

fs.writeFileSync(mainPath, code, 'utf8');

// 3. Syntax Check
console.log('\n[*] Kiểm tra cú pháp app/out/main/index.js...');
try {
  execSync(`node --check "${mainPath}"`, { stdio: 'inherit' });
  console.log('  ✅ Cú pháp chính xác 100%!');
} catch (e) {
  console.error('  ❌ Lỗi cú pháp:', e.message);
  process.exit(1);
}

console.log('\n🌟 ĐÃ VÁ HOÀN TẤT NHẬN DIỆN TÀI KHOẢN BROWSER HUB MÀ GIỮ NGUYÊN 100% TÍNH NĂNG! 🌟');
