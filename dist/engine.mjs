export const WORKERS = [
 {id:'sprite',name:'Piper',role:'One small tune. A village full of possibility.',icon:'♪',base:15,rate:.2,color:'gold'},
 {id:'tender',name:'Dancer',role:'A happy little jig to lift everyone’s spirits.',icon:'♬',base:100,rate:1.5,color:'green'},
 {id:'fox',name:'Baker',role:'Warm bread and excellent company.',icon:'◒',base:650,rate:8,color:'orange'},
 {id:'golem',name:'Bell',role:'Ring out the good news across the square.',icon:'♩',base:4000,rate:40,color:'blue'}
];
export const UPGRADES = [
 {id:'hammer',name:'Wooden whistle',desc:'Double JOY from each tap.',cost:50,type:'click',factor:2},
 {id:'bellows',name:'Sunday songbook',desc:'Triple JOY from each tap.',cost:300,type:'click',factor:3},
 {id:'coals',name:'Dancing shoes',desc:'Double all villagers’ JOY production.',cost:750,type:'production',factor:2},
 {id:'moonhammer',name:'Silver flute',desc:'Four times the JOY per tap.',cost:2500,type:'click',factor:4},
 {id:'heart',name:'Village feast',desc:'Double all villagers’ JOY production.',cost:6000,type:'production',factor:2},
 {id:'star',name:'Grand festival',desc:'Triple all villagers’ JOY production.',cost:25000,type:'production',factor:3}
];
export function freshState(){return {version:1,embers:0,runEarned:0,totalEarned:0,clicks:0,seeds:0,prestiges:0,workers:Object.fromEntries(WORKERS.map(w=>[w.id,0])),upgrades:[],savedAt:Date.now(),sound:false};}
export const cost=(w,n)=>Math.ceil(w.base*Math.pow(1.15,n));
export function multiplier(s){return 1+s.seeds*.1;}
export function clickPower(s){return UPGRADES.filter(u=>u.type==='click'&&s.upgrades.includes(u.id)).reduce((n,u)=>n*u.factor,1)*multiplier(s);}
export function workerRate(s,w){const n=s.workers[w.id]||0;return n*w.rate*2**[10,25,50].filter(m=>n>=m).length;}
export function production(s){return WORKERS.reduce((v,w)=>v+workerRate(s,w),0)*UPGRADES.filter(u=>u.type==='production'&&s.upgrades.includes(u.id)).reduce((n,u)=>n*u.factor,1)*multiplier(s);}
export function earn(s,n){if(!Number.isFinite(n)||n<0)return;s.embers+=n;s.runEarned+=n;s.totalEarned+=n;}
export function strike(s){const n=clickPower(s);earn(s,n);s.clicks++;return n;}
export function buyWorker(s,id,quantity=1){const w=WORKERS.find(w=>w.id===id);if(!w)return 0;let bought=0;for(let i=0;i<Math.max(0,Math.min(Math.floor(quantity)||0,1000));i++){const p=cost(w,s.workers[id]);if(s.embers<p)break;s.embers-=p;s.workers[id]++;bought++;}return bought;}
export function buyUpgrade(s,id){const u=UPGRADES.find(u=>u.id===id);if(!u||s.upgrades.includes(id)||s.embers<u.cost)return false;s.embers-=u.cost;s.upgrades.push(id);return true;}
export function prestigeGain(s){return Math.floor(Math.sqrt(s.runEarned/100000));}
export function prestige(s){const gain=prestigeGain(s);if(gain<1)return false;const next=freshState();next.seeds=s.seeds+gain;next.prestiges=s.prestiges+1;next.totalEarned=s.totalEarned;next.sound=s.sound;Object.assign(s,next);return true;}
export function loadState(raw,now=Date.now()){const s=freshState();if(!raw||raw.version!==1)return {state:s,offline:0};for(const k of ['embers','runEarned','totalEarned','clicks','seeds','prestiges'])if(Number.isFinite(raw[k])&&raw[k]>=0)s[k]=Math.min(raw[k],1e100);for(const w of WORKERS)s.workers[w.id]=Number.isFinite(raw.workers?.[w.id])?Math.max(0,Math.min(10000,Math.floor(raw.workers[w.id]))):0;for(const k of ['clicks','seeds','prestiges'])s[k]=Math.floor(s[k]);s.upgrades=UPGRADES.filter(u=>Array.isArray(raw.upgrades)&&raw.upgrades.includes(u.id)).map(u=>u.id);s.sound=raw.sound===true;const elapsed=Number.isFinite(raw.savedAt)?Math.max(0,Math.min(8*3600,(now-raw.savedAt)/1000)):0;const offline=production(s)*elapsed;earn(s,offline);return {state:s,offline};}
