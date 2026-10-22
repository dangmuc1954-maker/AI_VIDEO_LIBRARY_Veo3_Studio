async function t(r){if(!r)return null;try{return await r.checkIn()}catch{return r.getStatus().catch(()=>null)}}export{t as r};
