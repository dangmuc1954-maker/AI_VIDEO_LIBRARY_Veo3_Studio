const fs = require('node:fs');
const path = require('node:path');

const mainPath = path.join(__dirname, '..', 'app', 'out', 'main', 'index.js');
let source = fs.readFileSync(mainPath, 'utf8');

function replaceOnce(before, after, description) {
  const first = source.indexOf(before);
  if (first === -1 && source.includes(after)) return;
  if (first === -1 || source.indexOf(before, first + before.length) !== -1) {
    throw new Error(`Expected one exact match for ${description}`);
  }
  source = source.slice(0, first) + after + source.slice(first + before.length);
}

replaceOnce(
  'if(o.length===0){const n=q();return this.store.patchAccount(e.accountId,{projectIds:[n],currentProjectId:n}),n}',
  'if(o.length===0)throw new p("PROVIDER_REJECTED","Google Flow did not provide a real project. Open Flow in Browser Hub, create or select a project, then retry.",!1,{reason:"FLOW_PROJECT_REQUIRED"});',
  'empty Google Flow project pool fallback'
);

replaceOnce(
  's||(s=q(),y("google-flow-project","project added to pool via client UUID fallback",{accountId:e.accountId,projectId:s,poolSize:n.length+1})),n.push(s)',
  's||(()=>{throw new p("PROVIDER_REJECTED","Google Flow could not create a real project. Open Flow in Browser Hub, create or select a project, then retry.",!1,{reason:"FLOW_PROJECT_REQUIRED"})})(),n.push(s)',
  'Google Flow project creation UUID fallback'
);

replaceOnce(
  'accountLocks=new Map;fetchRemoteProjects;',
  'accountLocks=new Map;verifiedAccounts=new Set;fetchRemoteProjects;',
  'per-session cache of verified Flow projects'
);

replaceOnce(
  'async ensureProjectPool(e,t){const A=this.store.getAccount(e.accountId)||e,o=new Set(A.invalidProjectIds||[]),n=this.readProjects(A).filter(s=>!o.has(s));if(n.length>=Dt){this.store.patchAccount(e.accountId,{projectIds:n});return}',
  'async ensureProjectPool(e,t){if(this.verifiedAccounts.has(e.accountId))return;const A=this.store.getAccount(e.accountId)||e,o=new Set(A.invalidProjectIds||[]),n=[];',
  'revalidation of previously cached Flow project ids'
);

replaceOnce(
  'if(n.length<Dt&&e.email){const s=this.store.findProjectsByEmail(e.email);for(const i of s)if(!n.includes(i)&&!o.has(i)&&(n.push(i),n.length>=Dt))break;n.length>0&&y("google-flow-project","reused existing projects for account",{accountId:e.accountId,email:e.email,poolSize:n.length})}',
  '',
  'reuse of unverified persisted project ids'
);

replaceOnce(
  'this.store.patchAccount(e.accountId,{projectIds:[...n],currentProjectId:a,projectCursor:Math.max(0,A.projectCursor??0)})}',
  'this.store.patchAccount(e.accountId,{projectIds:[...n],currentProjectId:a,projectCursor:Math.max(0,A.projectCursor??0)}),this.verifiedAccounts.add(e.accountId)}',
  'marking the refreshed project pool as verified for this app session'
);

replaceOnce(
  '||t.code==="CHALLENGE_REQUIRED"||t.code==="LIMIT_REACHED"',
  '||t.code==="LIMIT_REACHED"',
  'challenge classification as a retryable quota error'
);

replaceOnce(
  'if(t.code==="AUTH_REQUIRED"||t.code==="CHALLENGE_REQUIRED"){this.queue.pauseJobForRecovery',
  'if(t.code==="AUTH_REQUIRED"||t.code==="CHALLENGE_REQUIRED"){if(t.code==="CHALLENGE_REQUIRED")e.accountId&&this.onAccountFailure?.(e,t,15*60*1e3);this.queue.pauseJobForRecovery',
  'challenge recovery cooldown'
);

replaceOnce(
  't&&(T.markJobRuntimeCooldown(r.accountId,e.code,e.message,t),U.reassignQueuedAutoJobs(r.accountId,o=>{const n=Xn({...o,accountId:void 0,account:void 0});return n?.accountId?{accountId:n.accountId,account:n.account}:null},!0),$())',
  't&&(T.markJobRuntimeCooldown(r.accountId,e.code,e.message,t),e.code!=="CHALLENGE_REQUIRED"&&U.reassignQueuedAutoJobs(r.accountId,o=>{const n=Xn({...o,accountId:void 0,account:void 0});return n?.accountId?{accountId:n.accountId,account:n.account}:null},!0),$())',
  'challenge handling that reassigns queued jobs to more accounts'
);

fs.writeFileSync(mainPath, source, 'utf8');
console.log('Patched Flow project validation and unusual-activity recovery policy.');
