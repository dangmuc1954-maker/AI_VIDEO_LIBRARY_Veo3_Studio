const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('======================================================================');
console.log('🚀 THÊM NỀN TẢNG MUSE AI VÀO STUDIO VIDEO AI & RUNTIME AUTOMATION 🚀');
console.log('======================================================================');

const appDir = path.resolve(__dirname, '../app');
const indexPath = path.join(appDir, 'out/renderer/assets/index-BS7vgKVV.js');
const iconPath = path.join(appDir, 'out/renderer/assets/ProviderIcon-BR50w6N5.js');
const vsPath = path.join(appDir, 'out/renderer/assets/VideoStudio-frcr8V6s.js');
const mainPath = path.join(appDir, 'out/main/index.js');

// ============================================================================
// 1. PATCH index-BS7vgKVV.js (Global Video Provider Definitions)
// ============================================================================
console.log('\n[1/4] Đang cập nhật index-BS7vgKVV.js...');
let indexCode = fs.readFileSync(indexPath, 'utf8');

// 1.1 Thêm "Muse AI" vào mảng Oy
if (indexCode.includes('const Oy=["Veo3","Grok"]')) {
  indexCode = indexCode.replace('const Oy=["Veo3","Grok"]', 'const Oy=["Veo3","Grok","Muse AI"]');
  console.log('  ✓ Đã thêm "Muse AI" vào mảng Oy (danh sách nhà cung cấp video)');
} else if (indexCode.includes('const Oy=["Veo3","Grok","Muse AI"]')) {
  console.log('  ✓ Mảng Oy đã có "Muse AI"');
}

// 1.2 Cập nhật hàm lấy model cho Muse AI (E1)
if (indexCode.includes('E1=n=>n==="Grok"?[...Qb]:[...lh]')) {
  indexCode = indexCode.replace(
    'E1=n=>n==="Grok"?[...Qb]:[...lh]',
    'E1=n=>n==="Grok"?[...Qb]:(n==="Muse AI"||n==="muse ai"||n==="muse")?["muse-video"]:[...lh]'
  );
  console.log('  ✓ Đã cập nhật hàm E1 lấy model cho Muse AI');
}

// 1.3 Cập nhật hàm lấy duration cho Muse AI (N1)
if (indexCode.includes('N1=n=>n==="grok-imagine-video"?[..._R]:[...sh(n)]')) {
  indexCode = indexCode.replace(
    'N1=n=>n==="grok-imagine-video"?[..._R]:[...sh(n)]',
    'N1=n=>n==="grok-imagine-video"?[..._R]:n==="muse-video"?["5s","10s","15s"]:[...sh(n)]'
  );
  console.log('  ✓ Đã cập nhật hàm N1 lấy thời lượng video cho Muse AI');
}

// 1.4 Cập nhật hàm dE cho muse-video
if (indexCode.includes('function dE(n,a){return n==="grok-imagine-video"?"grok-imagine-video":Yv(n,a)}')) {
  indexCode = indexCode.replace(
    'function dE(n,a){return n==="grok-imagine-video"?"grok-imagine-video":Yv(n,a)}',
    'function dE(n,a){return n==="grok-imagine-video"?"grok-imagine-video":n==="muse-video"?"muse-video":Yv(n,a)}'
  );
  console.log('  ✓ Đã cập nhật hàm dE cho muse-video');
}

// 1.5 Cập nhật hàm Vd cho muse-video
if (indexCode.includes('function Vd(n,a){return a==="grok-imagine-video"?$R(n):Xv(n,a)}')) {
  indexCode = indexCode.replace(
    'function Vd(n,a){return a==="grok-imagine-video"?$R(n):Xv(n,a)}',
    'function Vd(n,a){return a==="grok-imagine-video"?$R(n):a==="muse-video"?String(n||"5s"):Xv(n,a)}'
  );
  console.log('  ✓ Đã cập nhật hàm Vd cho muse-video');
}

