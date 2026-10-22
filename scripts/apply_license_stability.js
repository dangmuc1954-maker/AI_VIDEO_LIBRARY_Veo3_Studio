const fs = require('fs');
const path = require('path');

const targetFiles = [
  path.resolve(__dirname, '../app/out/main/index.js'),
  path.resolve(process.env.LOCALAPPDATA || 'C:/Users/admin/AppData/Local', 'Programs/AI VIDEO LIBRARY/resources/app/out/main/index.js')
];

for (const file of targetFiles) {
  if (!fs.existsSync(file)) continue;
  let code = fs.readFileSync(file, 'utf8');

  // 1. Sửa hàm Hy(r) để chỉ invalidate khi bị Ban/Đổi máy/Thu hồi key thực sự
  const oldHy = 'function Hy(r){if(!r)return!1;const e=r.errorCode||r.responseBody?.error?.code||r.responseBody?.code||"";if(["ACTIVATION_NOT_FOUND","ACTIVATION_INACTIVE","MACHINE_MISMATCH","LICENSE_REVOKED","MACHINE_UNLINKED","MACHINE_BANNED","KEY_REVOKED","LICENSE_REQUIRED","LICENSE_EXPIRED"].includes(e))return!0;if(r instanceof Wr&&(r.statusCode===401||r.statusCode===403||r.statusCode===404||r.statusCode===409))return!0;return!1}';
  const newHy = 'function Hy(r){if(!r)return!1;const e=r.errorCode||r.responseBody?.error?.code||r.responseBody?.code||"";if(["MACHINE_BANNED","MACHINE_UNLINKED","LICENSE_REVOKED","KEY_REVOKED"].includes(e))return!0;return!1}';

  if (code.includes(oldHy)) {
    code = code.replace(oldHy, newHy);
    console.log('[1] Fixed Hy(r) in:', file);
  } else {
    console.log('[1] Notice: oldHy not matched exactly, looking for alternate pattern');
    const altRegex = /function Hy\(r\)\{if\(!r\)return!1;const e=r\.errorCode[^}]+return!1\}/;
    if (altRegex.test(code)) {
      code = code.replace(altRegex, newHy);
      console.log('[1] Replaced Hy(r) with regex in:', file);
    }
  }

  // 2. Sửa performCheckIn catch block
  const oldCatch = '}catch(o){if(!Hy(o))throw o;return e<this.lastAppliedEntitlementSequence?this.evaluateCurrentToken():this.invalidateStoredEntitlement(o)}';
  const newCatch = '}catch(o){const cur=this.evaluateCurrentTokenSync();const c=o?.errorCode||o?.responseBody?.error?.code||o?.responseBody?.code||"";if(cur&&cur.valid&&!["MACHINE_BANNED","MACHINE_UNLINKED","LICENSE_REVOKED","KEY_REVOKED"].includes(c))return cur;if(!Hy(o))throw o;return this.invalidateStoredEntitlement(o)}';

  if (code.includes(oldCatch)) {
    code = code.replace(oldCatch, newCatch);
    console.log('[2] Enhanced performCheckIn catch block in:', file);
  }

  // 3. Tăng interval trong getStatusForGate từ 10s lên 300s (5 phút)
  const oldGateInterval = 'Date.now()-(this.lastGateCheckInTime||0)>10*1e3';
  const newGateInterval = 'Date.now()-(this.lastGateCheckInTime||0)>300*1e3';
  if (code.includes(oldGateInterval)) {
    code = code.replace(oldGateInterval, newGateInterval);
    console.log('[3] Relaxed gate check-in interval to 300s in:', file);
  }

  fs.writeFileSync(file, code, 'utf8');
  console.log('✅ Successfully stabilized license connection in:', file);
}
