const fs = require('fs');
const path = require('path');

console.log('=== [CÀI ĐẶT BỘ SKILL TỪ GITHUB PTN1411/SKILL VÀO ENI & ANTIGRAVITY] ===');

const sourceDir = 'C:/Users/admin/.gemini/antigravity-ide/brain/4d55b967-39a0-4765-aabf-ce3e4f1815af/scratch/ptn1411_skill';
const globalSkillsDir = 'C:/Users/admin/.gemini/config/skills';
const workspaceSkillsDir = path.resolve(__dirname, '../.agents/skills');

fs.mkdirSync(globalSkillsDir, { recursive: true });
fs.mkdirSync(workspaceSkillsDir, { recursive: true });

function copyRecursive(src, dest) {
  if (fs.statSync(src).isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach(item => {
      copyRecursive(path.join(src, item), path.join(dest, item));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// 1. Quét tất cả các folder có SKILL.md
const items = fs.readdirSync(sourceDir);
let installedCount = 0;

for (const item of items) {
  const itemPath = path.join(sourceDir, item);
  if (fs.statSync(itemPath).isDirectory() && fs.existsSync(path.join(itemPath, 'SKILL.md'))) {
    // Copy sang global config
    const targetGlobal = path.join(globalSkillsDir, item);
    copyRecursive(itemPath, targetGlobal);

    // Copy sang workspace .agents/skills
    const targetWorkspace = path.join(workspaceSkillsDir, item);
    copyRecursive(itemPath, targetWorkspace);

    installedCount++;
    console.log(`  ✓ Đã nạp Skill [${installedCount}]: ${item}`);
  }
}

// 2. Nạp thêm skill gốc authorized-artifact-auditor từ root SKILL.md
if (fs.existsSync(path.join(sourceDir, 'SKILL.md'))) {
  const auditorGlobal = path.join(globalSkillsDir, 'authorized-artifact-auditor');
  const auditorWorkspace = path.join(workspaceSkillsDir, 'authorized-artifact-auditor');
  fs.mkdirSync(auditorGlobal, { recursive: true });
  fs.mkdirSync(auditorWorkspace, { recursive: true });
  fs.copyFileSync(path.join(sourceDir, 'SKILL.md'), path.join(auditorGlobal, 'SKILL.md'));
  fs.copyFileSync(path.join(sourceDir, 'SKILL.md'), path.join(auditorWorkspace, 'SKILL.md'));
  installedCount++;
  console.log(`  ✓ Đã nạp Skill [${installedCount}]: authorized-artifact-auditor (Root Skill)`);
}

console.log(`\n🎉 HOÀN TẤT NẠP TOÀN BỘ ${installedCount} SKILLS VÀO CẢ HỆ THỐNG GLOBAL LẪN WORKSPACE!`);