fs.writeFileSync(indexPath, indexCode, 'utf8');

// ============================================================================
// 2. PATCH ProviderIcon-BR50w6N5.js (Logo & Icon hiển thị cho Muse AI)
// ============================================================================
console.log('\n[2/4] Đang cập nhật ProviderIcon-BR50w6N5.js...');
let iconCode = fs.readFileSync(iconPath, 'utf8');

const oldIconDict = 'd={"ChatGPT Images":e,Grok:m,Banana:p,Veo3:i,ElevenLabs:c,Whisper:s';
const newIconDict = 'd={"ChatGPT Images":e,Grok:m,Banana:p,Veo3:i,ElevenLabs:c,Whisper:s,"Muse AI":m,"muse ai":m,muse:m';

if (iconCode.includes(oldIconDict)) {
  iconCode = iconCode.replace(oldIconDict, newIconDict);
  console.log('  ✓ Đã gắn icon cho Muse AI trong ProviderIcon');
}

fs.writeFileSync(iconPath, iconCode, 'utf8');

// ============================================================================
// 3. PATCH VideoStudio-frcr8V6s.js (Giao diện Studio Video AI)
// ============================================================================
console.log('\n[3/4] Đang cập nhật VideoStudio-frcr8V6s.js...');
let vsCode = fs.readFileSync(vsPath, 'utf8');

// 3.1 Thêm trích xuất tài khoản Muse AI từ Browser Hub: museAccounts, activeMuseAccounts
const oldSessionFilter = 'at=l.useMemo(()=>X.filter(r=>r.providerId==="veo3"),[X]),Ce=l.useMemo(()=>at.filter(r=>ss(r)&&!rs(r)),[at]),xe=l.useMemo(()=>X.filter(r=>r.providerId==="grok"),[X]),Ie=l.useMemo(()=>xe.filter(r=>ss(r)&&!rs(r)),[xe]),';
const newSessionFilter = 'at=l.useMemo(()=>X.filter(r=>r.providerId==="veo3"),[X]),Ce=l.useMemo(()=>at.filter(r=>ss(r)&&!rs(r)),[at]),xe=l.useMemo(()=>X.filter(r=>r.providerId==="grok"),[X]),Ie=l.useMemo(()=>xe.filter(r=>ss(r)&&!rs(r)),[xe]),museAccounts=l.useMemo(()=>X.filter(r=>r.providerId==="muse"||r.providerId==="muse-ai"||(r.provider&&r.provider.toLowerCase().includes("muse"))||(r.startUrl&&r.startUrl.includes("muse.ai"))),[X]),activeMuseAccounts=l.useMemo(()=>museAccounts.filter(r=>ss(r)&&!rs(r)),[museAccounts]),';

if (vsCode.includes(oldSessionFilter)) {
  vsCode = vsCode.replace(oldSessionFilter, newSessionFilter);
  console.log('  ✓ Đã thêm state trích xuất tài khoản Muse AI (museAccounts, activeMuseAccounts)');
}

// 3.2 Cập nhật hàm Fe(r) để trả về danh sách tài khoản cho Muse AI
const oldFe = 'Fe=r=>{if(r==="Veo3"){const ee=at.filter(ae=>!ae.disabled).map(Tt);return ee.length>0?["Auto",...ee]:["Auto"]}if(r==="Grok"){const ee=xe.filter(ae=>!ae.disabled).map(Tt);return ee.length>0?["Auto",...ee]:["Auto"]}';
const newFe = 'Fe=r=>{if(r==="Veo3"){const ee=at.filter(ae=>!ae.disabled).map(Tt);return ee.length>0?["Auto",...ee]:["Auto"]}if(r==="Grok"){const ee=xe.filter(ae=>!ae.disabled).map(Tt);return ee.length>0?["Auto",...ee]:["Auto"]}if(r==="Muse AI"||r==="muse ai"||r==="muse"){const ee=museAccounts.filter(ae=>!ae.disabled).map(Tt);return ee.length>0?["Auto",...ee]:["Auto"]}';

