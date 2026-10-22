import{a4 as Fe,bL as xa,bn as x,bE as F,aZ as ua,b4 as e,a as ga,m as $e,K as fe,h as A,l as Oe,d as q,Z as qe,i as ma,X as ba,T as fa,bf as Le,at as ha}from"./index-BS7vgKVV.js";import{c as ye,C as va}from"./confetti.module--UKCZzZ5.js";import{C as Ue}from"./ConfirmDialog-X_dHAoSv.js";import{r as wa}from"./licensePageRefresh-BOMbr0dg.js";import{r as ya,n as ka}from"./license-DSPJjoqg.js";import{C as ke}from"./clipboard-copy-CyQ46sXn.js";import{T as Ve}from"./timer-C8CM9WU6.js";import{S as he}from"./sparkles-DTN-KlRV.js";import{U as ja}from"./user-round-CbfR2S9T.js";import{S as Na}from"./save-C18F6TtV.js";import{P as Ca}from"./pencil-N7tNMMqy.js";import{C as je}from"./check-DASdsOdG.js";import{S as za}from"./star-xSzppIF9.js";import"./index-D4pq1Q3u.js";import"./circle-alert-D8zLJWNV.js";/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Sa=Fe("CreditCard",[["rect",{width:"20",height:"14",x:"2",y:"5",rx:"2",key:"ynyp8z"}],["line",{x1:"2",x2:"22",y1:"10",y2:"10",key:"1b3vmo"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Pa=Fe("Tag",[["path",{d:"M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z",key:"vktsd0"}],["circle",{cx:"7.5",cy:"7.5",r:".5",fill:"currentColor",key:"kqv944"}]]),Da={970423:{name:"TPBank",iconUrl:u("tpbank")},TPB:{name:"TPBank",iconUrl:u("tpbank")},TPBANK:{name:"TPBank",iconUrl:u("tpbank")},970436:{name:"Vietcombank",iconUrl:u("vietcombank")},VCB:{name:"Vietcombank",iconUrl:u("vietcombank")},VIETCOMBANK:{name:"Vietcombank",iconUrl:u("vietcombank")},970422:{name:"MBBank",iconUrl:u("mb")},MB:{name:"MBBank",iconUrl:u("mb")},MBBANK:{name:"MBBank",iconUrl:u("mb")},970415:{name:"VietinBank",iconUrl:u("vietinbank")},ICB:{name:"VietinBank",iconUrl:u("vietinbank")},VIETINBANK:{name:"VietinBank",iconUrl:u("vietinbank")},970418:{name:"BIDV",iconUrl:u("bidv")},BIDV:{name:"BIDV",iconUrl:u("bidv")},970407:{name:"Techcombank",iconUrl:u("techcombank")},TCB:{name:"Techcombank",iconUrl:u("techcombank")},TECHCOMBANK:{name:"Techcombank",iconUrl:u("techcombank")},970416:{name:"ACB",iconUrl:u("acb")},ACB:{name:"ACB",iconUrl:u("acb")},970432:{name:"VPBank",iconUrl:u("vpbank")},VPB:{name:"VPBank",iconUrl:u("vpbank")},VPBANK:{name:"VPBank",iconUrl:u("vpbank")},970405:{name:"Agribank",iconUrl:u("agribank")},AGRIBANK:{name:"Agribank",iconUrl:u("agribank")},970448:{name:"OCB",iconUrl:u("ocb")},OCB:{name:"OCB",iconUrl:u("ocb")},970403:{name:"Sacombank",iconUrl:u("sacombank")},STB:{name:"Sacombank",iconUrl:u("sacombank")},SACOMBANK:{name:"Sacombank",iconUrl:u("sacombank")}};function Ke(){ye({origin:{x:.5,y:.55},particleCount:110,spread:120,startVelocity:55,scalar:1.15,shapes:["star","circle"],colors:["#a855f7","#10b981","#fbbf24","#3b82f6","#ec4899","#6366f1"],zIndex:9999})}function Aa(){function a(t,o){return Math.random()*(o-t)+t}Ke();const i=window.setInterval(()=>{ye({particleCount:28,angle:60,spread:65,startVelocity:45,origin:{x:0,y:a(.5,.75)},colors:["#a855f7","#10b981","#fbbf24","#3b82f6","#ec4899"],shapes:["star","circle"],scalar:a(.9,1.2),zIndex:9999}),ye({particleCount:28,angle:120,spread:65,startVelocity:45,origin:{x:1,y:a(.5,.75)},colors:["#a855f7","#10b981","#fbbf24","#3b82f6","#ec4899"],shapes:["star","circle"],scalar:a(.9,1.2),zIndex:9999})},1400);return()=>window.clearInterval(i)}let Re;function dr(){const{t:a,language:i}=xa(),t=Re,[o,v]=x.useState(""),[c,w]=x.useState(t?.licenseStatus||null),[h,b]=x.useState("idle"),[B,Q]=x.useState(null),[P,We]=x.useState((t?.planOptions||[]).filter(r=>['basic','silver','gold'].includes(r.code))),[ne,se]=x.useState(t?.trialEligibility||{}),[le,ze]=x.useState(t?.selectedDurations||{}),[M,T]=x.useState(""),[Se,$]=x.useState(!1),[W,O]=x.useState(!0),[G,L]=x.useState(""),[s,C]=x.useState(t?.purchaseOrder||null),[Y,Pe]=x.useState(t?.orderHistory||[]),[ce,k]=x.useState(!1),[Ge,U]=x.useState(!1),[Ye,_e]=x.useState(!1),[Je,De]=x.useState(!1),[oe,ea]=x.useState(!0),[V,Ae]=x.useState(null),[Be,de]=x.useState(Date.now()),pe=x.useRef(null),R=x.useRef(""),xe=F(r=>r.sync),d=(r,l="info")=>{const n="license-center-feedback";if(!r){Le.dismiss(n);return}Le.show({id:n,type:l,message:r})};x.useEffect(()=>{c&&xe(c)},[c,xe]),x.useEffect(()=>{let r=!0,l;const n=()=>{const g=ha(c);g!==null&&(l=window.setTimeout(()=>{de(Date.now()),window.aiforge?.license?.getStatus().then(j=>{r&&j&&w(j)}).catch(()=>{}),n()},g))};return n(),()=>{r=!1,l!==void 0&&window.clearTimeout(l)}},[c?.devMode,c?.licenseExpiresAt,c?.valid]),x.useEffect(()=>{oe||(Re={licenseStatus:c,planOptions:P,trialEligibility:ne,selectedDurations:le,purchaseOrder:s,orderHistory:Y})},[oe,c,Y,P,s,le,ne]),x.useEffect(()=>{const r=c?.customerIdentifier?.trim();r&&(R.current=r,T(r),$(!0),O(!1),F.getState().setCustomerIdentifier(r))},[c?.customerIdentifier]),x.useEffect(()=>{let r=!1;const l=async()=>{const p=await window.aiforge?.license?.getCustomerIdentifier?.();r||!p||(R.current=p,T(p),$(!0),O(!1),F.getState().setCustomerIdentifier(p))},n=async()=>{try{const p=await window.aiforge?.license?.listPublicPlans?.();if(r||!p)return;const Pk=(p.plans||[]).filter(m=>m&&['basic','silver','gold'].includes(m.code));F.getState().syncPublicPlans(Pk);const f=Pk.map(Ma).filter(m=>m.billingOptions.length>0);We(f),ze(m=>{const y={...m};for(const E of f)y[E.code]||(y[E.code]=E.billingOptions[0]?.durationCode||"");return y});const I=f.filter(m=>m.trialEnabled&&m.trialDays),X=await Promise.allSettled(I.map(async m=>({planCode:m.code,result:await window.aiforge?.license?.checkTrialEligibility(m.code)})));if(r)return;se(X.reduce((m,y)=>(y.status==="fulfilled"&&y.value.result&&(m[y.value.planCode]=y.value.result.eligible),m),{}))}catch(p){r||d(p instanceof Error?p.message:"Unable to load license plans.","error")}},g=async()=>{try{b("checkin"),d("");const p=await wa(window.aiforge?.license);!r&&p&&w(p)}catch(p){r||d(p instanceof Error?p.message:"Unable to load license status.","error")}finally{r||b("idle")}},j=async()=>{try{const p=await window.aiforge?.license?.listPurchaseOrders?.();if(r||!p)return;Pe(Ia(p));const f=p.find(y=>y.status==="pending");f&&(new Date(f.expiresAt).getTime()>Date.now()?C(f):D({...f,status:"expired",serverTime:new Date().toISOString()}));const I=p.find(y=>y.status==="paid");if(!I)return;const X=await window.aiforge?.license?.getStatus().catch(()=>null);if(r||X?.valid)return;const m=await window.aiforge?.license?.checkPurchaseOrder(I.orderCode).catch(()=>null);if(r||!m?.licenseStatus)return;C(m),D(m),w(m.licenseStatus),k(!1),d("License restored from your paid order.","success")}catch{}};return Promise.allSettled([l(),n(),g(),j()]).finally(()=>{r||ea(!1)}),()=>{r=!0}},[]),x.useEffect(()=>{if(!s||s.status!=="pending")return;if(new Date(s.expiresAt).getTime()<=Date.now()){const l={...s,status:"expired",serverTime:new Date().toISOString()};C(null),D(l),k(!1),U(!0),d(a("license.orderExpired10m"),"warning");return}const r=window.setInterval(()=>{re(s.orderCode,!1)},5e3);return()=>window.clearInterval(r)},[s?.orderCode,s?.status,s?.expiresAt]),x.useEffect(()=>{if(!s||s.status!=="pending")return;de(Date.now());const r=window.setInterval(()=>{const l=Date.now();if(de(l),new Date(s.expiresAt).getTime()<=l){const n={...s,status:"expired",serverTime:new Date().toISOString()};C(null),D(n),k(!1),U(!0),d(a("license.orderExpired10m"),"warning")}},1e3);return()=>window.clearInterval(r)},[s?.orderCode,s?.status,s?.expiresAt]);const z=ua(c,Be),aa=!!c?.devMode?"Development":z?"Active":c?.code||"Unlicensed",Ie=s?Math.max(0,new Date(s.expiresAt).getTime()-Be):0,ue=s?Xe(s,P):"",_=qa(s?.paymentReceiver?.bankId),J=s?.status==="paid",ee=Va(s);x.useEffect(()=>{if(J&&ce){const r=Aa();return()=>r()}},[J,ce]);const H=s?.status==="pending"?s:null,Ee=Y.filter(r=>r.status==="paid"),ra=c?.plan?c.planName||Ne(c.plan,P):"No active plan",Me=K(c?.licenseExpiresAt),ia=Ha(c?.licenseExpiresAt),D=r=>{Pe(l=>{const n=l.find(p=>p.orderCode===r.orderCode)?.createdAt||r.createdAt,g={orderCode:r.orderCode,planCode:r.planCode,planName:r.planName,durationCode:r.durationCode,durationDays:r.durationDays,amount:r.amount,status:r.status,createdAt:n,updatedAt:r.serverTime},j=l.filter(p=>p.status==="paid"&&p.orderCode!==r.orderCode);return r.status==="pending"?[g,...j].slice(0,8):r.status==="paid"?[g,...j].slice(0,8):j.slice(0,8)})},ta=async()=>{b("checkin"),d("");try{const r=await window.aiforge?.license?.checkIn();r&&w(r),d("License status refreshed.","success")}catch(r){const l=await window.aiforge?.license?.getStatus().catch(()=>null);l&&w(l),d(r instanceof Error?r.message:"Unable to refresh license.","error")}finally{b("idle")}},ae=()=>{O(!0),window.setTimeout(()=>pe.current?.focus(),0)},Te=()=>{R.current&&(T(R.current),$(!0),O(!1),L(""))},ge=async(r=!1)=>{const l=Ra(M);if(l)return L(l),d(l,"error"),ae(),null;try{const n=await window.aiforge?.license?.setCustomerIdentifier(M);if(!n)throw new Error("Unable to save email or username.");if(R.current=n,T(n),$(!0),O(!1),L(""),F.getState().setCustomerIdentifier(n),r&&c?.valid){const g=await window.aiforge?.license?.checkIn().catch(()=>null);g&&w(g)}return n}catch(n){const g=n instanceof Error?n.message:"Unable to save email or username.";return L(g),d(g,"error"),ae(),null}},me=async()=>(Se&&!W?M:await ge(!1))?!0:(d("Enter and save your email or username before continuing.","error"),ae(),!1),na=async()=>{if(o.trim()&&await me()){b("activate"),d("");try{const r=await window.aiforge?.license?.activate(o.trim());r&&w(r),v(""),d("License activated.","success")}catch(r){d(r instanceof Error?r.message:"Unable to activate license.","error")}finally{b("idle")}}},sa=async r=>{if(!(!r.trialEnabled||!r.trialDays)&&await me()){b("trial"),Q(r.code),d("");try{const l=await window.aiforge?.license?.activateTrial(r.code);l&&w(l),se(n=>({...n,[r.code]:!1})),d(`${r.trialDays}-day ${r.label} trial activated.`,"success")}catch(l){const n=Za(l);Xa(l)&&se(g=>({...g,[r.code]:!1})),d(n,"error")}finally{Q(null),b("idle")}}},la=async(r,l)=>{if(await me()){Q(r),b("order"),d("");try{const n=await window.aiforge?.license?.createPurchaseOrder(r,l);n&&(C(n),D(n),k(!0),d("Payment order created. AI VIDEO LIBRARY will activate automatically after payment is detected.","success"))}catch(n){d(n instanceof Error?n.message:"Unable to create payment order.","error")}finally{Q(null),b("idle")}}},re=async(r=s?.orderCode,l=!0)=>{if(r){l&&(b("poll"),d(""));try{const n=await window.aiforge?.license?.checkPurchaseOrder(r);n&&(D(n),n.licenseStatus||n.status==="paid"?(C(n),n.licenseStatus&&w(n.licenseStatus),k(!0),d("Payment confirmed. License activated automatically.","success")):n.status==="expired"?(C(null),k(!1),U(!0),d(a("license.orderExpired10m"),"warning")):n.status==="rejected"?(C(null),k(!1),d(a("license.orderCancelledNotice"),"info")):(C(n),l&&d(a("license.pendingPayment"),"info")))}catch(n){l&&d(n instanceof Error?n.message:a("workflowStore.paymentCheckFailed"),"error")}finally{l&&b("idle")}}},ca=async()=>{if(!s)return;const r=s,l=window.aiforge?.license?.cancelPurchaseOrder;if(!l){d(a("license.serverNoCancelSupport"),"error");return}b("cancel"),d("");try{const n=await l(r.orderCode);if(!n?.ok||n.status!=="cancelled"){await re(r.orderCode,!1),n?.status!=="paid"&&d(a("license.unableCancelOrderStatus",{status:n?.status||(i==="vi"?"không xác định":"unknown")}),"warning");return}const g={...r,status:"expired",serverTime:new Date().toISOString()};C(null),D(g),k(!1),d(a("license.orderCanceledToast"),"info")}catch(n){d(n instanceof Error?n.message:a("license.unableCancelOrderGeneric"),"error")}finally{b("idle")}},be=async(r,l,n)=>{r&&(await navigator.clipboard?.writeText(r),Ae(l),d(n,"success"),setTimeout(()=>{Ae(g=>g===l?null:g)},1800))},oa=async()=>{c?.machineCode&&(await navigator.clipboard?.writeText(c.machineCode),d("Machine code copied.","success"))},da=async()=>{b("deactivate"),d("");try{const r=await window.aiforge?.license?.deactivate();r&&(w(r),xe(r)),d("License deactivated.","success")}catch(r){throw d(r instanceof Error?r.message:"Unable to deactivate license.","error"),r}finally{b("idle")}};return oe?e.jsx(ga,{title:a("license.loadingTitle"),description:a("license.loadingDesc")}):e.jsxs("div",{className:"lc-root",children:[e.jsx(Ba,{}),e.jsxs("div",{className:"lc-shell",children:[e.jsxs("header",{className:"lc-topbar",children:[e.jsxs("div",{className:"lc-brandline",children:[e.jsx("div",{className:"lc-brandmark",children:e.jsx($e,{size:22,strokeWidth:2})}),e.jsxs("div",{children:[e.jsx("h1",{className:"lc-title",children:a("license.centerTitle")}),e.jsx("p",{className:"lc-subtitle",children:a("license.centerSubtitle")})]})]}),e.jsxs("button",{className:"lc-btn lc-btn-ghost",onClick:()=>_e(r=>!r),children:[e.jsx(fe,{size:15}),e.jsx("span",{children:a("license.enterLicenseKey")})]})]}),Ye&&e.jsxs("section",{className:"lc-card lc-manual-section",children:[e.jsxs("div",{className:"lc-manual-head",children:[e.jsx(fe,{size:16}),e.jsx("span",{children:a("license.manualActivation")})]}),e.jsx("p",{className:"lc-manual-desc",children:a("license.manualActivationDesc")}),e.jsxs("div",{className:"lc-manual-row",children:[e.jsx("input",{value:o,onChange:r=>v(r.target.value),placeholder:"AFS-XXXXXX-XXXXXX-XXXXXX-XXXXXX",className:"lc-input lc-mono"}),e.jsxs("button",{className:"lc-btn lc-btn-primary",onClick:()=>void na(),disabled:h!=="idle"||!o.trim(),children:[h==="activate"?e.jsx(A,{size:14,className:"lc-spin"}):e.jsx(fe,{size:14}),a("license.activateKeyButton")]})]})]}),e.jsxs("div",{className:"lc-top-section",children:[e.jsxs("section",{className:`lc-hero ${z?"is-active":"is-idle"}`,children:[e.jsx("div",{className:"lc-hero-glow","aria-hidden":!0}),e.jsx("div",{className:"lc-hero-shield","aria-hidden":!0,children:e.jsx($e,{size:200,strokeWidth:.7})}),e.jsx("div",{className:"lc-hero-body",children:e.jsxs("div",{className:"lc-hero-content-layout",children:[e.jsxs("div",{className:"lc-hero-left",children:[e.jsxs("div",{className:"lc-hero-top",children:[e.jsxs("span",{className:`lc-eyebrow ${z?"ok":"warn"}`,children:[e.jsx("span",{className:"lc-dot"}),a(z?"license.activeLicenseBadge":"license.activationRequiredBadge")]}),e.jsx("span",{className:`lc-state-pill ${z?"ok":"warn"}`,children:aa})]}),e.jsx("h2",{className:"lc-plan-name lc-display",children:z?ra:a("license.noActivePlan")}),e.jsx("p",{className:"lc-plan-sub",children:z?`${a("license.expiresPrefix")}${ia} · ${Me}`:c?.message||a("license.choosePlanHint")}),e.jsxs("div",{className:"lc-hero-actions",children:[e.jsxs("button",{className:"lc-btn lc-btn-soft",onClick:()=>void ta(),disabled:h!=="idle",children:[h==="checkin"?e.jsx(A,{size:14,className:"lc-spin"}):e.jsx(Oe,{size:14}),a("license.refreshStatusBtn")]}),z&&c?.activationId&&e.jsx("button",{className:"lc-btn lc-btn-danger",onClick:()=>De(!0),disabled:h!=="idle",children:a("license.deactivate")})]})]}),e.jsx("div",{className:"lc-hero-right",children:e.jsxs("div",{className:"lc-meta-card",children:[e.jsx("div",{className:"lc-meta-title",children:a("license.licenseDetails")}),e.jsxs("div",{className:"lc-meta-list",children:[e.jsx(ve,{label:a("license.expires"),value:Me}),e.jsx(ve,{label:a("license.offlineAccess"),value:K(c?.offlineUntil)}),e.jsx(ve,{label:a("license.deviceCode"),value:Fa(c?.machineCode),action:c?.machineCode?e.jsx("button",{className:"lc-icon-btn",onClick:()=>void oa(),"aria-label":"Copy device code",children:e.jsx(ke,{size:13})}):void 0})]})]})})]})})]}),H&&e.jsxs("section",{className:"lc-card lc-pending-card",children:[e.jsxs("div",{className:"lc-pending-head",children:[e.jsxs("div",{className:"lc-pending-title-group",children:[e.jsx("span",{className:"lc-pending-badge",children:a("license.pendingPaymentBadge")}),e.jsx("h3",{className:"lc-pending-title",children:a("license.completePurchase")})]}),e.jsx(we,{status:"pending"})]}),e.jsxs("div",{className:"lc-pending-details",children:[e.jsxs("div",{className:"lc-pending-plan-row",children:[e.jsx("span",{className:"lc-pending-plan-name",children:Xe(H,P)}),e.jsx("span",{className:"lc-pending-plan-amount",children:S(H.amount)})]}),e.jsxs("div",{className:"lc-pending-timer",children:[e.jsx(Ve,{size:14}),e.jsxs("span",{children:[a("license.expiresInPrefix"),Ze(Ie)]})]}),e.jsxs("div",{className:"lc-pending-code-box",children:[e.jsx("span",{className:"lc-pending-code-label",children:a("license.transferContentLabel")}),e.jsx("div",{className:"lc-pending-code-value lc-mono",children:H.transferContent})]})]}),e.jsxs("div",{className:"lc-pending-actions",children:[e.jsx("button",{className:"lc-btn lc-btn-accent",onClick:()=>k(!0),children:a("license.resumePayment")}),e.jsxs("button",{className:"lc-btn lc-btn-soft",onClick:()=>void re(H.orderCode),disabled:h!=="idle",children:[h==="poll"?e.jsx(A,{size:13,className:"lc-spin"}):null,a("license.iHavePaid")]}),e.jsxs("button",{className:"lc-btn lc-btn-danger",onClick:ca,disabled:h!=="idle",children:[h==="cancel"?e.jsx(A,{size:13,className:"lc-spin"}):null,a("license.cancelOrder")]})]})]})]}),e.jsxs("section",{className:"lc-card lc-plans-section",children:[e.jsxs("div",{className:"lc-plans-header-row",children:[e.jsxs("div",{children:[e.jsxs("div",{className:"lc-plans-title",children:[e.jsx(he,{size:18}),e.jsx("h2",{children:a("license.choosePlanTitle")})]}),e.jsx("p",{className:"lc-plans-subtitle",children:a("license.choosePlanSubtitle")})]}),e.jsxs("div",{className:"lc-customer-input-wrapper",onBlur:r=>{r.currentTarget.contains(r.relatedTarget)||Te()},children:[e.jsxs("div",{className:`lc-customer-input-row ${G?"has-error":""}`,children:[e.jsxs("span",{className:"lc-customer-input-label",children:[e.jsx(ja,{size:12,"aria-hidden":!0}),a("license.account")]}),e.jsx("input",{ref:pe,id:"license-customer-identifier",value:M,onChange:r=>{T(r.target.value),$(!1),L("")},onKeyDown:r=>{r.key==="Escape"?(r.preventDefault(),Te(),pe.current?.blur()):r.key==="Enter"&&(r.preventDefault(),ge(!0))},placeholder:a("license.accountPlaceholder"),className:"lc-input",disabled:!W,"aria-invalid":!!G,"aria-label":"Email or username for license support"}),Se&&!W&&e.jsxs("span",{className:"lc-identity-saved-pill",title:a("license.accountSavedHint"),children:[e.jsx(q,{size:11})," ",a("license.saved")]}),W?e.jsxs("button",{type:"button",className:"lc-identity-action is-save",onClick:()=>void ge(!0),disabled:!M.trim(),children:[e.jsx(Na,{size:12})," ",a("license.save")]}):e.jsxs("button",{type:"button",className:"lc-identity-action",onClick:ae,children:[e.jsx(Ca,{size:12})," ",a("license.edit")]})]}),G&&e.jsx("p",{className:"lc-identity-error",role:"alert",children:G})]})]}),e.jsxs("div",{className:"lc-plans-grid",children:[P.filter(r=>['basic','silver','gold'].includes(r.code)).map(r=>{const l=le[r.code]||r.billingOptions[0]?.durationCode||"",n=r.billingOptions.find(N=>N.durationCode===l),g=h==="order"&&B===r.code,j=!!(z&&c?.plan===r.code),p=Ua(r,n,Y,s),f=Qe(n,p,r.allowPromotion),I=n?La(n,i==="vi"):i==="vi"?"thời hạn":"duration",X=j?a("license.extendPlan",{label:r.label}):a("license.buyPlan",{label:r.label}),m=ya(r,i),y=r.icon,E=!!(r.trialEnabled&&r.trialDays&&!z&&ne[r.code]===!0),pa=[{capability:"upscale_image",label:a("license.featureUpscaleImage")},{capability:"upscale_video",label:a("license.featureUpscaleVideo")},{capability:"remove_watermark_image",label:a("license.featureRemoveWatermarkImage")},{capability:"remove_watermark_video",label:a("license.featureRemoveWatermarkVideo")}];return e.jsxs("div",{className:`lc-plan-card ${r.recommended?"is-featured":""} ${j?"is-current":""} ${r.recommended||f?"has-corner-badges":""}`,style:{"--accent":r.accent},children:[(r.recommended||f)&&e.jsx("div",{className:"lc-plan-corner-badges","aria-label":a("license.planHighlights"),children:f?e.jsxs("span",{className:"lc-discount-corner-badge",children:[e.jsx(qe,{size:9.5,strokeWidth:3,className:"lc-discount-badge-icon"}),a("license.savePercent",{percent:f.percent})]}):e.jsx("span",{className:"lc-featured-badge",children:a("license.recommended")})}),e.jsxs("div",{className:"lc-plan-card-header",children:[e.jsx("div",{className:"lc-plan-icon-container",children:e.jsx(y,{size:20,strokeWidth:2.5})}),e.jsxs("div",{className:"lc-plan-heading-copy",children:[e.jsx("div",{className:"lc-plan-heading-meta",children:e.jsx("span",{className:"lc-plan-badge-tag",children:r.badge})}),e.jsxs("div",{className:"lc-plan-name-row",children:[e.jsx("h4",{className:"lc-plan-card-name",children:r.label}),j&&e.jsxs("span",{className:"lc-current-chip",title:a("license.activeOnDevice"),"aria-label":a("license.activeOnDevice"),children:[e.jsx(q,{size:10,strokeWidth:2.6}),a("license.currentPlanBadge")]})]})]})]}),m.description&&e.jsx("p",{className:"lc-plan-description",children:m.description}),e.jsxs("div",{className:"lc-plan-card-pricing",children:[e.jsxs("div",{className:"lc-plan-current-row",children:[e.jsx("span",{className:"lc-plan-card-price lc-display",children:S(p)}),e.jsxs("span",{className:"lc-plan-card-duration",children:["/ ",I]})]}),e.jsx("div",{className:`lc-plan-price-meta ${f?"":"is-empty"}`,"aria-hidden":!f,children:f?e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"lc-plan-original-price",children:S(f.originalPriceVnd)}),e.jsx("span",{className:"lc-plan-savings",children:a("license.saveSavings",{amount:S(f.savings)})})]}):e.jsx("span",{children:" "})})]}),e.jsx("div",{className:"lc-duration-options","aria-label":a("license.billingDuration",{plan:r.label}),children:r.billingOptions.map(N=>{const ie=N.durationCode===l;return e.jsx("button",{type:"button",className:`lc-duration-chip ${ie?"is-selected":""}`,onClick:()=>ze(Z=>({...Z,[r.code]:N.durationCode})),"aria-pressed":ie,children:Ce(N)},N.durationCode)})}),e.jsxs("div",{className:"lc-plan-card-features",children:[e.jsxs("div",{className:"lc-plan-feature-group",children:[e.jsx("div",{className:"lc-plan-feature-group-label",children:a("license.includedFeatures")}),m.features.map(N=>e.jsxs("div",{className:"lc-plan-feature-item",children:[e.jsx(q,{size:14,className:"lc-feature-icon"}),e.jsx("span",{children:N})]},N))]}),e.jsxs("div",{className:"lc-plan-feature-group lc-plan-feature-group-premium",children:[e.jsx("div",{className:"lc-plan-feature-group-label",children:a("license.premiumTools")}),pa.map(({capability:N,label:ie})=>{const Z=r.capabilities.includes(N);return e.jsxs("div",{className:`lc-plan-feature-item ${Z?"":"is-disabled"}`,"aria-disabled":!Z,children:[Z?e.jsx(q,{size:14,className:"lc-feature-icon"}):e.jsx(ma,{size:13,className:"lc-feature-lock"}),e.jsx("span",{children:ie})]},N)})]})]}),e.jsx(Ea,{plan:r}),e.jsxs("div",{className:`lc-plan-card-actions ${E?"has-trial":""}`,children:[E&&r.trialDays&&e.jsxs("button",{type:"button",className:"lc-btn lc-plan-trial-cta",onClick:()=>void sa(r),disabled:h!=="idle","aria-label":`${a("license.freeTrialDays",{days:r.trialDays})}${r.trialOncePerMachine?a("license.oncePerDevice"):""}`,children:[h==="trial"&&B===r.code?e.jsx(A,{size:14,className:"lc-spin"}):e.jsx(he,{size:14}),e.jsx("span",{children:a("license.tryFreeDays",{days:r.trialDays})}),r.trialOncePerMachine&&e.jsx("span",{className:"lc-plan-trial-limit",children:a("license.oncePerDeviceShort")})]}),e.jsxs("button",{className:`lc-btn lc-plan-card-cta ${r.recommended?"lc-btn-primary":j?"lc-btn-current":"lc-btn-plan"}`,onClick:()=>n&&void la(r.code,n.durationCode),disabled:h!=="idle"||!n,children:[g?e.jsx(A,{size:14,className:"lc-spin"}):e.jsx(Sa,{size:14}),X]})]})]},r.code)}),P.length===0&&e.jsx("div",{className:"lc-plans-empty",children:a("license.noPurchasablePlans")})]})]}),e.jsxs("section",{className:"lc-card lc-activity-section",children:[e.jsx("div",{className:"lc-card-head",children:e.jsxs("div",{children:[e.jsx("h3",{className:"lc-card-title",children:a("license.transactionHistory")}),e.jsx("p",{className:"lc-card-sub",children:a("license.transactionHistorySub")})]})}),e.jsxs("div",{className:"lc-table",children:[e.jsxs("div",{className:"lc-table-head",children:[e.jsx("span",{children:a("license.orderId")}),e.jsx("span",{children:a("license.licensePlan")}),e.jsx("span",{children:a("license.paidAmount")}),e.jsx("span",{children:a("license.status")}),e.jsx("span",{children:a("license.dateCreated")})]}),Ee.length>0?e.jsx("div",{className:"lc-table-body",children:Ee.map(r=>e.jsxs("div",{className:"lc-table-row",children:[e.jsx("span",{className:"lc-mono lc-col-strong",children:r.orderCode}),e.jsx("span",{className:"lc-col-strong",children:Oa(r,P)}),e.jsx("span",{children:S(r.amount)}),e.jsx("span",{children:e.jsx(we,{status:r.status})}),e.jsx("span",{className:"lc-col-dim",children:K(r.createdAt)})]},r.orderCode))}):e.jsx("div",{className:"lc-table-empty",children:a("license.noTransactionHistory")})]})]})]}),ce&&s&&e.jsx("div",{className:"lc-overlay",onClick:()=>k(!1),children:e.jsxs("div",{className:"lc-modal",onClick:r=>r.stopPropagation(),children:[e.jsxs("div",{className:"lc-modal-head",children:[e.jsxs("div",{className:"lc-modal-head-left",children:[J?e.jsxs("span",{className:"lc-modal-badge-paid",children:[e.jsx(je,{size:12,strokeWidth:3})," ",a("license.activatedBadge")]}):e.jsx("span",{className:"lc-modal-amount lc-display",children:S(s.amount)}),e.jsxs("h3",{className:"lc-modal-title",children:[a("license.planPrefix")," ",ue]})]}),e.jsx("button",{className:"lc-icon-btn lg",onClick:()=>k(!1),"aria-label":"Close payment popup",children:e.jsx(ba,{size:17})})]}),J?e.jsxs("div",{className:"lc-modal-success",children:[e.jsxs("div",{className:"lc-success-hero",children:[e.jsxs("div",{className:"lc-success-icon-wrap",onClick:Ke,title:a("license.celebrateTitle"),style:{cursor:"pointer"},children:[e.jsx("div",{className:"lc-success-halo"}),e.jsx("div",{className:"lc-success-pulse-ring"}),e.jsx("div",{className:"lc-success-icon",children:e.jsx(q,{size:44,strokeWidth:2.5})})]}),e.jsx("h3",{className:"lc-success-title",children:a("license.paymentSuccessTitle")}),e.jsx("p",{className:"lc-success-subtitle",children:a("license.planActivatedSuccessSubtitle",{plan:ue})})]}),e.jsxs("div",{className:"lc-success-card",children:[e.jsxs("div",{className:"lc-success-row",children:[e.jsx("span",{className:"lc-success-lbl",children:a("license.orderId")}),e.jsx("span",{className:"lc-mono lc-success-val",children:s.orderCode})]}),e.jsxs("div",{className:"lc-success-row",children:[e.jsx("span",{className:"lc-success-lbl",children:a("license.licensePlan")}),e.jsx("span",{className:"lc-success-val lc-success-plan-name",children:ue})]}),e.jsxs("div",{className:"lc-success-row",children:[e.jsx("span",{className:"lc-success-lbl",children:a("license.activationTime")}),e.jsx("span",{className:"lc-success-val",children:K("paidAt"in s&&s.paidAt||s.createdAt||new Date().toISOString())})]}),e.jsxs("div",{className:"lc-success-row",children:[e.jsx("span",{className:"lc-success-lbl",children:a("license.planDuration")}),e.jsx("span",{className:"lc-success-val",children:s.durationDays?a("license.daysUnit",{days:s.durationDays}):a("license.daysUnit",{days:30})})]}),c?.licenseExpiresAt&&e.jsxs("div",{className:"lc-success-row",children:[e.jsx("span",{className:"lc-success-lbl",children:a("license.licenseExpiration")}),e.jsx("span",{className:"lc-success-val",children:K(c.licenseExpiresAt)})]}),e.jsxs("div",{className:"lc-success-row",children:[e.jsx("span",{className:"lc-success-lbl",children:a("license.paidAmount")}),e.jsx("span",{className:"lc-success-val lc-success-amount",children:S(s.amount)})]})]}),e.jsxs("button",{type:"button",className:"lc-btn-success-cta",onClick:()=>k(!1),children:[e.jsx(he,{size:16}),a("license.startUsingNow")]})]}):e.jsxs("div",{className:"lc-modal-body",children:[ee&&e.jsxs("div",{className:"lc-payment-summary","aria-label":"Discount summary",children:[e.jsxs("div",{className:"lc-summary-left",children:[e.jsx(Pa,{size:13,className:"lc-summary-icon"}),e.jsxs("span",{children:[a("license.listPrice"),": ",e.jsx("strong",{children:S(ee.originalPriceVnd)})]})]}),e.jsxs("div",{className:"lc-summary-right",children:[e.jsx("span",{className:"lc-summary-badge",children:a("license.savePercent",{percent:ee.percent})}),e.jsxs("span",{className:"lc-summary-saving",children:["−",S(ee.savings)]})]})]}),e.jsxs("div",{className:`lc-pay-status ${s.status==="pending"?"pending":"failed"}`,children:[e.jsxs("div",{className:"lc-pay-status-left",children:[e.jsx("div",{className:"lc-pay-status-icon",children:e.jsx(Ve,{size:17})}),e.jsxs("div",{children:[e.jsx("div",{className:"lc-pay-status-label",children:a("license.paymentStatus")}),e.jsxs("div",{className:"lc-pay-status-value",children:[e.jsx(we,{status:s.status}),s.status==="pending"?e.jsxs("span",{className:"lc-status-pending-wrap",children:[e.jsx("span",{className:"lc-live-pulse","aria-hidden":"true"}),e.jsx("span",{className:"lc-mono lc-countdown",children:Ze(Ie)})]}):e.jsx("span",{children:a("license.orderNoLongerValid")})]})]})]}),s.status==="pending"?e.jsxs("button",{className:"lc-btn lc-btn-accent",onClick:()=>void re(),disabled:h!=="idle",children:[h==="poll"?e.jsx(A,{size:14,className:"lc-spin"}):e.jsx(Oe,{size:14}),a("license.iHavePaid")]}):e.jsx("button",{className:"lc-btn lc-btn-soft",onClick:()=>k(!1),children:a("common.close")})]}),e.jsx("div",{className:"lc-qr-wrap",children:s.paymentReceiver?.qrImageUrl?e.jsxs("div",{className:"lc-qr",children:[e.jsx("span",{className:"lc-scanner-corner tl"}),e.jsx("span",{className:"lc-scanner-corner tr"}),e.jsx("span",{className:"lc-scanner-corner bl"}),e.jsx("span",{className:"lc-scanner-corner br"}),e.jsx("img",{src:s.paymentReceiver.qrImageUrl,alt:"VietQR payment code"})]}):e.jsx("div",{className:"lc-qr-empty",children:a("license.qrNotAvailable")})}),e.jsx("p",{className:"lc-qr-hint",children:a("license.vietQrScanGuidance")}),e.jsxs("div",{className:"lc-pay-fields",children:[e.jsx(te,{label:a("license.bank"),value:_.name,imageUrl:_.iconUrl,imageAlt:_.name,imageIsIcon:!!_.iconUrl}),e.jsx(te,{label:a("license.accountHolder"),value:s.paymentReceiver?.accountName||"-"}),e.jsx(te,{label:a("license.accountNumber"),value:s.paymentReceiver?.accountNo||"-",mono:!0,onCopy:s.paymentReceiver?.accountNo?()=>void be(s.paymentReceiver?.accountNo||"","accountNo",a("license.copiedAccountNo")):void 0,copied:V==="accountNo"}),e.jsx(te,{label:a("license.amountToPay"),value:S(s.amount),accent:!0,strong:!0,onCopy:()=>void be(String(s.amount),"amount",a("license.copiedAmount")),copied:V==="amount"})]}),e.jsxs("div",{className:"lc-transfer",children:[e.jsxs("div",{className:"lc-transfer-warn",children:[e.jsx(fa,{size:14}),a("license.transferContentMustMatch")]}),e.jsxs("div",{className:"lc-transfer-box",children:[e.jsx("div",{className:"lc-transfer-code lc-mono",children:s.transferContent}),e.jsx("button",{className:`lc-icon-btn accent ${V==="transferContent"?"is-copied":""}`,onClick:()=>void be(s.transferContent,"transferContent",a("license.copiedTransferContent")),"aria-label":"Copy transfer content",title:a(V==="transferContent"?"common.copied":"license.copyContent"),children:V==="transferContent"?e.jsx(je,{size:15}):e.jsx(ke,{size:15})})]})]})]})]})}),e.jsx(Ue,{open:Je,onOpenChange:De,title:"Deactivate license?",description:"This removes the active license from this device. You will need to activate it again before using licensed features.",confirmLabel:"Deactivate",cancelLabel:"Keep active",onConfirm:da,variant:"danger"}),e.jsx(Ue,{open:Ge,onOpenChange:U,title:"Đơn thanh toán đã hết hạn",description:"Thời gian giữ đơn hàng (10 phút) đã kết thúc. Mã QR và thông tin chuyển khoản đã bị vô hiệu hóa để bảo vệ giao dịch của bạn. Vui lòng chọn gói và tạo đơn thanh toán mới.",confirmLabel:"Đã hiểu",cancelLabel:"Đóng",onConfirm:()=>U(!1),variant:"warning"})]})}function ve({label:a,value:i,action:t}){return e.jsxs("div",{className:"lc-meta-cell",children:[e.jsx("div",{className:"lc-meta-label",children:a}),e.jsxs("div",{className:"lc-meta-value",children:[e.jsx("span",{children:i}),t]})]})}function te({label:a,value:i,imageUrl:t,imageAlt:o,imageIsIcon:v=!1,mono:c=!1,accent:w=!1,strong:h=!1,onCopy:b,copied:B=!1}){return e.jsxs("div",{className:"lc-pay-field",children:[e.jsx("div",{className:"lc-pay-field-label",children:a}),e.jsxs("div",{className:"lc-pay-field-value",children:[t&&e.jsx("span",{className:"lc-bank-icon",children:e.jsx("img",{src:t,alt:o||i,className:v?"icon":"logo",loading:"lazy"})}),e.jsx("span",{className:`${c?"lc-mono":""} ${h?"strong":""} ${w?"accent":""}`,children:i}),b&&e.jsx("button",{type:"button",className:`lc-field-copy-btn ${B?"is-copied":""}`,onClick:b,title:B?"Đã sao chép!":`Sao chép ${a}`,"aria-label":`Copy ${a}`,children:B?e.jsx(je,{size:12}):e.jsx(ke,{size:12})})]})]})}function we({status:a}){return e.jsx("span",{className:`lc-chip ${a}`,children:a.charAt(0).toUpperCase()+a.slice(1)})}function Ba(){return e.jsx("style",{children:`
      .lc-root {
        --bg: #080711;
        --surface: rgba(20, 18, 38, 0.76);
        --surface-hover: rgba(24, 22, 46, 0.92);
        --surface-2: rgba(255, 255, 255, 0.035);
        --border: rgba(255, 255, 255, 0.08);
        --border-strong: rgba(255, 255, 255, 0.14);
        --text: #f1eff8;
        --dim: #b8b2cc;
        --mute: #8c87ab;
        --violet: #8b5cf6;
        --indigo: #6366f1;
        --pink: #ec4899;
        --cyan: #06b6d4;
        --emerald: #34d399;
        --amber: #fbbf24;
        --red: #fb7185;
        position: relative;
        height: 100%;
        overflow-y: auto;
        overflow-x: hidden;
        background:
          radial-gradient(circle at 18% -10%, rgba(124, 58, 237, 0.09), transparent 26%),
          var(--bg);
        color: var(--text);
        font-family: inherit;
      }
      .lc-display { font-family: inherit; font-feature-settings: 'tnum' 1; letter-spacing: -0.01em; }
      .lc-mono { font-family: 'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace; }

      .lc-shell { position: relative; z-index: 1; max-width: 1320px; margin: 0 auto; padding: 20px 26px 26px; }

      /* Topbar */
      .lc-topbar {
        display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap;
        margin-bottom: 16px; padding: 12px 14px;
        border: 1px solid var(--border); border-radius: 16px;
        background: rgba(20, 18, 38, 0.72); backdrop-filter: blur(18px);
        box-shadow: 0 16px 42px -30px rgba(0,0,0,.92), inset 0 1px 0 rgba(255,255,255,.025);
      }
      .lc-brandline { display: flex; align-items: center; gap: 12px; }
      .lc-brandmark {
        display: grid; place-items: center; height: 40px; width: 40px; border-radius: 11px; color: #ddd6fe;
        background: rgba(124, 58, 237, .14); border: 1px solid rgba(139, 92, 246, .3);
        box-shadow: inset 0 1px 0 rgba(255,255,255,.05);
      }
      .lc-title { font-size: 19px; font-weight: 760; letter-spacing: -0.02em; margin: 0; }
      .lc-subtitle { font-size: 12.5px; color: var(--mute); margin: 2px 0 0; }

      /* Top Section Layout */
      .lc-top-section { display: grid; grid-template-columns: 1fr; gap: 16px; margin-bottom: 16px; }
      .lc-top-section:has(.lc-pending-card) { grid-template-columns: 1.60fr 1fr; }
      @media (max-width: 1024px) { .lc-top-section:has(.lc-pending-card) { grid-template-columns: 1fr; } }

      /* Buttons */
      .lc-btn {
        display: inline-flex; align-items: center; justify-content: center; gap: 6px;
        border: 1px solid transparent; border-radius: 10px; padding: 8px 14px;
        font-size: 12px; font-weight: 600; cursor: pointer; white-space: nowrap;
        transition: background .18s ease, border-color .18s ease, box-shadow .18s ease, opacity .18s ease;
      }
      .lc-btn:disabled { opacity: .45; cursor: not-allowed; }
      .lc-btn-ghost { background: var(--surface-2); border-color: var(--border); color: var(--dim); }
      .lc-btn-ghost:hover { background: rgba(255,255,255,0.06); border-color: var(--border-strong); color: var(--text); }
      .lc-btn-soft { background: var(--surface-2); border-color: var(--border); color: var(--dim); }
      .lc-btn-soft:hover:not(:disabled) { background: rgba(255,255,255,0.06); color: var(--text); border-color: var(--border-strong); }
      .lc-btn-primary {
        background: linear-gradient(135deg, #7c3aed, #6366f1); color: #fff;
        box-shadow: 0 10px 22px -16px rgba(99,102,241,.9), inset 0 1px 0 rgba(255,255,255,0.14);
      }
      .lc-btn-primary:hover:not(:disabled) { background: linear-gradient(135deg, #8b5cf6, #6d6ff5); box-shadow: 0 12px 26px -16px rgba(99,102,241,.95); }
      .lc-btn-accent { background: rgba(168,85,247,0.1); border-color: rgba(168,85,247,0.25); color: #d8b4fe; }
      .lc-btn-accent:hover:not(:disabled) { background: rgba(168,85,247,0.16); color: #eddcff; }
      .lc-btn-danger { background: rgba(251,113,133,0.05); border-color: rgba(251,113,133,0.2); color: #fda4b0; }
      .lc-btn-danger:hover:not(:disabled) { background: rgba(251,113,133,0.1); color: #ffc9d1; }
      .lc-btn-plan { background: color-mix(in srgb, var(--accent) 8%, transparent); border-color: color-mix(in srgb, var(--accent) 20%, transparent); color: var(--accent); }
      .lc-btn-plan:hover:not(:disabled) { background: color-mix(in srgb, var(--accent) 15%, transparent); }
      .lc-btn-current { background: color-mix(in srgb, var(--accent) 10%, transparent); border-color: color-mix(in srgb, var(--accent) 26%, transparent); color: var(--accent); }
      .lc-btn-current:hover:not(:disabled) { background: color-mix(in srgb, var(--accent) 17%, transparent); border-color: color-mix(in srgb, var(--accent) 42%, transparent); color: color-mix(in srgb, var(--accent) 84%, #ffffff); }
      .lc-spin { animation: lc-spin 1s linear infinite; }
      @keyframes lc-spin { to { transform: rotate(360deg); } }

      /* Cards */
      .lc-card {
        background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 20px;
        backdrop-filter: blur(18px); box-shadow: 0 18px 46px -34px rgba(0,0,0,.95), inset 0 1px 0 rgba(255,255,255,.02);
      }
      .lc-card-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 16px; }
      .lc-card-title { font-size: 15px; font-weight: 700; margin: 0; letter-spacing: -0.01em; }
      .lc-card-sub { font-size: 12px; color: var(--mute); margin: 2px 0 0; }

      /* Initial loading */
      .lc-loading { display: grid; gap: 16px; animation: lc-loading-in .22s ease-out both; }
      @keyframes lc-loading-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
      .lc-loading-hero,
      .lc-loading-plans,
      .lc-loading-history {
        position: relative;
        overflow: hidden;
        border-radius: 18px;
        border: 1px solid var(--border);
        background:
          linear-gradient(145deg, rgba(30, 25, 52, 0.74), rgba(15, 12, 28, 0.68)),
          rgba(22, 19, 38, 0.7);
        backdrop-filter: blur(16px);
        box-shadow: 0 16px 36px -16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.025);
      }
      .lc-loading-hero { min-height: 170px; padding: 22px 28px; }
      .lc-loading-plans,
      .lc-loading-history { padding: 16px 22px; }
      .lc-loading-orb {
        position: absolute;
        right: -52px;
        top: -70px;
        width: 260px;
        height: 260px;
        border-radius: 999px;
        background:
          radial-gradient(circle, rgba(139, 92, 246, 0.16), transparent 58%),
          radial-gradient(circle at 35% 45%, rgba(52, 211, 153, 0.1), transparent 42%);
        filter: blur(2px);
        opacity: .85;
      }
      .lc-skel {
        position: relative;
        overflow: hidden;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.055);
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.035);
      }
      .lc-skel::after {
        content: '';
        position: absolute;
        inset: 0;
        transform: translateX(-115%);
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.11), transparent);
        animation: lc-skeleton-shimmer 1.55s ease-in-out infinite;
      }
      @keyframes lc-skeleton-shimmer { to { transform: translateX(115%); } }
      .lc-skel.muted { opacity: .66; }
      .lc-skel-pill { height: 22px; }
      .lc-skel-title { height: 34px; margin-top: 14px; border-radius: 10px; }
      .lc-skel-line { height: 14px; margin-top: 10px; border-radius: 6px; }
      .lc-skel-button { height: 36px; width: 150px; border-radius: 9px; }
      .lc-skel-button.short { width: 112px; }
      .lc-skel-button.full { width: 100%; margin-top: auto; }
      .lc-skel-input { height: 38px; width: 280px; border-radius: 10px; }
      .lc-skel-icon { width: 36px; height: 36px; border-radius: 9px; flex-shrink: 0; }
      .lc-skel-price { height: 30px; width: 150px; margin: 12px 0 12px; border-radius: 9px; }
      .lc-skel-block { height: 56px; min-width: 0; border-radius: 12px; background: rgba(255,255,255,0.04); position: relative; overflow: hidden; }
      .lc-skel-block::after {
        content: '';
        position: absolute;
        inset: 0;
        transform: translateX(-115%);
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.09), transparent);
        animation: lc-skeleton-shimmer 1.55s ease-in-out infinite;
      }
      .lc-loading-meta { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; max-width: 760px; margin-top: 22px; }
      .lc-loading-actions { display: flex; gap: 10px; margin-top: 18px; }
      .lc-loading-section-head { display: flex; justify-content: space-between; gap: 20px; align-items: flex-start; margin-bottom: 16px; border-bottom: 1px solid var(--border); padding-bottom: 12px; }
      .lc-loading-plan-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
      .lc-loading-plan-card {
        min-height: 238px;
        display: flex;
        flex-direction: column;
        padding: 16px 20px;
        border-radius: 14px;
        border: 1px solid var(--border);
        background: rgba(255,255,255,0.025);
      }
      .lc-loading-plan-head { display: flex; align-items: center; gap: 10px; }
      .lc-loading-table { border: 1px solid var(--border); border-radius: 14px; overflow: hidden; background: rgba(0,0,0,0.12); }
      .lc-loading-table-row { display: grid; grid-template-columns: 1.4fr 1fr 1fr 1fr 1.3fr; gap: 10px; align-items: center; min-height: 44px; padding: 8px 14px; border-top: 1px solid var(--border); }
      .lc-loading-table-row:first-child { border-top: 0; }
      .w-70 { width: 70px; }
      .w-90 { width: 90px; }
      .w-110 { width: 110px; }
      .w-120 { width: 120px; }
      .w-140 { width: 140px; }
      .w-150 { width: 150px; }
      .w-180 { width: 180px; }
      .w-200 { width: 200px; }
      .w-220 { width: 220px; }
      .w-240 { width: 240px; max-width: 100%; }
      .w-300 { width: 300px; max-width: 100%; }
      .w-320 { width: 320px; max-width: 100%; }
      .w-360 { width: 360px; max-width: 100%; }
      @media (max-width: 950px) {
        .lc-loading-plan-grid { grid-template-columns: 1fr; }
        .lc-loading-section-head { flex-direction: column; }
        .lc-skel-input { width: 100%; max-width: 280px; }
      }
      @media (max-width: 720px) {
        .lc-loading-meta,
        .lc-loading-table-row { grid-template-columns: 1fr; }
      }

      /* Hero */
      .lc-hero {
        position: relative; overflow: hidden; border-radius: 16px; padding: 22px 24px;
        border: 1px solid var(--border);
        background: rgba(20, 18, 38, .78);
        box-shadow: 0 18px 46px -34px rgba(0,0,0,.95), inset 0 1px 0 rgba(255,255,255,.025);
      }
      .lc-hero.is-active {
        border-color: rgba(52, 211, 153, 0.28);
        background: linear-gradient(120deg, rgba(16, 32, 31, .42), rgba(20, 18, 38, .82) 36%);
      }
      .lc-hero-glow {
        position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
        background: linear-gradient(90deg, rgba(124,58,237,.025), transparent 45%);
      }
      .lc-hero.is-active .lc-hero-glow { background: linear-gradient(90deg, rgba(52,211,153,.035), transparent 46%); }
      .lc-hero-shield { display: none; }
      .lc-hero-body { position: relative; z-index: 1; }
      .lc-hero-content-layout { display: grid; grid-template-columns: 1.35fr 1fr; gap: 20px; align-items: center; }
      @media (max-width: 820px) { .lc-hero-content-layout { grid-template-columns: 1fr; gap: 16px; } }

      .lc-hero-left { display: flex; flex-direction: column; z-index: 1; }
      .lc-hero-top { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }

      .lc-eyebrow { display: inline-flex; align-items: center; gap: 6px; font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; }
      .lc-eyebrow.ok { color: var(--emerald); }
      .lc-eyebrow.warn { color: var(--amber); }
      .lc-dot { height: 6px; width: 6px; border-radius: 50%; background: currentColor; box-shadow: 0 0 0 3px color-mix(in srgb, currentColor 20%, transparent); animation: lc-pulse 2s ease-in-out infinite; }
      @keyframes lc-pulse { 0%,100% { opacity: 1; } 50% { opacity: .4; } }

      .lc-state-pill { padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; border: 1px solid; }
      .lc-state-pill.ok { color: var(--emerald); background: rgba(52, 211, 153, 0.08); border-color: rgba(52, 211, 153, 0.2); }
      .lc-state-pill.warn { color: var(--amber); background: rgba(251, 191, 36, 0.08); border-color: rgba(251, 191, 36, 0.2); }

      .lc-plan-name { font-size: 26px; font-weight: 800; margin: 0; line-height: 1.15; color: #f8f7ff; }
      .lc-hero.is-active .lc-plan-name { color: #f3fff9; }
      .lc-plan-sub { font-size: 12.5px; color: var(--dim); margin: 6px 0 16px; line-height: 1.4; }
      .lc-hero-actions { display: flex; flex-wrap: wrap; gap: 8px; }

      .lc-hero-right { z-index: 1; }
      .lc-meta-card { background: rgba(10, 9, 24, .42); border: 1px solid var(--border); border-radius: 12px; padding: 14px 16px; box-shadow: inset 0 1px 0 rgba(255,255,255,0.018); }
      .lc-meta-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--mute); margin-bottom: 8px; border-bottom: 1px solid var(--border); padding-bottom: 6px; }
      .lc-meta-list { display: flex; flex-direction: column; gap: 8px; }
      .lc-meta-cell { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
      .lc-meta-label { font-size: 11.5px; color: var(--mute); }
      .lc-meta-value { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: var(--text); }
      .lc-meta-value > span { max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

      /* Manual Activation Section */
      .lc-manual-section { margin-bottom: 16px; background: var(--surface); border: 1px solid var(--border); box-shadow: 0 18px 40px -34px rgba(0,0,0,.9); padding: 14px 18px; border-radius: 14px; backdrop-filter: blur(16px); }
      .lc-manual-head { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 700; color: #c084fc; margin-bottom: 4px; }
      .lc-manual-desc { font-size: 12px; color: var(--mute); margin: 0 0 12px; }
      .lc-manual-row { display: flex; gap: 10px; max-width: 550px; }
      @media (max-width: 600px) { .lc-manual-row { flex-direction: column; } }

      /* Inputs */
      .lc-input {
        width: 100%; background: rgba(19, 15, 36, 0.6); border: 1px solid var(--border); border-radius: 10px;
        padding: 9px 12px; font-size: 12.5px; color: var(--text); transition: border-color .18s ease, box-shadow .18s ease;
      }
      .lc-input::placeholder { color: var(--mute); }
      .lc-input:focus { outline: none; border-color: var(--border-strong); box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1); }
      .lc-field { margin-bottom: 0; }
      .lc-label { display: block; font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--mute); margin-bottom: 6px; }

      /* Icon buttons */
      .lc-icon-btn { display: grid; place-items: center; height: 26px; width: 26px; border-radius: 7px; border: 1px solid var(--border); background: var(--surface-2); color: var(--mute); cursor: pointer; transition: all .15s ease; }
      .lc-icon-btn:hover { color: var(--text); border-color: var(--border-strong); background: rgba(255,255,255,0.06); }
      .lc-icon-btn.lg { height: 34px; width: 34px; border-radius: 10px; }
      .lc-icon-btn.accent { color: #d8b4fe; border-color: var(--border-strong); background: rgba(168,85,247,0.08); }
      .lc-icon-btn.accent:hover { background: rgba(168,85,247,0.15); }

      /* Pending Card */
      .lc-pending-card {
        border: 1px solid rgba(245, 158, 11, 0.35);
        background: var(--surface);
        box-shadow: 0 0 20px -5px rgba(245, 158, 11, 0.05), 0 16px 36px -16px rgba(0,0,0,0.5);
        display: flex; flex-direction: column; justify-content: space-between; padding: 10px 14px; border-radius: 12px;
      }
      .lc-pending-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; margin-bottom: 6px; }
      .lc-pending-title-group { display: flex; flex-direction: column; gap: 1px; }
      .lc-pending-badge { font-size: 9.5px; font-weight: 800; text-transform: uppercase; color: var(--amber); letter-spacing: 0.08em; }
      .lc-pending-title { font-size: 14.5px; font-weight: 700; margin: 0; }
      .lc-pending-details { background: rgba(0, 0, 0, 0.2); border: 1px solid var(--border); border-radius: 10px; padding: 8px 10px; margin-bottom: 8px; display: flex; flex-direction: column; gap: 4px; }
      .lc-pending-plan-row { display: flex; justify-content: space-between; align-items: baseline; }
      .lc-pending-plan-name { font-size: 13.5px; font-weight: 750; }
      .lc-pending-plan-amount { font-size: 12.5px; font-weight: 600; color: var(--amber); }
      .lc-pending-timer { display: flex; align-items: center; gap: 5px; font-size: 10.5px; color: var(--mute); }
      .lc-pending-code-box { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border); padding-top: 4px; }
      .lc-pending-code-label { font-size: 11px; color: var(--mute); }
      .lc-pending-code-value { font-size: 12.5px; font-weight: 700; color: var(--text); }
      .lc-pending-actions { display: flex; gap: 6px; flex-wrap: wrap; }
      .lc-pending-actions .lc-btn { flex: 1; min-width: 80px; padding: 5px 10px; font-size: 11.5px; border-radius: 6px; }

      /* Table */
      .lc-table { border: 1px solid var(--border); border-radius: 14px; overflow: hidden; background: rgba(0, 0, 0, 0.12); }
      .lc-table-head, .lc-table-row { display: grid; grid-template-columns: 1.4fr 1fr 1fr 1fr 1.3fr; gap: 10px; align-items: center; padding: 8px 14px; }
      .lc-table-head { font-size: 10.5px; font-weight: 750; text-transform: uppercase; letter-spacing: 0.08em; color: var(--mute); background: rgba(255, 255, 255, 0.01); border-bottom: 1px solid var(--border); }
      .lc-table-body .lc-table-row { border-top: 1px solid var(--border); font-size: 13px; color: var(--dim); transition: background .15s ease; }
      .lc-table-body .lc-table-row:hover { background: rgba(255,255,255,0.015); }
      .lc-table-row > span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .lc-col-strong { color: var(--text); font-weight: 600; }
      .lc-col-dim { color: var(--mute); }
      .lc-table-empty { padding: 24px; text-align: center; font-size: 12.5px; color: var(--mute); }

      /* Chips */
      .lc-chip { display: inline-flex; align-items: center; padding: 3px 9px; border-radius: 999px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; border: 1px solid; }
      .lc-chip.paid { color: var(--emerald); background: rgba(52,211,153,0.06); border-color: rgba(52,211,153,0.2); }
      .lc-chip.pending { color: var(--amber); background: rgba(251,191,36,0.06); border-color: rgba(251,191,36,0.25); }
      .lc-chip.expired { color: var(--mute); background: rgba(255,255,255,0.02); border-color: var(--border); }
      .lc-chip.failed, .lc-chip.canceled { color: var(--red); background: rgba(251,113,133,0.06); border-color: rgba(251,113,133,0.2); }

      /* Pricing Section Horizontal */
      .lc-plans-section {
        margin-bottom: 16px;
        background: rgba(20, 18, 38, .72);
        border: 1px solid var(--border); border-radius: 16px; padding: 18px;
        box-shadow: 0 18px 46px -34px rgba(0,0,0,.95), inset 0 1px 0 rgba(255,255,255,.018);
      }
      .lc-plans-header-row { display: flex; justify-content: space-between; align-items: center; gap: 24px; margin-bottom: 16px; border-bottom: 1px solid var(--border); padding-bottom: 14px; }
      @media (max-width: 900px) { .lc-plans-header-row { flex-direction: column; align-items: flex-start; gap: 12px; } }
      .lc-plans-title { display: flex; align-items: center; gap: 8px; color: #a78bfa; margin-bottom: 4px; }
      .lc-plans-title h2 { font-size: 17px; font-weight: 740; margin: 0; color: var(--text); white-space: nowrap; }
      .lc-plans-subtitle { font-size: 12.5px; color: var(--mute); margin: 0; max-width: 780px; line-height: 1.4; }
      .lc-customer-input-wrapper { width: auto; min-width: 330px; max-width: 420px; }
      .lc-customer-input-row {
        display: flex;
        align-items: center;
        min-height: 34px;
        height: 34px;
        padding-left: 6px;
        border: 1px solid var(--border);
        border-radius: 10px;
        color: var(--mute);
        background: rgba(8, 7, 20, .58);
        transition: border-color .18s ease, box-shadow .18s ease;
      }
      .lc-customer-input-row:focus-within { border-color: rgba(139, 92, 246, .56); box-shadow: 0 0 0 3px rgba(124, 58, 237, .09); }
      .lc-customer-input-row.has-error { border-color: rgba(251, 113, 133, .7); }
      .lc-customer-input-label {
        display: inline-flex;
        align-items: center;
        gap: 3.5px;
        font-size: 9.5px;
        font-weight: 850;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #c4b5fd;
        background: rgba(124, 58, 237, 0.1);
        border: 1px solid rgba(124, 58, 237, 0.2);
        padding: 2px 6px;
        border-radius: 5px;
        flex-shrink: 0;
      }
      .lc-customer-input-row .lc-input {
        min-width: 0;
        border: 0;
        background: transparent;
        box-shadow: none;
        font-size: 11.5px;
        padding: 0 6px;
        height: 100%;
      }
      .lc-customer-input-row .lc-input:focus { border: 0; box-shadow: none; }
      .lc-customer-input-row .lc-input:disabled { color: var(--text); opacity: 1; cursor: default; }
      .lc-identity-saved-pill {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        font-size: 9px;
        font-weight: 800;
        color: #4ade80;
        background: rgba(34, 197, 94, 0.12);
        border: 1px solid rgba(34, 197, 94, 0.25);
        padding: 1.5px 5.5px;
        border-radius: 4px;
        flex-shrink: 0;
        margin-right: 5px;
        white-space: nowrap;
      }
      .lc-identity-action {
        align-self: stretch;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        flex-shrink: 0;
        padding: 0 10px;
        border: 0;
        border-left: 1px solid var(--border);
        border-radius: 0 8px 8px 0;
        color: #c4b5fd;
        background: rgba(124, 58, 237, .09);
        font-size: 10.5px;
        font-weight: 800;
        cursor: pointer;
        transition: color .18s ease, background .18s ease;
      }
      .lc-identity-action:hover:not(:disabled) { color: #fff; background: rgba(124, 58, 237, .18); }
      .lc-identity-action:focus-visible { outline: 2px solid #8b5cf6; outline-offset: -3px; }
      .lc-identity-action:disabled { opacity: .42; cursor: not-allowed; }
      .lc-identity-action.is-save { color: #86efac; background: rgba(34, 197, 94, .09); }
      .lc-identity-error { margin: 3px 0 0; color: #fda4af; font-size: 10px; line-height: 1.3; }
      
      .lc-plans-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; align-items: stretch; }
      @media (max-width: 1080px) { .lc-plans-grid { grid-template-columns: 1fr; } }

      .lc-plan-card {
        position: relative; overflow: hidden; border-radius: 16px; padding: 18px;
        border: 1px solid var(--border);
        background: rgba(13, 12, 29, .66);
        display: flex; flex-direction: column; justify-content: space-between;
        min-width: 0;
        box-shadow: inset 0 1px 0 rgba(255,255,255,.02), 0 14px 34px -30px rgba(0,0,0,.95);
        transition: background .18s ease, border-color .18s ease, box-shadow .18s ease;
      }
      .lc-plan-card::before {
        content: ''; position: absolute; left: 0; top: 0; right: 0; height: 2px;
        background: linear-gradient(90deg, color-mix(in srgb, var(--accent) 70%, transparent), color-mix(in srgb, var(--accent) 18%, transparent), transparent 86%);
        opacity: .6; pointer-events: none;
      }
      .lc-plan-card:hover {
        background: rgba(17, 15, 36, .82);
        border-color: color-mix(in srgb, var(--accent) 30%, var(--border));
        box-shadow: inset 0 1px 0 rgba(255,255,255,.025), 0 18px 40px -30px rgba(0,0,0,.98);
      }
      .lc-plan-card:hover::before { opacity: .9; }

      .lc-plan-card.is-featured {
        background: linear-gradient(180deg, rgba(99,102,241,.065), rgba(13,12,29,.68) 22%);
        border-color: rgba(99, 102, 241, 0.32);
      }
      .lc-plan-card.is-featured::before { opacity: .9; background: linear-gradient(90deg, #818cf8, rgba(99,102,241,.2), transparent 88%); }
      .lc-plan-card.is-featured:hover { border-color: rgba(99, 102, 241, 0.46); }

      .lc-plan-card.is-current {
        border-color: color-mix(in srgb, var(--accent) 68%, var(--border));
        background:
          radial-gradient(circle at 86% 10%, color-mix(in srgb, var(--accent) 14%, transparent), transparent 34%),
          linear-gradient(180deg, color-mix(in srgb, var(--accent) 13%, rgba(13,12,29,.82)), rgba(13,12,29,.78) 34%);
        box-shadow:
          inset 0 1px 0 color-mix(in srgb, var(--accent) 18%, rgba(255,255,255,.03)),
          inset 0 0 0 1px color-mix(in srgb, var(--accent) 7%, transparent),
          0 18px 44px -28px color-mix(in srgb, var(--accent) 42%, rgba(0,0,0,.95));
      }
      .lc-plan-card.is-current::before { opacity: .95; background: linear-gradient(90deg, var(--accent), color-mix(in srgb, var(--accent) 18%, transparent), transparent 88%); }
      .lc-plan-card.is-current:hover {
        border-color: color-mix(in srgb, var(--accent) 80%, var(--border));
        box-shadow:
          inset 0 1px 0 color-mix(in srgb, var(--accent) 22%, rgba(255,255,255,.04)),
          inset 0 0 0 1px color-mix(in srgb, var(--accent) 10%, transparent),
          0 20px 48px -26px color-mix(in srgb, var(--accent) 52%, rgba(0,0,0,.95));
      }

      .lc-plan-corner-badges {
        position: absolute;
        top: 12px;
        right: 12px;
        z-index: 1;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 5px;
        max-width: calc(100% - 24px);
      }
      .lc-featured-badge,
      .lc-discount-corner-badge {
        display: inline-flex;
        align-items: center;
        min-height: 20px;
        padding: 3px 8px;
        border-radius: 999px;
        font-size: 8px;
        font-weight: 850;
        line-height: 1;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        white-space: nowrap;
      }
      .lc-featured-badge { color: #ddd6fe; background: rgba(124,58,237,.14); border: 1px solid rgba(139,92,246,.3); box-shadow: none; }
      .lc-discount-corner-badge {
        display: inline-flex;
        align-items: center;
        gap: 3.5px;
        min-height: 22px;
        padding: 2.5px 8.5px;
        border-radius: 999px;
        font-size: 9.5px;
        font-weight: 900;
        line-height: 1;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        white-space: nowrap;
        color: #fed7aa;
        background: rgba(234, 88, 12, .11);
        border: 1px solid rgba(251, 146, 60, .28);
        box-shadow: none;
      }
      .lc-discount-badge-icon {
        color: #fdba74;
      }
      .lc-plan-heading-copy { min-width: 0; }
      .lc-plan-heading-meta {
        display: flex;
        align-items: center;
        min-width: 0;
        min-height: 12px;
      }
      .lc-plan-name-row {
        display: flex;
        align-items: center;
        gap: 7px;
        min-width: 0;
        margin-top: 1px;
      }
      .lc-current-chip {
        position: relative;
        isolation: isolate;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        flex-shrink: 0;
        min-height: 20px;
        margin-left: 20px;
        padding: 3px 12px;
        border: 0;
        clip-path: polygon(6px 0, calc(100% - 6px) 0, 100% 50%, calc(100% - 6px) 100%, 6px 100%, 0 50%);
        white-space: nowrap;
        color: color-mix(in srgb, var(--accent) 62%, #ffffff);
        background: color-mix(in srgb, var(--accent) 72%, rgba(255,255,255,.18));
        font-size: 8.6px;
        font-weight: 860;
        letter-spacing: 0.025em;
        text-transform: uppercase;
        pointer-events: none;
      }
      .lc-current-chip::before {
        content: '';
        position: absolute;
        inset: 1px;
        z-index: -1;
        clip-path: inherit;
        background: linear-gradient(90deg, color-mix(in srgb, var(--accent) 25%, rgba(255,255,255,.025)), color-mix(in srgb, var(--accent) 12%, rgba(8,7,17,.88)));
      }
      .lc-current-chip svg {
        flex-shrink: 0;
        padding: 1px;
        border-radius: 50%;
        color: #08130f;
        background: color-mix(in srgb, var(--accent) 82%, #ffffff);
      }

      .lc-plan-card-header { display: flex; align-items: center; gap: 11px; min-height: 38px; margin-bottom: 8px; }
      .lc-plan-card.has-corner-badges .lc-plan-card-header { padding-right: 104px; }
      .lc-plan-icon-container { display: grid; place-items: center; width: 38px; height: 38px; border-radius: 10px; color: var(--accent); background: color-mix(in srgb, var(--accent) 9%, transparent); border: 1px solid color-mix(in srgb, var(--accent) 20%, transparent); }
      .lc-plan-badge-tag { font-size: 8.5px; font-weight: 750; text-transform: uppercase; color: var(--accent); letter-spacing: 0.06em; display: block; }
      .lc-plan-card-name { font-size: 16px; font-weight: 740; margin: 0; color: var(--text); }
      .lc-plan-description { min-height: 18px; margin: 0 0 5px; color: var(--mute); font-size: 11.5px; line-height: 1.45; }
      .lc-plan-card-pricing {
        display: grid;
        grid-template-rows: 32px 18px;
        align-content: start;
        min-height: 50px;
        margin-bottom: 10px;
      }
      .lc-plan-current-row { display: flex; align-items: baseline; gap: 4px; min-width: 0; white-space: nowrap; }
      .lc-plan-price-meta { display: flex; align-items: center; justify-content: space-between; gap: 12px; width: 100%; min-height: 18px; overflow: hidden; white-space: nowrap; }
      .lc-plan-price-meta.is-empty { visibility: hidden; }
      .lc-plan-original-price { color: var(--mute); font-size: 11px; font-weight: 650; text-decoration: line-through; text-decoration-thickness: 1.5px; }
      .lc-plan-card-price { font-size: 24px; font-weight: 850; color: color-mix(in srgb, var(--accent) 86%, #fff); letter-spacing: -0.025em; }
      .lc-plan-card-duration { font-size: 12px; color: var(--mute); }
      .lc-plan-savings {
        margin-left: auto;
        color: #4ade80;
        font-size: 10.5px;
        font-weight: 800;
        background: rgba(34, 197, 94, 0.09);
        padding: 1px 6px;
        border-radius: 5px;
        border: 1px solid rgba(34, 197, 94, 0.2);
      }
      .lc-duration-options {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(58px, 1fr));
        gap: 3px;
        margin: 0 0 14px;
        padding: 3px;
        border: 1px solid var(--border);
        border-radius: 10px;
        background: rgba(7, 6, 18, .52);
      }
      .lc-duration-chip {
        min-height: 29px;
        padding: 5px 8px;
        border: 1px solid transparent;
        border-radius: 7px;
        background: transparent;
        color: var(--mute);
        font-size: 10.5px;
        font-weight: 750;
        cursor: pointer;
        transition: border-color .16s ease, background .16s ease, color .16s ease, box-shadow .16s ease;
      }
      .lc-duration-chip:hover {
        background: rgba(255,255,255,.035);
        color: var(--text);
      }
      .lc-duration-chip.is-selected {
        border-color: color-mix(in srgb, var(--accent) 28%, transparent);
        background: color-mix(in srgb, var(--accent) 13%, rgba(255,255,255,.02));
        color: color-mix(in srgb, var(--accent) 82%, #ffffff);
        box-shadow: inset 0 1px 0 rgba(255,255,255,.035);
      }
      .lc-duration-chip:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
      .lc-plan-card-features { display: flex; flex-direction: column; gap: 12px; margin-bottom: 14px; flex-grow: 1; }
      .lc-plan-feature-group { display: flex; flex-direction: column; gap: 7px; }
      .lc-plan-feature-group-premium {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 7px 12px;
        padding-top: 11px;
        border-top: 1px solid var(--border);
      }
      .lc-plan-feature-group-premium .lc-plan-feature-group-label { grid-column: 1 / -1; }
      .lc-plan-feature-group-premium .lc-plan-feature-item { gap: 6px; font-size: 11.2px; white-space: nowrap; }
      .lc-plan-feature-group-label { color: var(--mute); font-size: 9px; font-weight: 820; letter-spacing: .08em; text-transform: uppercase; }
      .lc-plan-feature-item { display: flex; align-items: flex-start; gap: 8px; min-height: 18px; font-size: 12.2px; color: var(--dim); line-height: 1.35; }
      .lc-plan-feature-item.is-disabled { cursor: not-allowed; color: #6f6a85; opacity: .7; }
      .lc-feature-icon { color: var(--accent); margin-top: 1px; flex-shrink: 0; }
      .lc-feature-lock { color: #77718d; margin-top: 1px; flex-shrink: 0; }
      .lc-plan-limits { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); overflow: hidden; margin: 0 0 12px; border: 1px solid var(--border); border-radius: 10px; background: rgba(7, 6, 18, .5); }
      .lc-plan-limit { min-width: 0; padding: 8px 5px; text-align: center; border-right: 1px solid var(--border); }
      .lc-plan-limit:last-child { border-right: 0; }
      .lc-plan-limit-label { display: block; margin-bottom: 3px; color: var(--mute); font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em; }
      .lc-plan-limit-value { display: block; color: var(--text); font-size: 11.5px; font-weight: 800; white-space: nowrap; }
      .lc-plan-limit-dot { color: var(--mute); font-weight: 400; margin: 0 1px; }
      .lc-plan-limit-speed { color: color-mix(in srgb, var(--accent) 85%, #fff); font-weight: 750; font-size: 10.5px; }
      .lc-plan-limit-unlimited { color: #34d399; font-weight: 800; font-size: 12px; }
      .lc-plan-card-actions {
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        gap: 8px;
        margin-top: auto;
      }
      .lc-plan-card-actions.has-trial { grid-template-columns: minmax(0, .95fr) minmax(0, 1.05fr); }
      .lc-plan-trial-cta {
        width: 100%;
        min-width: 0;
        margin: 0;
        padding: 8px 9px;
        border-color: color-mix(in srgb, var(--accent) 45%, transparent);
        background: color-mix(in srgb, var(--accent) 10%, transparent);
        color: var(--accent);
        white-space: nowrap;
      }
      .lc-plan-trial-limit {
        margin-left: 1px;
        padding-left: 6px;
        border-left: 1px solid color-mix(in srgb, var(--accent) 28%, transparent);
        color: color-mix(in srgb, var(--accent) 72%, var(--mute));
        font-size: 8.5px;
        font-weight: 750;
        white-space: nowrap;
      }
      .lc-plan-card-cta { width: 100%; min-width: 0; margin: 0; padding: 8px 12px; }
      @media (max-width: 560px) {
        .lc-shell { padding-left: 14px; padding-right: 14px; }
        .lc-plan-feature-group-premium { grid-template-columns: 1fr; }
      }
      .lc-plans-empty {
        grid-column: 1 / -1;
        min-height: 150px;
        display: grid;
        place-items: center;
        border: 1px dashed var(--border);
        border-radius: 14px;
        color: var(--mute);
        font-size: 12.5px;
        text-align: center;
      }

      .lc-activity-section {
        background: rgba(20, 18, 38, .7);
        border: 1px solid var(--border); border-radius: 16px; padding: 16px 18px;
        box-shadow: 0 18px 46px -34px rgba(0,0,0,.95), inset 0 1px 0 rgba(255,255,255,.018);
      }

      /* Modal */
      .lc-overlay { position: fixed; inset: 0; z-index: 50; display: flex; align-items: center; justify-content: center; padding: 24px; background: rgba(4,3,10,0.72); backdrop-filter: blur(8px); animation: lc-fade .2s ease; }
      @keyframes lc-fade { from { opacity: 0; } to { opacity: 1; } }
      .lc-modal { width: 100%; max-width: 480px; max-height: 90vh; overflow-y: auto; border-radius: 18px; border: 1px solid rgba(255,255,255,.1); background: rgba(19,15,36,.98); box-shadow: 0 28px 80px -24px rgba(0,0,0,.92), inset 0 1px 0 rgba(255,255,255,.025); animation: lc-rise .25s cubic-bezier(.2,.8,.2,1); }
      @keyframes lc-rise { from { opacity: 0; transform: translateY(14px) scale(.98); } to { opacity: 1; transform: none; } }
      .lc-modal-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 14px 18px; border-bottom: 1px solid var(--border); }
      .lc-modal-head-left { display: flex; align-items: center; gap: 10px; min-width: 0; }
      .lc-modal-amount { flex-shrink: 0; padding: 6px 12px; border-radius: 10px; font-size: 14px; font-weight: 700; color: #fff; background: linear-gradient(135deg, var(--violet), var(--indigo)); box-shadow: 0 6px 16px -6px rgba(124,58,237,0.6); }
      .lc-modal-title { font-size: 16px; font-weight: 700; margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .lc-modal-body { padding: 14px 18px 18px; display: flex; flex-direction: column; gap: 12px; }
      .lc-payment-summary { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 9px 14px; border: 1px solid rgba(52, 211, 153, 0.25); border-radius: 12px; background: linear-gradient(90deg, rgba(52, 211, 153, 0.08), rgba(99, 102, 241, 0.06)); font-size: 12px; }
      .lc-summary-left { display: flex; align-items: center; gap: 7px; color: var(--dim); }
      .lc-summary-icon { color: #34d399; flex-shrink: 0; }
      .lc-summary-left strong { color: var(--text); font-weight: 600; }
      .lc-summary-right { display: flex; align-items: center; gap: 7px; }
      .lc-summary-badge { padding: 2px 7px; border-radius: 999px; font-size: 10.5px; font-weight: 700; letter-spacing: 0.03em; text-transform: uppercase; background: rgba(52, 211, 153, 0.15); border: 1px solid rgba(52, 211, 153, 0.35); color: #34d399; }
      .lc-summary-saving { font-size: 12.5px; font-weight: 700; color: #34d399; }

      .lc-pay-status { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; padding: 12px; border-radius: 12px; border: 1px solid; }
      .lc-pay-status.paid { border-color: rgba(52,211,153,0.25); background: rgba(52,211,153,0.05); }
      .lc-pay-status.pending { border-color: rgba(251,191,36,0.25); background: rgba(251,191,36,0.05); }
      .lc-pay-status.failed { border-color: rgba(251,113,133,0.25); background: rgba(251,113,133,0.05); }
      .lc-pay-status-left { display: flex; align-items: center; gap: 10px; min-width: 0; }
      .lc-pay-status-icon { display: grid; place-items: center; height: 32px; width: 32px; border-radius: 9px; flex-shrink: 0; }
      .lc-pay-status.paid .lc-pay-status-icon { color: var(--emerald); background: rgba(52,211,153,0.1); }
      .lc-pay-status.pending .lc-pay-status-icon { color: var(--amber); background: rgba(251,191,36,0.1); }
      .lc-pay-status.failed .lc-pay-status-icon { color: var(--red); background: rgba(251,113,133,0.1); }
      .lc-pay-status-label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--mute); }
      .lc-pay-status-value { display: flex; align-items: center; gap: 8px; margin-top: 4px; font-size: 12px; color: var(--dim); }
      .lc-countdown { font-weight: 700; color: var(--text); }

      .lc-qr-wrap { position: relative; display: flex; justify-content: center; align-items: center; padding: 16px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.06); background: radial-gradient(circle at center, rgba(124,58,237,0.16) 0%, rgba(52,211,153,0.06) 50%, rgba(10,9,18,0.5) 80%); overflow: hidden; }
      .lc-qr { position: relative; padding: 12px; border-radius: 14px; background: #fff; box-shadow: 0 12px 36px -10px rgba(0,0,0,0.6), 0 0 24px -6px rgba(124,58,237,0.25); }
      .lc-qr img { display: block; height: 200px; width: 200px; max-width: 100%; object-fit: contain; }
      .lc-qr-empty { display: grid; place-items: center; height: 200px; width: 200px; max-width: 100%; border-radius: 12px; border: 1px dashed var(--border-strong); font-size: 11.5px; color: var(--mute); text-align: center; }
      .lc-scanner-corner { position: absolute; width: 14px; height: 14px; border-color: var(--violet); border-style: solid; pointer-events: none; }
      .lc-scanner-corner.tl { top: -3px; left: -3px; border-width: 3px 0 0 3px; border-top-left-radius: 6px; }
      .lc-scanner-corner.tr { top: -3px; right: -3px; border-width: 3px 3px 0 0; border-top-right-radius: 6px; }
      .lc-scanner-corner.bl { bottom: -3px; left: -3px; border-width: 0 0 3px 3px; border-bottom-left-radius: 6px; }
      .lc-scanner-corner.br { bottom: -3px; right: -3px; border-width: 0 3px 3px 0; border-bottom-right-radius: 6px; }
      .lc-qr-hint { text-align: center; font-size: 11.5px; color: var(--mute); margin: 0; }

      .lc-modal-badge-paid { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 8px; font-size: 11.5px; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; color: #34d399; background: rgba(52, 211, 153, 0.15); border: 1px solid rgba(52, 211, 153, 0.35); }

      /* Celebration Success Screen */
      .lc-modal-success { padding: 26px 22px 22px; display: flex; flex-direction: column; align-items: center; gap: 18px; text-align: center; animation: lc-fade .3s ease; }
      .lc-success-hero { display: flex; flex-direction: column; align-items: center; gap: 12px; }
      .lc-success-icon-wrap { position: relative; display: grid; place-items: center; width: 84px; height: 84px; margin-bottom: 2px; }
      .lc-success-halo { position: absolute; inset: -8px; border-radius: 50%; background: radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, rgba(124, 58, 237, 0.2) 50%, transparent 70%); animation: lc-rotate-halo 6s linear infinite; }
      @keyframes lc-rotate-halo { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      .lc-success-pulse-ring { position: absolute; inset: 4px; border-radius: 50%; background: rgba(52, 211, 153, 0.25); animation: lc-pulse-radar 2s cubic-bezier(.2,.8,.2,1) infinite; }
      .lc-success-icon { position: relative; display: grid; place-items: center; width: 68px; height: 68px; border-radius: 50%; background: linear-gradient(145deg, #34d399, #059669); color: #fff; box-shadow: 0 12px 32px -6px rgba(16, 185, 129, 0.65), inset 0 2px 4px rgba(255,255,255,0.4); transition: transform .2s ease; }
      .lc-success-icon-wrap:hover .lc-success-icon { transform: scale(1.06); }
      .lc-success-title { font-size: 22px; font-weight: 850; letter-spacing: -0.02em; background: linear-gradient(135deg, #ffffff 40%, #c4b5fd 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0; }
      .lc-success-subtitle { font-size: 13.5px; color: var(--dim); margin: 0; line-height: 1.45; max-width: 360px; }
      .lc-success-subtitle strong { color: #a78bfa; font-weight: 700; }
      .lc-success-card { width: 100%; border: 1px solid rgba(124, 58, 237, 0.25); border-radius: 16px; background: linear-gradient(180deg, rgba(124, 58, 237, 0.08) 0%, rgba(16, 185, 129, 0.04) 100%); backdrop-filter: blur(12px); padding: 14px 18px; display: flex; flex-direction: column; gap: 11px; box-shadow: 0 8px 24px -8px rgba(0,0,0,0.4); }
      .lc-success-row { display: flex; justify-content: space-between; align-items: center; font-size: 13px; padding-bottom: 2px; }
      .lc-success-row:not(:last-child) { border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 9px; }
      .lc-success-lbl { color: var(--mute); font-weight: 500; }
      .lc-success-val { font-weight: 650; color: var(--text); }
      .lc-success-plan-name { color: #c4b5fd; font-weight: 700; }
      .lc-success-amount { color: #34d399; font-size: 14.5px; font-weight: 800; }
      .lc-btn-success-cta { position: relative; overflow: hidden; width: 100%; padding: 14px 24px; font-size: 15px; font-weight: 750; border-radius: 14px; color: #fff; background: linear-gradient(135deg, var(--violet), var(--indigo)); box-shadow: 0 12px 28px -6px rgba(124, 58, 237, 0.55); border: 0; display: inline-flex; align-items: center; justify-content: center; gap: 9px; cursor: pointer; transition: transform .18s ease, box-shadow .18s ease; }
      .lc-btn-success-cta::after { content: ''; position: absolute; top: 0; left: -100%; width: 60%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent); transform: skewX(-20deg); animation: lc-shimmer-sweep 3s infinite; }
      @keyframes lc-shimmer-sweep { 0% { left: -100%; } 40% { left: 160%; } 100% { left: 160%; } }
      .lc-btn-success-cta:hover { transform: translateY(-2px); box-shadow: 0 16px 36px -6px rgba(124, 58, 237, 0.7); }

      .lc-pay-fields { border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
      .lc-pay-field { display: grid; grid-template-columns: 0.8fr 1.2fr; gap: 10px; align-items: center; padding: 10px 14px; border-bottom: 1px solid var(--border); }
      .lc-pay-field:last-child { border-bottom: 0; }
      .lc-pay-field-label { font-size: 12px; color: var(--mute); }
      .lc-pay-field-value { display: flex; align-items: center; justify-content: flex-end; gap: 8px; text-align: right; font-size: 12.5px; font-weight: 600; color: var(--text); min-width: 0; }
      .lc-pay-field-value > span { min-width: 0; word-break: break-all; }
      .lc-pay-field-value .strong { font-size: 14px; font-weight: 700; }
      .lc-pay-field-value .accent { color: var(--emerald); }
      .lc-bank-icon { display: grid; place-items: center; height: 24px; width: 24px; flex-shrink: 0; border-radius: 7px; background: #fff; padding: 2px; box-shadow: 0 2px 4px rgba(0,0,0,0.25); }
      .lc-bank-icon img.icon { height: 100%; width: 100%; object-fit: cover; border-radius: 5px; }
      .lc-bank-icon img.logo { max-height: 100%; max-width: 100%; object-fit: contain; }

      .lc-transfer { display: flex; flex-direction: column; gap: 8px; }
      .lc-transfer-warn { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--amber); }
      .lc-transfer-box { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 10px 14px; border-radius: 10px; border: 1px solid rgba(99,102,241,0.3); background: rgba(99,102,241,0.08); }
      .lc-transfer-code { font-size: 16px; font-weight: 700; letter-spacing: 0.03em; word-break: break-all; min-width: 0; }

      .lc-field-copy-btn { display: inline-grid; place-items: center; width: 22px; height: 22px; border-radius: 6px; border: 1px solid var(--border); background: rgba(255,255,255,0.04); color: var(--mute); cursor: pointer; transition: all .15s ease; flex-shrink: 0; margin-left: 6px; padding: 0; }
      .lc-field-copy-btn:hover { color: var(--text); background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.22); }
      .lc-field-copy-btn.is-copied { color: #34d399; background: rgba(52,211,153,0.15); border-color: rgba(52,211,153,0.35); }
      .lc-icon-btn.is-copied { color: #34d399 !important; background: rgba(52,211,153,0.15) !important; border-color: rgba(52,211,153,0.35) !important; }

      .lc-status-pending-wrap { display: inline-flex; align-items: center; gap: 6px; }
      .lc-live-pulse { width: 7px; height: 7px; border-radius: 50%; background: var(--amber); box-shadow: 0 0 0 0 rgba(251,191,36,0.7); animation: lc-pulse-radar 1.8s infinite; }
      @keyframes lc-pulse-radar {
        0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(251,191,36,0.7); }
        70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(251,191,36,0); }
        100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(251,191,36,0); }
      }

      @media (prefers-reduced-motion: reduce) {
        .lc-loading,
        .lc-dot,
        .lc-spin,
        .lc-overlay,
        .lc-modal {
          animation: none !important;
        }
        .lc-skel::after,
        .lc-skel-block::after {
          animation: none !important;
          display: none;
        }
        .lc-btn,
        .lc-plan-card {
          transition: none !important;
        }
      }
    `})}function Ia(a){const i=a.filter(o=>o.status==="paid").map(He),t=a.find(o=>o.status==="pending");return[...t?[He(t)]:[],...i].slice(0,8)}function Ea({plan:a}){const i=[{label:"Image",quota:a.imagePeriodQuota,concurrency:a.imageConcurrency},{label:"Video",quota:a.videoPeriodQuota,concurrency:a.videoConcurrency},{label:"TTS",quota:a.ttsPeriodQuota,concurrency:a.ttsConcurrency}];return e.jsx("div",{className:"lc-plan-limits","aria-label":`${a.label} generation limits`,children:i.map(t=>{const o=a.unlimited||t.quota===null;return e.jsxs("div",{className:"lc-plan-limit",children:[e.jsx("span",{className:"lc-plan-limit-label",children:t.label}),e.jsx("span",{className:"lc-plan-limit-value",children:o?e.jsx("span",{className:"lc-plan-limit-unlimited",children:"∞ · ∞"}):e.jsxs("span",{children:[t.quota," ",e.jsx("span",{className:"lc-plan-limit-dot",children:"·"})," ",e.jsxs("span",{className:"lc-plan-limit-speed",children:[t.concurrency??1,"x"]})]})})]},t.label)})})}function He(a){return{orderCode:a.orderCode,planCode:a.planCode,planName:a.planName,durationCode:a.durationCode,durationDays:a.durationDays,amount:a.amount,status:a.status,createdAt:a.createdAt,updatedAt:a.serverTime}}function Ma(a){const i=a.badge?.trim()||a.tier;return{code:a.code,label:a.name,badge:i,billingOptions:[...a.billingOptions].sort((t,o)=>t.sortOrder-o.sortOrder||t.durationDays-o.durationDays),description:a.description,features:a.features,localizedContent:a.localizedContent,capabilities:ka(a.capabilities),accent:a.accentColor?.trim()||$a(a.code||a.tier),icon:Ta(a.code||a.tier),recommended:a.tier.toLowerCase()==="pro"||/recommend/i.test(i),bestValue:a.tier.toLowerCase()==="ultra"||/best\s*value/i.test(i),imageConcurrency:a.imageConcurrency,imagePeriodQuota:a.imagePeriodQuota,videoConcurrency:a.videoConcurrency,videoPeriodQuota:a.videoPeriodQuota,ttsConcurrency:a.ttsConcurrency,ttsPeriodQuota:a.ttsPeriodQuota,unlimited:a.unlimited,trialEnabled:a.trialEnabled,trialDays:a.trialDays,trialOncePerMachine:a.trialOncePerMachine,allowPromotion:a.allowPromotion}}function Ta(a){const c=String(a||"").toLowerCase();if(c.includes("gold")||c==="ultra")return()=>e.jsx("span",{style:{fontSize:"22px",lineHeight:1,display:"inline-flex",alignItems:"center",justifyContent:"center"},title:"Gold VIP",children:"👑"});if(c.includes("silver"))return()=>e.jsx("span",{style:{fontSize:"22px",lineHeight:1,display:"inline-flex",alignItems:"center",justifyContent:"center"},title:"Silver",children:"💎"});if(c.includes("basic")||c==="pro")return()=>e.jsx("span",{style:{fontSize:"22px",lineHeight:1,display:"inline-flex",alignItems:"center",justifyContent:"center"},title:"Basic",children:"⚡"});if(c.includes("trial")||c==="starter")return()=>e.jsx("span",{style:{fontSize:"22px",lineHeight:1,display:"inline-flex",alignItems:"center",justifyContent:"center"},title:"Trải Nghiệm Free",children:"🎁"});return()=>e.jsx("span",{style:{fontSize:"22px",lineHeight:1,display:"inline-flex",alignItems:"center",justifyContent:"center"},children:"✨"})}function $a(a){const c=String(a||"").toLowerCase();if(c.includes("gold")||c==="ultra")return"#eab308";if(c.includes("silver"))return"#a855f7";if(c.includes("basic")||c==="pro")return"#6366f1";if(c.includes("trial")||c==="starter")return"#38bdf8";return"#38bdf8"}function Ne(a,i){return i.find(t=>t.code===a)?.label||a.toUpperCase()}function Xe(a,i){const t=a.planName||Ne(a.planCode,i),o=Ce({durationCode:a.durationCode,durationDays:a.durationDays});return`${t} · ${o}`}function Oa(a,i){const t=a.planName||Ne(a.planCode,i);return!a.durationCode&&!a.durationDays?t:`${t} · ${Ce(a)}`}function Ce(a){const i=a.durationCode?.trim().toUpperCase()||"";if(i)return i;const t=a.durationDays||0;return t>=365&&t%365===0?`${t/365}Y`:t>=30&&t%30===0?`${t/30}M`:t>0?`${t}D`:"-"}function La(a,i){if(a.durationDays>=365&&a.durationDays%365===0){const t=a.durationDays/365;return i?`${t} năm`:`${t} year${t===1?"":"s"}`}if(a.durationDays>=30&&a.durationDays%30===0){const t=a.durationDays/30;return i?`${t} tháng`:`${t} month${t===1?"":"s"}`}return i?`${a.durationDays} ngày`:`${a.durationDays} days`}function Ua(a,i,t,o){if(o?.planCode===a.code&&i?.durationCode===o.durationCode)return o.amount;const v=t.find(c=>c.planCode===a.code&&c.durationCode===i?.durationCode);return i?.priceVnd??v?.amount??0}function Qe(a,i,t=!0){const o=a?.originalPriceVnd;if(!t||typeof o!="number"||o<=i||i<0)return null;const v=o-i;return{originalPriceVnd:o,savings:v,percent:Math.round(v/o*100)}}function Va(a){return a?Qe({originalPriceVnd:a.originalPriceVnd},a.amount):null}function Ra(a){const i=a.trim();return i?i.length<3||i.length>120||/\s/u.test(i)?"Use 3-120 characters without spaces.":"":"Enter your email or username before continuing."}function K(a){if(!a)return"-";const i=new Date(a);if(!Number.isFinite(i.getTime()))return"-";const t=String(i.getDate()).padStart(2,"0"),o=String(i.getMonth()+1).padStart(2,"0"),v=i.getFullYear(),c=String(i.getHours()).padStart(2,"0"),w=String(i.getMinutes()).padStart(2,"0");return`${t}/${o}/${v} ${c}:${w}`}function Ha(a){if(!a)return"unknown";const i=new Date(a).getTime();if(!Number.isFinite(i))return"unknown";const t=i-Date.now();if(t<=0)return"expired";const o=Math.floor(t/(1440*60*1e3));if(o>=1)return`in ${o} day${o===1?"":"s"}`;const v=Math.floor(t/(3600*1e3));if(v>=1)return`in ${v} hour${v===1?"":"s"}`;const c=Math.max(1,Math.floor(t/(60*1e3)));return`in ${c} minute${c===1?"":"s"}`}function Xa(a){const i=a instanceof Error?a.message.toLowerCase():"";return i.includes("already has an active license")||i.includes("trial has already been used")}function Za(a){const i=a instanceof Error?a.message.toLowerCase():"";return i.includes("trial has already been used")?"The free trial has already been used on this device.":i.includes("already has an active license")?"A license is already active on this device. Refresh the license status to continue.":i.includes("does not offer a trial")?"This plan does not currently offer a free trial.":"Unable to activate the free trial. Please check your connection and try again."}function S(a){return new Intl.NumberFormat("vi-VN",{style:"currency",currency:"VND",maximumFractionDigits:0}).format(a)}function Ze(a){if(a<=0)return"Expired";const i=Math.floor(a/1e3),t=Math.floor(i/60),o=i%60;return`${t}:${o.toString().padStart(2,"0")}`}function Fa(a){return a?a.length>16?`${a.slice(0,8)}...${a.slice(-6)}`:a:"-"}function qa(a){if(!a)return{name:"-"};const i=a.trim().replace(/\s+/g,"").toUpperCase();return Da[i]||{name:a}}function u(a){return`data:image/svg+xml;utf8,${encodeURIComponent(Ka(a))}`}function Ka(a){const i='xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"';switch(a){case"tpbank":return`<svg ${i}><defs><linearGradient id="g" x1="10" y1="8" x2="52" y2="56" gradientUnits="userSpaceOnUse"><stop stop-color="#FFB21A"/><stop offset="1" stop-color="#F37021"/></linearGradient></defs><rect width="64" height="64" rx="14" fill="#4B2484"/><path d="M12 18c1.8-4 5.4-6 10.4-6h28.4c3.6 0 5.8 3.8 3.8 6.8L35.8 50.2c-2.1 3.5-7.2 3.5-9.2-.1L9.5 20.8C8.5 19 9.9 18 12 18Z" fill="url(#g)"/><path d="M25 19.5 43.7 31 29.3 43.8 25 19.5Z" fill="#50248C"/></svg>`;case"vietcombank":return`<svg ${i}><defs><linearGradient id="g" x1="11" y1="13" x2="51" y2="54" gradientUnits="userSpaceOnUse"><stop stop-color="#9ACD32"/><stop offset=".48" stop-color="#09864B"/><stop offset="1" stop-color="#006B3F"/></linearGradient></defs><rect width="64" height="64" rx="14" fill="#fff"/><path d="M15 15c8.8-3.7 33.5-4.2 38 1.2 2.6 3.1.2 10.7-7.1 22.8-8.2 13.6-16.2 17.3-23.9 11C12.8 42.4 7.2 26.8 15 15Z" fill="url(#g)"/><path d="M23.2 24.8c7.1-.7 13.8-.5 20.2.5L31.8 41.7 23.2 24.8Z" fill="#fff"/></svg>`;case"bidv":return`<svg ${i}><rect width="64" height="64" rx="14" fill="#006B68"/><path d="M32 9 54 32 32 55 10 32 32 9Z" fill="#E22B2F"/><path d="M32 15 48 32 32 49 16 32 32 15Z" fill="#FDBB30"/><path d="M32 21 42 32 32 43 22 32 32 21Z" fill="#006B68"/></svg>`;case"mb":return`<svg ${i}><rect width="64" height="64" rx="14" fill="#102A83"/><path d="M32 8 38.7 24.2 56 25.5 42.8 36.8 47 54 32 44.7 17 54 21.2 36.8 8 25.5 25.3 24.2 32 8Z" fill="#E31E24"/><path d="M32 15 36.4 26.2 48.2 27 39.1 34.7 42 46.2 32 40 22 46.2 24.9 34.7 15.8 27 27.6 26.2 32 15Z" fill="#fff"/></svg>`;case"techcombank":return`<svg ${i}><rect width="64" height="64" rx="14" fill="#E31B23"/><path d="M18 12h28l6 6v28l-6 6H18l-6-6V18l6-6Z" fill="#fff"/><path d="M22 20h20l2 2v20l-2 2H22l-2-2V22l2-2Z" fill="#E31B23"/><path d="M28 28h8v8h-8z" fill="#fff"/></svg>`;case"acb":return`<svg ${i}><rect width="64" height="64" rx="14" fill="#005BAC"/><path d="M32 9 55 51H9L32 9Z" fill="#00A3E0"/><path d="M32 20 45 44H19L32 20Z" fill="#fff"/><path d="M32 28 39 41H25L32 28Z" fill="#005BAC"/></svg>`;case"vpbank":return`<svg ${i}><rect width="64" height="64" rx="14" fill="#fff"/><path d="M14 16h15l8 31H22L14 16Z" fill="#009639"/><path d="M30 16h20L37 47 30 16Z" fill="#E30613"/><path d="M20 16h12l-6 14-6-14Z" fill="#7AC143"/></svg>`;case"vietinbank":return`<svg ${i}><rect width="64" height="64" rx="14" fill="#005BAA"/><circle cx="32" cy="32" r="21" fill="#fff"/><path d="M32 12a20 20 0 0 1 0 40 12 12 0 0 0 0-40Z" fill="#E31E24"/><path d="M32 12a12 12 0 0 0 0 40 20 20 0 0 1 0-40Z" fill="#005BAA"/></svg>`;case"agribank":return`<svg ${i}><rect width="64" height="64" rx="14" fill="#8B1E3F"/><path d="M32 9 54 31 32 55 10 31 32 9Z" fill="#C79B2B"/><path d="M32 17 46 31 32 47 18 31 32 17Z" fill="#8B1E3F"/><path d="M32 23 40 31 32 40 24 31 32 23Z" fill="#fff"/></svg>`;case"ocb":return`<svg ${i}><rect width="64" height="64" rx="14" fill="#00A651"/><path d="M17 18c10-9 26-6 32 6-6-5-15-4-21 2-6 6-7 15-2 21-12-6-15-20-9-29Z" fill="#fff"/><path d="M31 21c6-4 15-1 18 6-5-2-10-.8-14 3.2-4 4-5.2 9-3.2 14-7-3-9.8-12-.8-23.2Z" fill="#F7941D"/></svg>`;case"sacombank":return`<svg ${i}><rect width="64" height="64" rx="14" fill="#005BAA"/><path d="M12 40c11.7-18.8 28.4-24.4 40-16-10-1.2-19 4.2-27 16h27v9H12v-9Z" fill="#F7941D"/><path d="M12 28h28v8H12z" fill="#fff"/></svg>`;default:return`<svg ${i}><rect width="64" height="64" rx="14" fill="#111827"/><circle cx="32" cy="32" r="18" fill="#38BDF8"/></svg>`}}export{dr as default};
