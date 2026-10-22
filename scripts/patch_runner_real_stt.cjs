const fs = require('fs');
const path = require('path');

console.log('=== Step 1: Updating useWorkflowRunner-DGw6Ekx4.js ===');
const runnerPath = path.resolve(__dirname, '../app/out/renderer/assets/useWorkflowRunner-DGw6Ekx4.js');
let runnerCode = fs.readFileSync(runnerPath, 'utf8');

const oldRunnerBlock = `else if(r.type==="video-script-extract"||r.type==="stt"){
  let sText = r.config?.outputText?.trim();
  let vid = (k.videos && k.videos[0]) || (k.images && k.images[0]);

  // Nếu chưa có video từ k, quét ngược lại các kết quả đã chạy trong workflow
  if (!vid) {
    for (const [nodeId, nodeVal] of u.entries()) {
      if (nodeVal?.videos && nodeVal.videos.length > 0) {
        vid = nodeVal.videos[0];
        break;
      }
    }
  }

  // Nếu đã có sẵn kịch bản (do anh Tris đã gõ hoặc đã bấm bóc trước đó)
  if (sText) {
    z(r, \`Sử dụng kịch bản lời thoại có sẵn: "\${sText}"\`, "info", { phase: "extract" });
    H.text = sText;
    H.texts = [sText];
    if (vid) H.videos = [vid];
    x(r.id, 100);
    y(r.id, { progress: 100, statusText: "Kịch bản sẵn sàng", config: { ...r.config, outputText: sText } });
    z(r, \`Đã nạp kịch bản lời thoại sẵn sàng cho ElevenLabs: "\${sText}"\`, "success", { phase: "result" });
  } else {
    if (!vid) throw new Error(\`\${r.title} cần 1 video đầu vào từ Google Flow (hoặc bấm nút "Bóc kịch bản ngay" trên thẻ).\`);
    z(r, "Đang lắng nghe âm thanh video và chuyển thành văn bản chuẩn...", "info", { phase: "extract" });
    x(r.id, 30);
    y(r.id, { progress: 30, statusText: "Đang chuyển âm thanh sang văn bản" });
    const C = window.aiforge?.assets;
    if (!C?.transcribeVideoAudio) throw new Error("Chức năng chuyển âm thanh sang văn bản chưa khả dụng trong preload.");
    const vidId = vid.assetId || vid.id || (typeof vid.url === "string" ? vid.url.replace(/^.*\\/asset\\//, "").replace(/\\?.*$/, "") : "");
    const res = await Is(w, de => C.transcribeVideoAudio(vidId, { operationId: de }), C.cancelMerge);
    if (w?.aborted) throw new Ze;
    sText = res.script?.trim();
    if (!sText) throw new Error("Không phát hiện được lời thoại trong âm thanh của video.");
    H.text = sText;
    H.texts = [sText];
    H.videos = [vid];
    x(r.id, 100);
    y(r.id, { progress: 100, statusText: "Đã bóc kịch bản thành công", config: { ...r.config, outputText: sText, duration: res.duration } });
    z(r, \`Đã bóc kịch bản lời thoại (\${res.duration}s) đưa sang ElevenLabs: "\${sText}"\`, "success", { phase: "result" });
  }
}`;

const newRunnerBlock = `else if(r.type==="video-script-extract"||r.type==="stt"){
  let vid = (k.videos && k.videos[0]) || (k.images && k.images[0]);

  // Nhận chuẩn output video từ Google Flow nối tới
  if (!vid) {
    // Quét các kết quả của các node đã chạy trước đó trong workflow
    for (const [nodeId, nodeVal] of u.entries()) {
      if (nodeVal?.videos && nodeVal.videos.length > 0) {
        vid = nodeVal.videos[0];
        break;
      }
    }
  }

  // Nếu vẫn chưa có, quét các node Google Flow trên canvas xem có video đã tạo sẵn không
  if (!vid && Array.isArray(t.current)) {
    const flowNode = t.current.find(nd => (nd.type === "google-flow" || nd.type === "veo3") && Array.isArray(nd.config?.outputAssets) && nd.config.outputAssets.length > 0);
    if (flowNode) {
      vid = flowNode.config.outputAssets.find(ast => ast.type === "video") || flowNode.config.outputAssets[0];
    }
  }

  if (!vid) throw new Error(\`\${r.title} cần 1 video đầu vào từ Google Flow để chuyển giọng nói sang văn bản.\`);

  z(r, "Đang lắng nghe âm thanh video và nhận diện giọng nói chính xác...", "info", { phase: "extract" });
  x(r.id, 30);
  y(r.id, { status: "running", progress: 30, statusText: "Đang lắng nghe âm thanh video..." });

  const C = window.aiforge?.assets;
  if (!C?.transcribeVideoAudio) throw new Error("Chức năng nhận diện giọng nói video chưa khả dụng trong preload.");

  const vidId = vid.assetId || vid.id || (typeof vid.url === "string" ? vid.url.replace(/^.*\\/asset\\//, "").replace(/\\?.*$/, "") : "");
  const res = await Is(w, de => C.transcribeVideoAudio(vidId, { operationId: de }), C.cancelMerge);
  if (w?.aborted) throw new Ze;

  const sText = res.script?.trim();
  if (!sText) throw new Error("Không phát hiện được giọng nói trong âm thanh của video từ Flow.");

  H.text = sText;
  H.texts = [sText];
  H.videos = [vid];

  r.config = { ...r.config, outputText: sText, duration: res.duration };
  x(r.id, 100);
  y(r.id, { status: "completed", progress: 100, statusText: "Đã nhận diện giọng nói thành công", config: { ...r.config, outputText: sText, duration: res.duration } });
  z(r, \`Đã nhận diện chính xác giọng nói video (\${res.duration}s) chuyển sang ElevenLabs: "\${sText}"\`, "success", { phase: "result" });
}`;

if (runnerCode.includes(oldRunnerBlock)) {
  runnerCode = runnerCode.replace(oldRunnerBlock, newRunnerBlock);
  fs.writeFileSync(runnerPath, runnerCode, 'utf8');
  console.log('  ✓ Updated runner: now ALWAYS transcribes real audio from Google Flow video!');
} else {
  console.error('  ❌ oldRunnerBlock not found in runner');
}