if (vsCode.includes(oldFe)) {
  vsCode = vsCode.replace(oldFe, newFe);
  console.log('  ✓ Đã cập nhật dropdown tài khoản Fe(r) hỗ trợ Muse AI');
}

// 3.3 Cập nhật hàm fe(g) khi đổi provider trong panel bên phải
const oldFeGen = 'fe=g=>({provider:g,account:"Auto",mode:g==="Grok"?"Components":o?.mode||"Components",model:g==="Grok"?"grok-imagine-video":"Veo 3.1 - Fast",duration:g==="Grok"?"6s":"8s",ratio:g==="Grok"?o&&Gt.includes(o.ratio)?o.ratio:"1:1":o?.ratio==="9:16"||o?.ratio==="16:9"?o.ratio:"16:9",referenceAssetIds:g==="Grok"?(o?.referenceAssetIds||[]).slice(0,pt()):o?.referenceAssetIds})';
const newFeGen = 'fe=g=>({provider:g,account:"Auto",mode:g==="Grok"||g==="Muse AI"?"Components":o?.mode||"Components",model:g==="Grok"?"grok-imagine-video":g==="Muse AI"?"muse-video":"Veo 3.1 - Fast",duration:g==="Grok"?"6s":g==="Muse AI"?"5s":"8s",ratio:g==="Grok"||g==="Muse AI"?o&&Gt.includes(o.ratio)?o.ratio:"16:9":o?.ratio==="9:16"||o?.ratio==="16:9"?o.ratio:"16:9",referenceAssetIds:g==="Grok"||g==="Muse AI"?(o?.referenceAssetIds||[]).slice(0,1):o?.referenceAssetIds})';

if (vsCode.includes(oldFeGen)) {
  vsCode = vsCode.replace(oldFeGen, newFeGen);
  console.log('  ✓ Đã cập nhật hàm fe(g) chuyển đổi provider sang Muse AI');
}

// 3.4 Cập nhật hàm ce(p, K) khi đổi provider trực tiếp trong bảng hàng đợi
const oldCeGen = 'ce=(p,K)=>({provider:p,account:"Auto",mode:p==="Grok"?"Components":K.mode,model:p==="Grok"?"grok-imagine-video":"Veo 3.1 - Fast",duration:p==="Grok"?"6s":"8s",ratio:p==="Grok"?Gt.includes(K.ratio)?K.ratio:"1:1":K.ratio==="9:16"||K.ratio==="16:9"?K.ratio:"16:9",referenceAssetIds:p==="Grok"?(K.referenceAssetIds||[]).slice(0,pt()):K.referenceAssetIds,autoUpscale:p==="Grok"?!1:K.autoUpscale,autoRemoveWatermark:p==="Grok"?!1:K.autoRemoveWatermark})';
const newCeGen = 'ce=(p,K)=>({provider:p,account:"Auto",mode:p==="Grok"||p==="Muse AI"?"Components":K.mode,model:p==="Grok"?"grok-imagine-video":p==="Muse AI"?"muse-video":"Veo 3.1 - Fast",duration:p==="Grok"?"6s":p==="Muse AI"?"5s":"8s",ratio:p==="Grok"||p==="Muse AI"?Gt.includes(K.ratio)?K.ratio:"16:9":K.ratio==="9:16"||K.ratio==="16:9"?K.ratio:"16:9",referenceAssetIds:p==="Grok"||p==="Muse AI"?(K.referenceAssetIds||[]).slice(0,1):K.referenceAssetIds,autoUpscale:p==="Grok"||p==="Muse AI"?!1:K.autoUpscale,autoRemoveWatermark:p==="Grok"||p==="Muse AI"?!1:K.autoRemoveWatermark})';

