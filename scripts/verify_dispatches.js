const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/VideoStudio-frcr8V6s.js', 'utf8');

// 1. Muse AI dispatch
const museTarget = 'b.push({promptId:v.id,input:{title:v.prompt,type:"Video",providerId:pid,provider:"Muse AI",accountId:ot.accountId,account:Tt(ot),payload:{promptId:v.id,prompt:v.prompt,';
console.log('muse target found:', content.indexOf(museTarget) !== -1);

// 2. Grok dispatch
const grokTarget = 'b.push({promptId:v.id,input:{title:v.prompt,type:"Video",providerId:"grok",provider:"Grok",...ot?{accountId:ot.accountId,account:Tt(ot)}:{},payload:{promptId:v.id,prompt:v.prompt,';
console.log('grok target found:', content.indexOf(grokTarget) !== -1);

// 3. Veo3 dispatch
const veoTarget = 'b.push({promptId:v.id,input:{title:v.prompt,type:"Video",providerId:"veo3",provider:"Veo3",...$e?{accountId:$e.accountId,account:Tt($e)}:{},payload:{promptId:v.id,prompt:v.prompt,';
console.log('veo target found:', content.indexOf(veoTarget) !== -1);

// Modal detail positions
const modalDetailSnippet = 'j=s.prompt.trim()||n("videoStudio.blankPrompt")';
console.log('modal detail found:', content.indexOf(modalDetailSnippet) !== -1);

const playerHeaderSnippet = 'children:s.prompt||R("videoStudio.blankPrompt")';
console.log('player header found:', content.indexOf(playerHeaderSnippet) !== -1);
