const fs = require('fs');
const path = require('path');

const vfsPath = path.resolve(__dirname, '../app/out/renderer/assets/VideoFactoryStudio.js');
let content = fs.readFileSync(vfsPath, 'utf8');

const targetIdx = content.indexOf('return vAccs.length > 0 ? React.createElement("select"');
if (targetIdx !== -1) {
  const afterIdx = content.indexOf(': React.createElement("span"', targetIdx);
  if (afterIdx !== -1) {
    const fixedSelect = `return vAccs.length > 0 ? React.createElement("select", {
              value: selectedVideoAccountId,
              onChange: (e) => handleSelectVideoAccount(e.target.value),
              className: \`bg-transparent text-[11px] font-black outline-none cursor-pointer max-w-[130px] truncate \${isMuse ? 'text-purple-300' : 'text-cyan-300'}\`
            },
              React.createElement("option", { key: "auto", value: "auto", className: "bg-[#0b101f] text-amber-300 font-bold" }, isMuse ? "⚡ Tự động đổi Acc (Tối đa 6 luồng/acc)" : "🔄 Tự động chọn tài khoản"),
              ...vAccs.map(acc => 
                React.createElement("option", { key: acc.accountId, value: acc.accountId, className: "bg-[#0b101f] text-gray-200" },
                  \`\${isMuse ? '⚡' : '🎬'} \${acc.accountEmail || acc.accountDisplayName || acc.accountId}\`
                )
              )
            ) `;
    
    content = content.slice(0, targetIdx) + fixedSelect + content.slice(afterIdx);
    fs.writeFileSync(vfsPath, content, 'utf8');
    console.log('✅ Successfully fixed VideoFactoryStudio select block!');
  } else {
    console.error('❌ Could not find afterIdx');
  }
} else {
  console.error('❌ Could not find targetIdx');
}