if (vsCode.includes(oldCeGen)) {
  vsCode = vsCode.replace(oldCeGen, newCeGen);
  console.log('  ✓ Đã cập nhật hàm ce(p, K) trong bảng hàng đợi hỗ trợ Muse AI');
}

// 3.5 Cập nhật dropdown tỉ lệ khung hình (ratio) cho Muse AI trong hàng đợi
const oldRatioSelect = 'p.provider==="Grok"?Gt:Hs(A,p.model,p.mode==="Frames"?"Frames":p.referenceAssetIds?.length?"R2V":"T2V",p.duration).map(N=>N.id)';
const newRatioSelect = 'p.provider==="Grok"||p.provider==="Muse AI"?Gt:Hs(A,p.model,p.mode==="Frames"?"Frames":p.referenceAssetIds?.length?"R2V":"T2V",p.duration).map(N=>N.id)';

if (vsCode.includes(oldRatioSelect)) {
  vsCode = vsCode.replace(oldRatioSelect, newRatioSelect);
  console.log('  ✓ Đã cập nhật chọn tỉ lệ khung hình (Gt) cho Muse AI');
}

// 3.6 Cập nhật dropdown thời lượng (duration) cho Muse AI trong hàng đợi
const oldDurationSelect = 'p.provider==="Veo3"&&fo(A,p.model)?Os(A,p.model,p.mode==="Frames"?"Frames":"T2V").map(N=>N.id):Fs(p.model)';
const newDurationSelect = 'p.provider==="Muse AI"?["5s","10s","15s"]:p.provider==="Veo3"&&fo(A,p.model)?Os(A,p.model,p.mode==="Frames"?"Frames":"T2V").map(N=>N.id):Fs(p.model)';

if (vsCode.includes(oldDurationSelect)) {
  vsCode = vsCode.replace(oldDurationSelect, newDurationSelect);
  console.log('  ✓ Đã cập nhật chọn thời lượng cho Muse AI');
}

// 3.7 Cập nhật hiển thị credit cho Muse AI (Miễn phí / gói tài khoản)
const oldCredits = 'o.provider==="Grok"?m("videoStudio.noCreditsRequired")';
const newCredits = 'o.provider==="Grok"||o.provider==="Muse AI"?m("videoStudio.noCreditsRequired")';

if (vsCode.includes(oldCredits)) {
  vsCode = vsCode.replace(oldCredits, newCredits);
  console.log('  ✓ Đã thiết lập Muse AI không trừ credit');
}

// 3.8 Cập nhật trạng thái sẵn sàng (Readiness State) cho Muse AI
const oldReadiness = 'Ye=Se?.provider==="Veo3"&&Se.account==="Auto",Be=Se?.provider==="Grok"&&Se.account==="Auto",';
const newReadiness = 'Ye=Se?.provider==="Veo3"&&Se.account==="Auto",Be=Se?.provider==="Grok"&&Se.account==="Auto",Me_muse=(Se?.provider==="Muse AI"||Se?.provider==="muse ai")&&Se.account==="Auto",';

if (vsCode.includes(oldReadiness)) {
  vsCode = vsCode.replace(oldReadiness, newReadiness);
  console.log('  ✓ Đã thêm Me_muse vào trạng thái kiểm tra sẵn sàng');
}

const oldKt = 'Kt=Ye||Be?(Be?Ie.length:Ce.length)>0?{text:"text-green",dot:"bg-green"}:{text:"text-yellow",dot:"bg-yellow"}:{text:"text-blue",dot:"bg-blue"}';
const newKt = 'Kt=Ye||Be||Me_muse?((Be?Ie.length:Me_muse?activeMuseAccounts.length:Ce.length)>0?{text:"text-green",dot:"bg-green"}:{text:"text-yellow",dot:"bg-yellow"}):{text:"text-blue",dot:"bg-blue"}';

