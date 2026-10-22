// scripts/patch_fix_gemini_3scenes.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('======================================================================');
console.log('🔧 SỬA LỖI LÊN KỊCH BẢN: CHUYỂN SANG GEMINI-3.8-FLASH & PARSER ĐA NĂNG 🔧');
console.log('======================================================================');

const targetPaths = [
  path.join(__dirname, '../app/out/renderer/assets/VideoFactoryStudio.js'),
  path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Customer_Edition/resources/app/out/renderer/assets/VideoFactoryStudio.js'),
  path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Khach_Hang_v3.0/resources/app/out/renderer/assets/VideoFactoryStudio.js')
];

for (const targetPath of targetPaths) {
  if (!fs.existsSync(targetPath)) continue;

  let content = fs.readFileSync(targetPath, 'utf8');

  // 1. Sửa khâu tạo Showroom All Scenes sang gemini-3.8-flash
  content = content.replace(
    /https:\/\/generativelanguage\.googleapis\.com\/v1beta\/models\/gemini-3\.6-flash:generateContent/g,
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent'
  );

  // 2. Sửa model candidates trong kịch bản
  content = content.replace(
    /const modelCandidates = \['gemini-3\.6-flash', 'gemini-3\.5-flash', 'gemini-3\.7-flash', 'gemini-3\.1-flash-lite', 'gemini-flash-latest'\];/g,
    "const modelCandidates = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.5-flash-lite', 'gemini-3.7-flash'];"
  );

  // 3. Nâng cấp bộ lặp gọi API và parser kịch bản siêu mạnh mẽ
  const oldLoopSnippet = `      for (const mName of modelCandidates) {
        try {
          const resp = await fetch(\`https://generativelanguage.googleapis.com/v1beta/models/\${mName}:generateContent?key=\${activeKey}\`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyPayload)
          });

          if (resp.ok) {
            const data = await resp.json();
            const candidate = data?.candidates?.[0];
            let textOutput = candidate?.content?.parts?.map(p => p.text || '').join('') || '';
            const jsonMatch = textOutput.match(/\\[[\\s\\S]*\\]/);
            if (jsonMatch) {
              scriptData = JSON.parse(jsonMatch[0]);
              if (Array.isArray(scriptData) && scriptData.length >= sceneCount) {
                break;
              }
            }
          } else {
            lastError = await resp.text();
          }
        } catch(e) {
          lastError = e.message;
        }
      }`;

  const newLoopSnippet = `      for (const mName of modelCandidates) {
        try {
          const tryPayloads = [bodyPayload];
          if (validImgData) {
            tryPayloads.push({
              contents: [{ parts: [{ text: analysisPrompt }] }],
              generationConfig: { temperature: 0.8, response_mime_type: "application/json" }
            });
          }

          for (const curPayload of tryPayloads) {
            const resp = await fetch(\`https://generativelanguage.googleapis.com/v1beta/models/\${mName}:generateContent?key=\${activeKey}\`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(curPayload)
            });

            if (resp.ok) {
              const data = await resp.json();
              const candidate = data?.candidates?.[0];
              let textOutput = candidate?.content?.parts?.map(p => p.text || '').join('') || '';
              
              let parsedArr = null;
              try {
                const direct = JSON.parse(textOutput);
                if (Array.isArray(direct)) {
                  parsedArr = direct;
                } else if (typeof direct === 'object' && direct !== null) {
                  const arr = Object.values(direct).find(Array.isArray);
                  if (arr) parsedArr = arr;
                  else parsedArr = Object.values(direct).filter(v => v && (v.voiceScript || v.motionPrompt));
                }
              } catch(e1) {
                const jsonMatch = textOutput.match(/\\[[\\s\\S]*\\]/);
                if (jsonMatch) {
                  try { parsedArr = JSON.parse(jsonMatch[0]); } catch(e2){}
                }
              }

              if (Array.isArray(parsedArr) && parsedArr.length >= 1) {
                scriptData = parsedArr;
                break;
              }
            } else {
              lastError = await resp.text();
            }
          }

          if (scriptData) break;
        } catch(e) {
          lastError = e.message;
        }
      }`;

  if (content.includes(oldLoopSnippet)) {
    content = content.replace(oldLoopSnippet, newLoopSnippet);
  }

  // 4. Sửa kiểm tra scriptData để linh hoạt với 3, 4, hoặc 5 cảnh
  content = content.replace(
    /if \(scriptData && Array\.isArray\(scriptData\) && scriptData\.length >= sceneCount\) \{[\s\S]*?setScenes\(prev => prev\.map\(\(s, idx\) => \(\{[\s\S]*?voiceScript: scriptData\[idx\]\?\.voiceScript \|\| s\.voiceScript,[\s\S]*?motionPrompt: scriptData\[idx\]\?\.motionPrompt \|\| s\.motionPrompt,[\s\S]*?promptStatus: 'done'[\s\S]*?\}\)\)\);/g,
    `if (scriptData && Array.isArray(scriptData) && scriptData.length >= 1) {
        setScenes(prev => prev.map((s, idx) => ({
          ...s,
          voiceScript: scriptData[idx]?.voiceScript || scriptData[idx % scriptData.length]?.voiceScript || s.voiceScript,
          motionPrompt: scriptData[idx]?.motionPrompt || scriptData[idx % scriptData.length]?.motionPrompt || s.motionPrompt,
          promptStatus: 'done'
        })));`
  );

  fs.writeFileSync(targetPath, content, 'utf8');
  console.log('✅ Đã vá lỗi thành công:', targetPath);
}

// Cập nhật cả scripts/update_video_factory_flow_exact.js để lần sau chạy không bị mất
const updateExactPath = path.join(__dirname, 'update_video_factory_flow_exact.js');
if (fs.existsSync(updateExactPath)) {
  let uContent = fs.readFileSync(updateExactPath, 'utf8');
  uContent = uContent.replace(/gemini-3\.6-flash/g, 'gemini-3.8-flash');
  fs.writeFileSync(updateExactPath, uContent, 'utf8');
  console.log('✅ Đã cập nhật scripts/update_video_factory_flow_exact.js');
}

console.log('\\n🎉 HOÀN TẤT VÁ LỖI KỊCH BẢN 3/4/5 CẢNH!');
