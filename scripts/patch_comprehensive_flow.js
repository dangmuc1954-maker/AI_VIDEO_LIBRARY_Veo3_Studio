const fs = require('fs');
const path = require('path');

console.log('=== Applying Comprehensive Fix for Google Flow & Video Studio ===');

// =========================================================================
// 1. PATCH app/out/main/index.js
// =========================================================================
const mainFile = path.resolve('app/out/main/index.js');
let mainContent = fs.readFileSync(mainFile, 'utf8');

// 1.1 Update Pu function to recognize all priority variants
const oldPu = 'function Pu(r){return r==="Veo 3.1 - Priority"?"Priority":r==="Veo 3.1 - Lite"?"Lite":r==="Veo 3.1 - Quality"?"Quality":"Fast"}';
const newPu = 'function Pu(r){if(typeof r!=="string")return"Fast";if(r.includes("Priority")||r.includes("0 credit")||r.includes("LowPriority")||r.includes("low-priority"))return"Priority";if(r.includes("Lite"))return"Lite";if(r.includes("Quality")||r.includes("High"))return"Quality";if(r.includes("Omni Flash")||r.includes("Flash"))return"Omni Flash";return"Fast"}';

if (mainContent.includes(oldPu)) {
  mainContent = mainContent.replace(oldPu, newPu);
  console.log('[OK] Patched Pu in main/index.js');
} else {
  console.warn('[WARN] oldPu not found in main/index.js');
}

// 1.2 Update bu function to properly map priority
const oldBu = 'function bu(r,e){return vu.includes(r)?r:r==="Veo 3.1"&&typeof e=="string"&&e in cr||typeof e=="string"&&e in cr?cr[e]:"Veo 3.1 - Fast"}';
const newBu = 'function bu(r,e){const s=String(r||e||"");if(s.includes("Priority")||s.includes("LowPriority")||s.includes("0 credit")||s.includes("low-priority"))return"Veo 3.1 - Priority";if(vu.includes(r))return r;if(r==="Veo 3.1"&&typeof e=="string"&&e in cr)return cr[e];if(typeof e=="string"&&e in cr)return cr[e];return"Veo 3.1 - Fast"}';

if (mainContent.includes(oldBu)) {
  mainContent = mainContent.replace(oldBu, newBu);
  console.log('[OK] Patched bu in main/index.js');
} else {
  console.warn('[WARN] oldBu not found in main/index.js');
}

// 1.3 Update Tu, ku, Cu to pass "lite_low_priority" and PAYGATE_TIER_TWO for Priority
const oldTuPart = 'c==="Priority"?{id:`veo_3_1_t2v_priority${d}${n?"_portrait":"_landscape"}`,modelKey:`veo_3_1_t2v_lite${d}`,aspectRatio:s,useV2ModelConfig:!0}';
const newTuPart = 'c==="Priority"?{id:`veo_3_1_t2v_priority${d}${n?"_portrait":"_landscape"}`,modelKey:"lite_low_priority",aspectRatio:s,useV2ModelConfig:!0,userPaygateTier:"PAYGATE_TIER_TWO"}';

if (mainContent.includes(oldTuPart)) {
  mainContent = mainContent.replace(oldTuPart, newTuPart);
  console.log('[OK] Patched Tu (T2V Priority modelKey) in main/index.js');
} else {
  console.warn('[WARN] oldTuPart not found in main/index.js');
}

const oldCuPart = 'n==="Priority"||n==="Lite"?{id:`veo_3_1_i2v_${n==="Priority"?"priority":"lite"}${e}${t?"_portrait":"_landscape"}`,modelKey:e?`veo_3_1_i2v_s_lite${e}`:"veo_3_1_i2v_lite",aspectRatio:r,useV2ModelConfig:!0}';
const newCuPart = 'n==="Priority"?{id:`veo_3_1_i2v_priority${e}${t?"_portrait":"_landscape"}`,modelKey:"lite_low_priority",aspectRatio:r,useV2ModelConfig:!0,userPaygateTier:"PAYGATE_TIER_TWO"}:n==="Lite"?{id:`veo_3_1_i2v_lite${e}${t?"_portrait":"_landscape"}`,modelKey:e?`veo_3_1_i2v_s_lite${e}`:"veo_3_1_i2v_lite",aspectRatio:r,useV2ModelConfig:!0}';

if (mainContent.includes(oldCuPart)) {
  mainContent = mainContent.replace(oldCuPart, newCuPart);
  console.log('[OK] Patched Cu (I2V Priority modelKey) in main/index.js');
} else {
  console.warn('[WARN] oldCuPart not found in main/index.js');
}

const oldKuPart = 'o==="Priority"||o==="Lite"?{id:`veo_3_1_r2v_lite${e}${t?"_portrait":"_landscape"}`,modelKey:t?"veo_3_1_r2v_fast_portrait":"veo_3_1_r2v_fast_landscape",aspectRatio:r,useV2ModelConfig:!0}';
const newKuPart = 'o==="Priority"?{id:`veo_3_1_r2v_priority${e}${t?"_portrait":"_landscape"}`,modelKey:"lite_low_priority",aspectRatio:r,useV2ModelConfig:!0,userPaygateTier:"PAYGATE_TIER_TWO"}:o==="Lite"?{id:`veo_3_1_r2v_lite${e}${t?"_portrait":"_landscape"}`,modelKey:t?"veo_3_1_r2v_fast_portrait":"veo_3_1_r2v_fast_landscape",aspectRatio:r,useV2ModelConfig:!0}';