if (vsCode.includes(oldKt)) {
  vsCode = vsCode.replace(oldKt, newKt);
  console.log('  ✓ Đã cập nhật đèn báo trạng thái tài khoản cho Muse AI');
}

// 3.9 Cập nhật xử lý chạy hàng đợi video (St) cho Muse AI
const oldStProviders = 'const ee=Array.from(new Set(C.filter(v=>v.provider!=="Veo3"&&v.provider!=="Grok").map(v=>v.provider))),ae=C.filter(v=>v.provider==="Veo3"||v.provider==="Grok");';
const newStProviders = 'const ee=Array.from(new Set(C.filter(v=>v.provider!=="Veo3"&&v.provider!=="Grok"&&v.provider!=="Muse AI"&&v.provider!=="muse ai").map(v=>v.provider))),ae=C.filter(v=>v.provider==="Veo3"||v.provider==="Grok"||v.provider==="Muse AI"||v.provider==="muse ai");';

if (vsCode.includes(oldStProviders)) {
  vsCode = vsCode.replace(oldStProviders, newStProviders);
  console.log('  ✓ Đã cho phép Muse AI trong bộ lọc hàng đợi thực thi St');
}

const oldStAccountCheck = 'const i=ae.some(v=>v.provider==="Veo3"),a=ae.some(v=>v.provider==="Grok");if(i&&Ce.length===0){z.warning(t("videoStudio.noVeoAccountInBrowserHub"));return}if(a&&Ie.length===0){z.warning(t("videoStudio.noGrokAccountInBrowserHub"));return}';
const newStAccountCheck = 'const i=ae.some(v=>v.provider==="Veo3"),a=ae.some(v=>v.provider==="Grok"),m_muse=ae.some(v=>v.provider==="Muse AI"||v.provider==="muse ai");if(i&&Ce.length===0){z.warning(t("videoStudio.noVeoAccountInBrowserHub"));return}if(a&&Ie.length===0){z.warning(t("videoStudio.noGrokAccountInBrowserHub"));return}if(m_muse&&activeMuseAccounts.length===0){z.warning("Chưa có tài khoản Muse AI nào sẵn sàng trong Browser Hub! Vui lòng đăng nhập tài khoản Muse AI.");return}';

if (vsCode.includes(oldStAccountCheck)) {
  vsCode = vsCode.replace(oldStAccountCheck, newStAccountCheck);
  console.log('  ✓ Đã thêm xác thực tài khoản Muse AI trước khi chạy');
}

// 3.10 Tạo job Video cho Muse AI trong vòng lặp ae
const oldLoopGrok = 'if(v.provider==="Grok"){';
const newLoopMuseAndGrok = `if(v.provider==="Muse AI"||v.provider==="muse ai"){const ot=museAccounts.find(C=>[C.accountName,C.accountDisplayName,C.accountEmail,Tt(C)].includes(v.account));if(v.account!=="Auto"&&!ot){d.push(\`\${v.account} chưa sẵn sàng\`);continue}const acc=ot||activeMuseAccounts[0];if(!acc){d.push("Không tìm thấy tài khoản Muse AI khả dụng");continue}for(let Pt=0;Pt<v.count;Pt+=1)b.push({promptId:v.id,input:{title:v.prompt,type:"Video",providerId:acc.providerId||"muse",provider:"Muse AI",accountId:acc.accountId,account:Tt(acc),payload:{promptId:v.id,prompt:v.prompt,ratio:v.ratio||"16:9",mode:"Components",duration:v.duration||"5s",model:"muse-video",outputIndex:Pt,batchSize:v.count,generationRunId:c,generationRunCreatedAt:h,promptOrder:v.index,batchIndex:Pt,account:v.account,accountSelection:ot?"manual":"auto",referenceAssetIds:ie.slice(0,1),resolutionName:"720p",preset:"custom",studioSource:"video-studio",autoMerge:f}}});continue}if(v.provider==="Grok"){`;

