const fs = require('fs');
const path = require('path');

const targetFiles = [
  path.join(__dirname, '../app/out/renderer/assets/index-8u8DZic4.js'),
  path.join(__dirname, '../extracted_original/out/renderer/assets/index-8u8DZic4.js'),
  path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Customer_Edition/resources/app/out/renderer/assets/index-8u8DZic4.js')
];

const targetPattern = /className:`w-9 h-9 rounded-md flex items-center justify-center shadow-md \$\{E\?"bg-emerald-500\/15 text-emerald-400 ring-1 ring-emerald-400\/25 shadow-emerald-500\/10":"bg-accent\/12 text-accent ring-1 ring-accent\/25 shadow-accent\/10"\}`,\s*children:E\?T\.jsx\(pA,\{size:18\}\):T\.jsx\(Jy,\{size:18\}\)\}\),T\.jsxs\("div",\{className:"flex-1 min-w-0",children:\[T\.jsx\("div",\{className:"text-sm font-medium text-text-primary truncate",children:"This Device"\}\),T\.jsx\("div",\{className:`text-\[11px\] font-medium truncate \$\{E\?"text-emerald-400":"text-text-muted"\}`,\s*children:M\}\)\]\}\)/g;

const replacement = `className:\`w-9 h-9 rounded-md flex items-center justify-center shadow-md \${E?(y?.plan==="gold"?"bg-amber-500/20 text-amber-300 ring-1 ring-amber-400/35 shadow-amber-500/15":y?.plan==="silver"?"bg-purple-500/20 text-purple-300 ring-1 ring-purple-400/35 shadow-purple-500/15":y?.plan==="basic"?"bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-400/35 shadow-indigo-500/15":"bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-400/30 shadow-emerald-500/15"):"bg-accent/12 text-accent ring-1 ring-accent/25 shadow-accent/10"}\`,children:E?(y?.plan==="gold"?T.jsx("span",{className:"text-base select-none leading-none",title:"Gold VIP",children:"👑"}):y?.plan==="silver"?T.jsx("span",{className:"text-base select-none leading-none",title:"Silver",children:"💎"}):y?.plan==="basic"?T.jsx("span",{className:"text-base select-none leading-none",title:"Basic",children:"⚡"}):y?.plan==="trial"?T.jsx("span",{className:"text-base select-none leading-none",title:"Trải Nghiệm Free",children:"🎁"}):T.jsx(pA,{size:18})):T.jsx(Jy,{size:18})}),T.jsxs("div",{className:"flex-1 min-w-0",children:[T.jsx("div",{className:"text-sm font-medium text-text-primary truncate",children:"This Device"}),T.jsx("div",{className:\`text-[11px] font-semibold truncate \${E?(y?.plan==="gold"?"text-amber-400":y?.plan==="silver"?"text-purple-400":y?.plan==="basic"?"text-indigo-400":"text-emerald-400"):"text-text-muted"}\`,children:M})]})`;

targetFiles.forEach(fp => {
  if (fs.existsSync(fp)) {
    let content = fs.readFileSync(fp, 'utf8');
    if (targetPattern.test(content)) {
      content = content.replace(targetPattern, replacement);
      fs.writeFileSync(fp, content, 'utf8');
      console.log('✅ Patched plan badge icon in:', fp);
    } else {
      console.log('⚠️ Pattern not matched in:', fp);
    }
  }
});