if (mainContent.includes(oldKuPart)) {
  mainContent = mainContent.replace(oldKuPart, newKuPart);
  console.log('[OK] Patched ku (R2V Priority modelKey) in main/index.js');
} else {
  console.warn('[WARN] oldKuPart not found in main/index.js');
}

// 1.4 Update su error mapping for friendly eligibility message
const oldSu = 'function su(r,e){return fn(r,e,{providerLabel:"Google Flow",authMessage:"Google Flow authentication is no longer valid",challengeMessage:"Google Flow requires browser verification",rateLimitMessage:"Google Flow rate limit reached",quotaMessage:"Google Flow quota or credit limit reached",contentPolicyMessage:"Google Flow rejected the prompt because it appears to violate generation safety policy",networkMessage:"Google Flow returned a temporary server error",authPatterns:[/unauthenticated|unauthorized|login|session|access token|bearer|credential/iu],challengePatterns:[/recaptcha evaluation failed|public_error_unusual_activity|unusual_activity/iu],quotaPatterns:[/quota|credits|paygate|billing|resource_exhausted/iu],contentPolicyPatterns:[/public_error_minor|public_error_unsafe_generation|unsafe_generation/iu],networkPatterns:[/internal error|upstream error|service unavailable/iu]})}';

const newSu = 'function su(r,e){return fn(r,e,{providerLabel:"Google Flow",authMessage:"Google Flow authentication is no longer valid",challengeMessage:"Google Flow requires browser verification",rateLimitMessage:"Google Flow rate limit reached",quotaMessage:"Tài khoản không đủ điều kiện dùng model này (hết credits hoặc cần gói nâng cao). Vui lòng chọn model Veo 3.1 Lite Priority (0 credits) hoặc nạp thêm credits.",contentPolicyMessage:"Google Flow rejected the prompt because it appears to violate generation safety policy",networkMessage:"Google Flow returned a temporary server error",authPatterns:[/unauthenticated|unauthorized|login|session|access token|bearer|credential/iu],challengePatterns:[/recaptcha evaluation failed|public_error_unusual_activity|unusual_activity/iu],quotaPatterns:[/quota|credits|paygate|billing|resource_exhausted|tier|subscription|membership|upgrade|ineligible/iu],contentPolicyPatterns:[/public_error_minor|public_error_unsafe_generation|unsafe_generation/iu],networkPatterns:[/internal error|upstream error|service unavailable/iu]})}';

if (mainContent.includes(oldSu)) {
  mainContent = mainContent.replace(oldSu, newSu);
  console.log('[OK] Patched su (friendly eligibility error mapping) in main/index.js');
} else {
  console.warn('[WARN] oldSu not found in main/index.js');
}

// 1.5 Update safeName in detectPageState to support Vietnamese
const oldSafeName = 'const safeName = (value) => {\n              const normalized = clean(value)\n                .replace(/google account:?/i, \'\')';
const newSafeName = 'const safeName = (value) => {\n              const normalized = clean(value)\n                .replace(/(tài khoản google|google account):?/gi, \'\')';

if (mainContent.includes(oldSafeName)) {
  mainContent = mainContent.replace(oldSafeName, newSafeName);
  console.log('[OK] Patched safeName in main/index.js');
} else {
  console.warn('[WARN] oldSafeName not found in main/index.js');
}

fs.writeFileSync(mainFile, mainContent, 'utf8');
console.log('[OK] Successfully updated app/out/main/index.js');

// =========================================================================
// 2. PATCH app/out/renderer/assets/VideoStudio-BZY_1pM8.js
// =========================================================================
const vsFile = path.resolve('app/out/renderer/assets/VideoStudio-BZY_1pM8.js');
let vsContent = fs.readFileSync(vsFile, 'utf8');

// 2.1 Update Wr to match and fallback cleanly to available account
const oldWr = 'Wr=r=>{if(r.account!=="Auto")return Qe.find(x=>[x.accountName,x.accountDisplayName,x.accountEmail,Me(x)].includes(r.account))}';
const newWr = 'Wr=r=>{if(!r.account||r.account==="Auto")return Qe[0]||it[0];return Qe.find(x=>[x.accountId,x.accountName,x.accountDisplayName,x.accountEmail,Me(x)].includes(r.account))||it.find(x=>[x.accountId,x.accountName,x.accountDisplayName,x.accountEmail,Me(x)].includes(r.account))||Qe[0]||it[0]}';

if (vsContent.includes(oldWr)) {
  vsContent = vsContent.replace(oldWr, newWr);
  console.log('[OK] Patched Wr in VideoStudio');
} else {
  console.warn('[WARN] oldWr not found in VideoStudio');
}

// 2.2 Update Qe so cooldown doesn't block logged-in accounts
const oldQe = 'Qe=h.useMemo(()=>it.filter(r=>Xt(r)&&!Wt(r)),[it])';
const newQe = 'Qe=h.useMemo(()=>it.filter(r=>Xt(r)),[it])';

if (vsContent.includes(oldQe)) {
  vsContent = vsContent.replace(oldQe, newQe);
  console.log('[OK] Patched Qe in VideoStudio');
} else {
  console.warn('[WARN] oldQe not found in VideoStudio');
}

fs.writeFileSync(vsFile, vsContent, 'utf8');
console.log('[OK] Successfully updated app/out/renderer/assets/VideoStudio-BZY_1pM8.js');