if (vsCode.includes(oldLoopGrok) && !vsCode.includes('v.provider==="Muse AI"||v.provider==="muse ai"')) {
  vsCode = vsCode.replace(oldLoopGrok, newLoopMuseAndGrok);
  console.log('  ✓ Đã gắn logic dispatch job video cho Muse AI');
}

fs.writeFileSync(vsPath, vsCode, 'utf8');

// ============================================================================
// 4. PATCH app/out/main/index.js (Backend Runner Automation cho Muse AI)
// ============================================================================
console.log('\n[4/4] Đang cập nhật app/out/main/index.js...');
let mainCode = fs.readFileSync(mainPath, 'utf8');

// 4.1 Cập nhật dm.prototype.get để tìm thấy MuseVideoRuntime
const oldDmGet = 'get(e,t){const A=this.runtimes.get(e)||[];return t?A.find(o=>o.supports(t))||null:A[0]||null}';
const newDmGet = 'get(e,t){let A=this.runtimes.get(e)||[];if((!A||A.length===0)&&t==="Video"){const muse=this.runtimes.get("muse")?.[0];if(muse)return muse}return t?A.find(o=>o.supports(t))||null:A[0]||null}';

if (mainCode.includes(oldDmGet)) {
  mainCode = mainCode.replace(oldDmGet, newDmGet);
  console.log('  ✓ Đã cập nhật bộ điều phối runtime dm.prototype.get hỗ trợ Muse AI');
}

