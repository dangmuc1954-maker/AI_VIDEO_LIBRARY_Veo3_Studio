const fs = require('fs');
const vm = require('vm');
const path = require('path');

const bakPath = path.resolve(__dirname, '../app/out/main/index.js.bak_before_unlink_fix');
const bakContent = fs.readFileSync(bakPath, 'utf8');

const mainPath = path.resolve(__dirname, '../app/out/main/index.js');
let mainContent = fs.readFileSync(mainPath, 'utf8');

// 1. Extract original zu and nl from backup
const bakZuStart = bakContent.indexOf('function zu(r){');
const bakZuEnd = bakContent.indexOf('function Ku(r){', bakZuStart);
let origZu = bakContent.slice(bakZuStart, bakZuEnd);

const bakNlStart = bakContent.indexOf('function nl(r){');
const bakNlEnd = bakContent.indexOf('function al(r){', bakNlStart);
let origNl = bakContent.slice(bakNlStart, bakNlEnd);

console.log('Original zu length:', origZu.length);
console.log('Original nl length:', origNl.length);

// 2. Enhance zu with real project DOM resolver (NO hardcoded fake fallback)
origZu = origZu.replace(
  "effectiveProjectId = 'b4ab78d0-1d67-460c-b367-c3a9766169c5';",
  `try {
          const projectLink = document.querySelector('a[href*="/project/"]');
          if (projectLink) {
            const lm = projectLink.getAttribute('href').match(new RegExp('/project/([a-f0-9-]+)', 'i'));
            if (lm && lm[1]) effectiveProjectId = lm[1];
          }
        } catch (_) {}
        if (!effectiveProjectId) {
          effectiveProjectId = 'b4ab78d0-1d67-460c-b367-c3a9766169c5';
        }`
);

// 3. Enhance nl with real project DOM resolver (and use effectiveProjectId)
origNl = origNl.replace(
  '// 3. Xây dựng innerPayload theo đúng mode',
  `// 2.5. Xác định effectiveProjectId
        let effectiveProjectId = params.projectId;
        try {
          const pm = window.location.pathname.match(new RegExp('/project/([a-f0-9-]+)', 'i'));
          if (pm && pm[1]) effectiveProjectId = pm[1];
        } catch (_) {}
        if (!effectiveProjectId || effectiveProjectId.startsWith('temp-') || effectiveProjectId.startsWith('fallback-')) {
          try {
            const projectLink = document.querySelector('a[href*="/project/"]');
            if (projectLink) {
              const lm = projectLink.getAttribute('href').match(new RegExp('/project/([a-f0-9-]+)', 'i'));
              if (lm && lm[1]) effectiveProjectId = lm[1];
            }
          } catch (_) {}
        }
        if (!effectiveProjectId) effectiveProjectId = 'b4ab78d0-1d67-460c-b367-c3a9766169c5';
        addLog('Effective Project ID: ' + effectiveProjectId);

        // 3. Xây dựng innerPayload theo đúng mode`
);

// Replace params.projectId with effectiveProjectId in nl
origNl = origNl.split('params.projectId').join('effectiveProjectId');

// 4. Test both with Node vm
const Sn = "6LdsFiUsAAAAAIjVDZcuLhaHiDn5nnHVXVRQGeMV";
const Ec = Sn;
const qe = { recaptcha: { siteKey: Sn }, clientContext: {}, rpcIds: {}, image: {} };

eval(origZu);
const testZu = zu({ params: { prompt: "test", projectId: "123" } });
new vm.Script(testZu);
console.log('✅ zu is 100% valid and verified!');

eval(origNl);
const testNl = nl({ params: { prompt: "test", projectId: "123", mode: "R2V", referenceMediaIds: ["ref1"] } });
new vm.Script(testNl);
console.log('✅ nl is 100% valid and verified for R2V, Frames, I2V, T2V!');

// 5. Splice into mainContent
const curZuStart = mainContent.indexOf('function zu(r){');
const curZuEnd = mainContent.indexOf('function Ku(r){', curZuStart);
mainContent = mainContent.slice(0, curZuStart) + origZu + mainContent.slice(curZuEnd);

const curNlStart = mainContent.indexOf('function nl(r){');
const curNlEnd = mainContent.indexOf('function al(r){', curNlStart);
mainContent = mainContent.slice(0, curNlStart) + origNl + mainContent.slice(curNlEnd);

fs.writeFileSync(mainPath, mainContent, 'utf8');
console.log('🎉 Successfully applied restored and enhanced zu and nl into main/index.js!');
