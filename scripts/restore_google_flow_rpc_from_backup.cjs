const fs = require('fs');
const path = require('path');

const currentPath = path.resolve(__dirname, '../app/out/main/index.js');
const backupPath = path.resolve(__dirname, '../app/out_backup_before_sync/main/index.js');
const current = fs.readFileSync(currentPath, 'utf8');
const backup = fs.readFileSync(backupPath, 'utf8');

function replaceBlock(source, sourceBackup, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start + startMarker.length);
  const backupStart = sourceBackup.indexOf(startMarker);
  const backupEnd = sourceBackup.indexOf(endMarker, backupStart + startMarker.length);
  if (start < 0 || end < 0 || backupStart < 0 || backupEnd < 0) {
    throw new Error(`Unable to locate block ${startMarker}`);
  }
  return source.slice(0, start) + sourceBackup.slice(backupStart, backupEnd) + source.slice(end);
}

const backupCopy = `${currentPath}.pre_google_flow_rpc_restore.bak`;
fs.copyFileSync(currentPath, backupCopy);
let output = current;
output = replaceBlock(output, backup, 'function zu(r){', 'function Ku(r){');
output = replaceBlock(output, backup, 'function nl(r){', 'function hA(r){');

// Restore the original headless resource policy used by the backup. The current
// patch changed this policy only for Google Flow and can alter the browser signal
// seen by Flow while a session is being initialized.
const currentResource = 'if(e.providerId!=="banana"&&e.providerId!=="veo3"&&e.isHeadlessMode&&(o.resourceType==="image"||o.resourceType==="media"))return n({cancel:!0})';
const backupResource = 'if(e.isHeadlessMode&&(o.resourceType==="image"||o.resourceType==="media"))return n({cancel:!0})';
if (output.includes(currentResource)) output = output.replace(currentResource, backupResource);

fs.writeFileSync(currentPath, output, 'utf8');
console.log(`[OK] Restored Google Flow RPC blocks from ${backupPath}`);
console.log(`[OK] Current main size: ${current.length} -> ${output.length}`);
console.log(`[OK] Backup of pre-restore file: ${backupCopy}`);