// 4.2 Đặt class MuseVideoRuntime ở TOP-LEVEL (ngay trước class Ys)
const museRuntimeClassDefinition = `
class MuseVideoRuntime {
  constructor(getSession, assets, browserViewManager) {
    this.getSession = getSession;
    this.assets = assets;
    this.browserViewManager = browserViewManager;
  }
  providerId = "muse";
  supports(type) {
    return type === "Video";
  }
  async validateJob(job) {
    if (!this.supports(job.type)) throw new Error("Muse AI video runtime chỉ hỗ trợ Video jobs");
    if (!job.accountId) throw new Error("Vui lòng chọn tài khoản Muse AI cho job video này");
    const prompt = job.input?.payload?.prompt || job.payload?.prompt || job.title;
    if (!prompt || !prompt.trim()) throw new Error("Job video Muse AI cần có nội dung prompt");
  }
  async runJob(job, tracker) {
    await this.validateJob(job);
    const session = this.getSession(job.accountId);
    if (!session) throw new Error("Không tìm thấy phiên trình duyệt cho tài khoản: " + job.accountId);
    if (session.authStatus !== "Logged In") {
      throw new Error("Vui lòng đăng nhập tài khoản Muse AI trước trong Browser Hub");
    }

    const prompt = job.input?.payload?.prompt || job.payload?.prompt || job.title;
    tracker.updateProgress(10, "Đang kết nối phiên Muse AI trong Browser Hub...");

    const viewInfo = this.browserViewManager.getOrCreateView(session);
    const wc = viewInfo?.view?.webContents;
    if (!wc || wc.isDestroyed()) throw new Error("Trình duyệt Muse AI chưa sẵn sàng");

    let curUrl = wc.getURL();
    if (!curUrl || !curUrl.includes("muse.ai")) {
      tracker.updateProgress(15, "Đang truy cập trang Muse AI...");
      await this.browserViewManager.loadUrl(viewInfo, "https://muse.ai/");
      await new Promise(r => setTimeout(r, 2500));
    }

    tracker.updateProgress(25, "Đang gửi prompt vào chat Muse AI...");
    const sendResult = await wc.executeJavaScript(\`
      (async () => {
        try {
          const text = \${JSON.stringify(prompt)};
          
          const fireEvents = (el) => {
            el.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
            el.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
          };
          
          let el = document.querySelector('textarea, div[contenteditable="true"], [role="textbox"], input[type="text"]');
          if (!el) {
            el = document.querySelector('[placeholder*="Message"], [placeholder*="Chat"], [placeholder*="Ask"], [placeholder*="Tell"]');
          }
          if (!el) return { success: false, error: 'Không tìm thấy khung nhập chat trên Muse AI' };
          
          el.focus();
          if (el.isContentEditable) {
            document.execCommand('selectAll', false, null);
            document.execCommand('insertText', false, text);
            fireEvents(el);
          } else {
            const proto = Object.getPrototypeOf(el);
            const valSetter = Object.getOwnPropertyDescriptor(proto, 'value')?.set || Object.getOwnPropertyDescriptor(el, 'value')?.set;
            if (valSetter) {
              valSetter.call(el, text);
            } else {
              el.value = text;
            }
            fireEvents(el);
          }
          
          await new Promise(r => setTimeout(r, 600));
          
          let btn = document.querySelector('button[type="submit"], button[aria-label*="Send"], button[aria-label*="Gửi"]');
          if (!btn) {
            const form = el.closest('form, div');
            if (form) {
              const allBtns = Array.from(form.querySelectorAll('button')).filter(b => !b.disabled && b.offsetWidth > 0);
              if (allBtns.length > 0) btn = allBtns[allBtns.length - 1];
            }
          }
          
          if (btn) {
            btn.click();
          } else {
            el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
            el.dispatchEvent(new KeyboardEvent('keypress', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
            el.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
          }
          
          return { success: true, timestamp: Date.now() };
        } catch (e) {
          return { success: false, error: e.message };
        }
      })()
    \`, true);

    if (!sendResult?.success) {
      throw new Error(sendResult?.error || "Không thể gửi prompt vào Muse AI");
    }

    tracker.updateProgress(40, "Muse AI đang tạo video...");

    const startTime = Date.now();
    const timeoutMs = 5 * 60 * 1000;

    while (Date.now() - startTime < timeoutMs) {
      if (tracker.signal?.aborted) throw new Error("Tác vụ đã bị người dùng hủy");

      const elapsed = Math.round((Date.now() - startTime) / 1000);
      const curPct = Math.min(92, 40 + Math.floor(elapsed / 2.5));
      tracker.updateProgress(curPct, "Muse AI đang dựng video (" + elapsed + "s)...");

      const probe = await wc.executeJavaScript(\`
        (async () => {
          try {
            const videos = Array.from(document.querySelectorAll('video'));
            for (let i = videos.length - 1; i >= 0; i--) {
              const v = videos[i];
              const src = v.src || v.currentSrc || v.querySelector('source')?.src;
              if (src && (src.startsWith('http') || src.startsWith('blob:') || src.startsWith('data:'))) {
                return { found: true, src: src, duration: v.duration || 5 };
              }
            }
            
            const mp4s = Array.from(document.querySelectorAll('a[href*=".mp4"], a[download]'));
            if (mp4s.length > 0) {
              const last = mp4s[mp4s.length - 1];
              if (last.href) return { found: true, src: last.href, duration: 5 };
            }
            
            return { found: false };
          } catch (e) {
            return { found: false, error: e.message };
          }
        })()
      \`, true);

      if (probe?.found && probe.src) {
        tracker.updateProgress(94, "Đang trích xuất video từ Muse AI...");
        let videoBytes = null;
        try {
          const fetchRes = await wc.executeJavaScript(\`
            (async () => {
              try {
                const r = await fetch(\${JSON.stringify(probe.src)});
                const ab = await r.arrayBuffer();
                let b = '';
                const u8 = new Uint8Array(ab);
                const l = u8.byteLength;
                for (let i = 0; i < l; i++) {
                  b += String.fromCharCode(u8[i]);
                }
                return { ok: true, data: btoa(b) };
              } catch (e) {
                return { ok: false, error: e.message };
              }
            })()
          \`, true);
          if (fetchRes?.ok && fetchRes.data) {
            videoBytes = Buffer.from(fetchRes.data, 'base64');
          }
        } catch (e) {
          console.warn("[MuseRuntime] in-page video fetch failed:", e);
        }

        if (!videoBytes && probe.src.startsWith('http')) {
          try {
            const resp = await fetch(probe.src);
            const ab = await resp.arrayBuffer();
            videoBytes = Buffer.from(ab);
          } catch (e) {}
        }

        if (videoBytes && videoBytes.length > 0) {
          tracker.updateProgress(97, "Đang lưu video vào Thư viện...");
          const cachedAsset = await this.assets.cacheGeneratedVideoBytes(job, {
            bytes: videoBytes,
            mimeType: "video/mp4",
            remoteUrl: probe.src,
            providerAssetId: "muse-" + Date.now()
          });
          tracker.updateProgress(100, "Tạo video Muse AI hoàn tất!");
          return {
            assets: [cachedAsset],
            provider: {
              operationId: "muse-" + Date.now(),
              raw: {
                model: "muse-video",
                prompt: prompt,
                remoteUrl: probe.src,
                accountId: session.accountId
              }
            }
          };
        }
      }

      await new Promise(r => setTimeout(r, 3000));
    }

    throw new Error("Quá thời gian chờ tạo video trên Muse AI (5 phút). Vui lòng kiểm tra lại phiên Muse AI trong Browser Hub.");
  }
}
`;

