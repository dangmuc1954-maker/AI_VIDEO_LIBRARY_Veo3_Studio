const fs = require('fs');
const path = require('path');
const vm = require('vm');

const mainJsPath = path.join(__dirname, '../app/out/main/index.js');
let code = fs.readFileSync(mainJsPath, 'utf8');

// Ensure show: true and instant show + focus
code = code.replace('backgroundColor:"#070a11",show:!1', 'backgroundColor:"#070a11",show:!0');
code = code.replace('devTools:!G.isPackaged', 'devTools:!0');

// Ensure window is shown immediately after creation
const oldCreateWindowEnd = 'process.env.ELECTRON_RENDERER_URL?B.loadURL(`${process.env.ELECTRON_RENDERER_URL}`):B.loadFile(N(Nn,"../renderer/index.html"))';
const newCreateWindowEnd = 'process.env.ELECTRON_RENDERER_URL?B.loadURL(`${process.env.ELECTRON_RENDERER_URL}`):B.loadFile(N(Nn,"../renderer/index.html")),setTimeout(()=>{try{B?.show();B?.focus();}catch{}},100)';
code = code.replace(oldCreateWindowEnd, newCreateWindowEnd);

try {
  new vm.SourceTextModule(code);
  fs.writeFileSync(mainJsPath, code, 'utf8');
  console.log('Successfully updated main/index.js with instant show + focus + devTools!');
} catch (err) {
  console.error('Syntax error:', err);
}