// Chèn class MuseVideoRuntime vào ngay trước class Ys ở top-level
const targetClassAnchor = 'class Ys{constructor(e){if(this.concurrency=e';
if (mainCode.includes(targetClassAnchor) && !mainCode.includes('class MuseVideoRuntime')) {
  mainCode = mainCode.replace(targetClassAnchor, museRuntimeClassDefinition + '\n' + targetClassAnchor);
  console.log('  ✓ Đã khai báo class MuseVideoRuntime ở top-level (ngang hàng class Ys)');
}

// 4.3 Đăng ký runtime vào dt
const targetRegisterAnchor = 'dt.register(new Hw(d=>T.findSession(d),Uo,V,async(d,l,m)=>{await Fi(d,l,m)},d=>l=>W.fetchInAutomationPage(d,l))),';
const targetRegisterCode = 'dt.register(new MuseVideoRuntime(d=>T.findSession(d),V,W)),';

if (mainCode.includes(targetRegisterAnchor) && !mainCode.includes('new MuseVideoRuntime')) {
  mainCode = mainCode.replace(targetRegisterAnchor, targetRegisterAnchor + targetRegisterCode);
  console.log('  ✓ Đã đăng ký new MuseVideoRuntime vào bộ điều phối dt');
}

fs.writeFileSync(mainPath, mainCode, 'utf8');

// ============================================================================
// 5. VALIDATE SYNTAX TẤT CẢ FILE ĐÃ SỬA
// ============================================================================
console.log('\n[5/5] Kiểm tra cú pháp (Syntax Validation)...');
try {
  execSync(`node --check "${indexPath}"`, { stdio: 'inherit' });
  console.log('  ✅ index-BS7vgKVV.js cú pháp 100% hợp lệ');
  execSync(`node --check "${iconPath}"`, { stdio: 'inherit' });
  console.log('  ✅ ProviderIcon-BR50w6N5.js cú pháp 100% hợp lệ');
  execSync(`node --check "${vsPath}"`, { stdio: 'inherit' });
  console.log('  ✅ VideoStudio-frcr8V6s.js cú pháp 100% hợp lệ');
  execSync(`node --check "${mainPath}"`, { stdio: 'inherit' });
  console.log('  ✅ main/index.js cú pháp 100% hợp lệ');
} catch (err) {
  console.error('❌ Lỗi cú pháp:', err.message);
  process.exit(1);
}

console.log('\n🎉 HOÀN TẤT BẢN VÁ MUSE AI CHO STUDIO VIDEO AI THÀNH CÔNG 100%!');
