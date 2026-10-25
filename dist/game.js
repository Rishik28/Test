import {WORKERS,UPGRADES,freshState,cost,clickPower,production,strike,buyWorker,buyUpgrade,prestigeGain,prestige,earn,loadState} from './engine.mjs';
const $=id=>document.getElementById(id), KEY='embergrove-save-v1';
let state=freshState(), offline=0, quantity=1, tab='workers', toastTimer, audio;
let last=performance.now(),renderElapsed=0;
function advance(now=performance.now()){now=Math.max(last,now);const dt=Math.min(8*3600,Math.max(0,(now-last)/1000));last=now;earn(state,production(state)*dt);return dt;}
try{({state,offline}=loadState(JSON.parse(localStorage.getItem(KEY))));}catch{}
const fmt=n=>n<1000?new Intl.NumberFormat('en-US',{maximumFractionDigits:n<10?1:0}).format(n):new Intl.NumberFormat('en-US',{notation:'compact',maximumFractionDigits:1}).format(n);
function toast(message){$('toast').textContent=message;$('toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),4200);}
function save(){advance();state.savedAt=Date.now();try{localStorage.setItem(KEY,JSON.stringify(state));$('save-status').textContent='● Progress saved locally';return true;}catch{$('save-status').textContent='Local saving unavailable';return false;}}
function sound(){if(!state.sound)return;try{audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();const osc=audio.createOscillator(),gain=audio.createGain();osc.type='triangle';const note=[261.63,293.66,329.63,392,440,523.25][Math.floor(Math.random()*6)];osc.frequency.setValueAtTime(note,audio.currentTime);osc.frequency.exponentialRampToValueAtTime(note*.997,audio.currentTime+.18);gain.gain.setValueAtTime(.045,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.17);osc.connect(gain);gain.connect(audio.destination);osc.start();osc.stop(audio.currentTime+.18);}catch{}}
const piper=$('strike'), sceneElement=$('scene');
const playButtons=[piper,$('bell-tap')].filter(Boolean);
let activeButton=piper, playingTimer;
const HOLD_MS=1000, BURST_MS=5000, BURST_STRIKES=40, RECHARGE_MS=10000;
let chargeStart=null, burstStart=null, burstPaid=0, cooldownUntil=0, heldPointer=null, heldKey=null, heldTriggered=false, suppressClickUntil=0;
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
function haptic(pattern){try{navigator.vibrate?.(pattern);}catch{}}
function feedback(amount,e,burst=false){
 sceneElement.classList.add('playing');clearTimeout(playingTimer);playingTimer=setTimeout(()=>sceneElement.classList.remove('playing'),800);
 const scene=sceneElement.getBoundingClientRect();
 const x=e?.clientX!=null&&e.detail!==0?e.clientX-scene.left:scene.width*.5;
 const y=e?.clientY!=null&&e.detail!==0?e.clientY-scene.top:scene.height*.55;
 const p=document.createElement('span');p.className='float-ember';p.textContent='+'+fmt(amount);
 p.style.left=x+'px';p.style.top=y+'px';$('particles').append(p);setTimeout(()=>p.remove(),850);
 if(!reducedMotion.matches){
  sceneElement.classList.remove('impact');void sceneElement.offsetWidth;sceneElement.classList.add('impact');
  for(let i=0;i<(burst?7:12);i++){const spark=document.createElement('i');spark.className='hit-spark';spark.style.cssText=`left:${x}px;top:${y}px;--dx:${(Math.random()-.5)*160}px;--dy:${-30-Math.random()*110}px;--r:${Math.random()*300}deg`;$('particles').append(spark);setTimeout(()=>spark.remove(),650);}
 }
 if(!burst)haptic(8);sound();
}
function doStrike(e){advance();const amount=strike(state);feedback(amount,e);render();}
playButtons.forEach(button=>button.addEventListener('click',e=>{if(performance.now()<suppressClickUntil)return;activeButton=button;doStrike(e);}));
function beginCharge(){if(chargeStart!==null||burstStart!==null||performance.now()<cooldownUntil)return;chargeStart=performance.now();sceneElement.classList.add('charging');haptic(12);}
function cancelCharge(){chargeStart=null;sceneElement.classList.remove('charging');}
function startBurst(now){heldTriggered=true;cancelCharge();burstStart=now;burstPaid=0;suppressClickUntil=now+BURST_MS+400;sceneElement.classList.add('bursting');haptic([25,30,50]);$('burst-status').textContent='JOY BURST · 5.0s';}
function stopBurst(now){burstStart=null;sceneElement.classList.remove('bursting');cooldownUntil=now+RECHARGE_MS;save();render();}
function updateBurst(now){
 if(chargeStart!==null){const fraction=Math.min(1,(now-chargeStart)/HOLD_MS);$('burst-fill').style.width=fraction*100+'%';$('burst-status').textContent='Charging · keep holding';if(fraction>=1)startBurst(now);}
 if(burstStart!==null){
  const elapsed=Math.max(0,now-burstStart), due=Math.min(BURST_STRIKES,Math.floor(elapsed/BURST_MS*BURST_STRIKES));
  const count=due-burstPaid;if(count>0){const amount=clickPower(state)*count;earn(state,amount);state.clicks+=count;burstPaid=due;feedback(amount,null,true);}
  $('burst-fill').style.width=Math.max(0,1-elapsed/BURST_MS)*100+'%';
  $('burst-status').textContent='JOY BURST · '+Math.max(0,(BURST_MS-elapsed)/1000).toFixed(1)+'s';
  if(elapsed>=BURST_MS)stopBurst(now);
 }else if(chargeStart===null){const remaining=Math.max(0,cooldownUntil-now);$('burst-fill').style.width=(remaining?1-remaining/RECHARGE_MS:1)*100+'%';$('burst-status').textContent=remaining?'Encore recharging · '+Math.ceil(remaining/1000)+'s':'Hold 1s → 5s JOY burst';}
}
playButtons.forEach(button=>{
 button.addEventListener('pointerdown',e=>{if(!e.isPrimary||e.button!==0||heldPointer!==null||heldKey!==null)return;activeButton=button;heldPointer=e.pointerId;heldTriggered=false;button.setPointerCapture(e.pointerId);button.classList.add('pressed');beginCharge();});
 button.addEventListener('pointerup',releasePointer);
 button.addEventListener('pointercancel',e=>{releasePointer(e);suppressClickUntil=performance.now()+400;});
 button.addEventListener('lostpointercapture',e=>{if(e.pointerId===heldPointer)releasePointer(e);});
 button.addEventListener('contextmenu',e=>e.preventDefault());
});
function releasePointer(e){if(e.pointerId!==heldPointer)return;if(heldTriggered)suppressClickUntil=performance.now()+400;heldPointer=null;cancelCharge();activeButton.classList.remove('pressed');}
document.addEventListener('keydown',e=>{if(!['Space','Enter'].includes(e.code)||$('settings-dialog').open||!['BODY','HTML'].includes(document.activeElement.tagName)&&!playButtons.includes(document.activeElement))return;e.preventDefault();if(e.repeat||heldKey||heldPointer!==null)return;activeButton=playButtons.includes(document.activeElement)?document.activeElement:piper;heldKey=e.code;heldTriggered=false;activeButton.classList.add('pressed');beginCharge();});
document.addEventListener('keyup',e=>{if(e.code!==heldKey)return;e.preventDefault();const wasCharging=chargeStart!==null;heldKey=null;cancelCharge();activeButton.classList.remove('pressed');if(!heldTriggered&&(wasCharging||burstStart===null&&performance.now()>=suppressClickUntil))doStrike();});
function clearHeldInput(){if(heldPointer!==null||heldKey!==null)suppressClickUntil=Math.max(suppressClickUntil,performance.now()+400);heldPointer=null;heldKey=null;cancelCharge();playButtons.forEach(button=>button.classList.remove('pressed'));if(burstStart!==null)stopBurst(performance.now());}
window.addEventListener('blur',clearHeldInput);
document.addEventListener('visibilitychange',()=>{if(document.hidden)clearHeldInput();});
function resetBurst(){clearHeldInput();cooldownUntil=0;suppressClickUntil=0;}
function totalCost(w){let sum=0;for(let i=0;i<quantity;i++)sum+=cost(w,state.workers[w.id]+i);return sum;}
let shopSignature='';
function renderShop(){$('shop-items').dataset.view=tab;const signature=tab+quantity+JSON.stringify(state.workers)+state.upgrades.join(',');if(signature!==shopSignature){shopSignature=signature;$('shop-items').innerHTML=tab==='workers'?WORKERS.map(w=>`<article class="worker-card" data-card="${w.id}"><div class="worker-icon ${w.color}" aria-hidden="true">${w.id==='sprite'||w.id==='tender'?`<span class="actor-sprite ${w.id==='sprite'?'piper':'dancer'}"></span>`:w.icon}</div><div><div class="worker-title"><h3>${w.name}</h3><span class="owned">${state.workers[w.id]} owned</span></div><p class="worker-desc">${w.role}</p><div class="worker-bottom"><span class="worker-rate">+${fmt(w.rate)} <small>JOY / sec each</small></span><button class="buy-button" data-worker="${w.id}" aria-label="Buy ${quantity} ${w.name}"></button></div></div></article>`).join(''):UPGRADES.map((u,i)=>`<article class="worker-card ${state.upgrades.includes(u.id)?'purchased':''}" data-card="${u.id}"><div class="worker-icon ${['gold','orange','green','blue'][i%4]}" aria-hidden="true">${['♪','♬','♩','♫','◒','✿'][i]}</div><div><div class="worker-title"><h3>${u.name}</h3>${state.upgrades.includes(u.id)?'<span class="owned">OWNED</span>':''}</div><p class="worker-desc">${u.desc}</p><div class="worker-bottom"><span class="worker-rate">${u.type==='click'?'Tap power':'All villagers'} ×${u.factor}</span><button class="buy-button" data-upgrade="${u.id}" aria-label="Buy ${u.name}"></button></div></div></article>`).join('');}
if(tab==='workers')for(const w of WORKERS){const btn=document.querySelector(`button[data-worker="${w.id}"]`),price=totalCost(w);btn.textContent=fmt(price)+' JOY';btn.disabled=state.embers<price;btn.closest('article').classList.toggle('unaffordable',btn.disabled);}
else for(const u of UPGRADES){const btn=document.querySelector(`[data-upgrade="${u.id}"]`),owned=state.upgrades.includes(u.id);btn.textContent=owned?'Acquired':fmt(u.cost)+' JOY';btn.disabled=owned||state.embers<u.cost;btn.closest('article').classList.toggle('unaffordable',btn.disabled&&!owned);}
}
$('shop-items').addEventListener('click',e=>{const btn=e.target.closest('button');if(!btn)return;advance();if(btn.dataset.worker){const w=WORKERS.find(w=>w.id===btn.dataset.worker);const old=state.workers[w.id];if(state.embers<totalCost(w))return;const n=buyWorker(state,w.id,quantity);if(n){toast(`${n===1?w.name:n+' '+w.name+' villagers'} joined the village.`);for(const m of [10,25,50])if(old<m&&state.workers[w.id]>=m)toast(`${w.name} milestone! This villager’s JOY production doubled.`);}}else if(btn.dataset.upgrade&&buyUpgrade(state,btn.dataset.upgrade))toast('A new reason for the village to smile.');save();render();});
$('quantities').addEventListener('click',e=>{const btn=e.target.closest('[data-qty]');if(!btn)return;quantity=Number(btn.dataset.qty);document.querySelectorAll('[data-qty]').forEach(b=>b.classList.toggle('active',b===btn));renderShop();});
function setTab(t){tab=t;for(const name of ['workers','upgrades']){$('tab-'+name).classList.toggle('active',t===name);$('tab-'+name).setAttribute('aria-selected',String(t===name));}$('quantities').style.visibility=t==='workers'?'visible':'hidden';$('shop-label').textContent=t==='workers'?'JOY FROM YOUR VILLAGERS':'LITTLE THINGS, BIG FEELINGS';renderShop();}
$('tab-workers').onclick=()=>setTab('workers');$('tab-upgrades').onclick=()=>setTab('upgrades');
const milestones=[{at:100,name:'A first little tune',icon:'✧'},{at:1000,name:'A friendly gathering',icon:'♣'},{at:10000,name:'The square comes alive',icon:'♫'},{at:100000,name:'A village celebration',icon:'❋'},{at:1000000,name:'A very grand parade',icon:'✦'},{at:10000000,name:'A joy for the ages',icon:'♛'}];
$('milestones').innerHTML=milestones.map(m=>`<span class="milestone" title="${m.name}: ${fmt(m.at)} lifetime JOY" aria-label="${m.name}: ${fmt(m.at)} lifetime JOY">${m.icon}</span>`).join('');
function render(){
 const population=Object.values(state.workers).reduce((sum,count)=>sum+count,0);
 const stage=population>=15||state.runEarned>=10000?3:population>=5||state.runEarned>=1000?2:population>=1?1:0;
 sceneElement.dataset.stage=String(stage);sceneElement.dataset.population=String(population);
 const villagers=$('villagers');if(villagers)for(const actor of villagers.querySelectorAll('[data-worker]')){const owned=state.workers[actor.dataset.worker]||0;actor.hidden=owned===0;actor.dataset.count=String(owned);}
 $('embers').textContent=fmt(state.embers);$('rate').textContent=fmt(production(state));$('click-power').textContent='+'+fmt(clickPower(state));$('upgrade-count').textContent=UPGRADES.length-state.upgrades.length;const unlocked=milestones.filter(m=>state.totalEarned>=m.at).length;$('milestone-count').textContent=`${unlocked} / 6 discovered`;document.querySelectorAll('.milestone').forEach((el,i)=>el.classList.toggle('unlocked',state.totalEarned>=milestones[i].at));const next=milestones.find(m=>state.totalEarned<m.at);$('milestone-text').textContent=next?`${next.name} · Gather ${fmt(next.at)} JOY`:'A joy for the ages · All milestones discovered';$('milestone-progress').textContent=next?`${fmt(state.totalEarned)} / ${fmt(next.at)}`:'6 / 6';$('milestone-fill').style.width=(next?Math.min(100,state.totalEarned/next.at*100):100)+'%';const gain=prestigeGain(state);$('rebirth').disabled=gain<1;$('rebirth-copy').textContent=gain?`Reprise for ${fmt(gain)} renown point${gain===1?'':'s'}. The next village gathering grows livelier.`:'Gather 100K JOY this round to begin a Reprise.';$('seeds').textContent=`${fmt(state.seeds)} renown point${state.seeds===1?'':'s'}`;$('seed-bonus').textContent=state.seeds?`+${fmt(state.seeds*10)}% permanent JOY from taps and villagers.`:'Your next chapter is waiting.';$('chapter-title').textContent=state.prestiges?'A familiar melody':state.totalEarned>=10000?'The square comes alive':state.totalEarned>=1000?'Good company':'A little village';$('chapter-sub').textContent=state.prestiges?'Chapter IV · A joyful Reprise':state.totalEarned>=10000?'Chapter III · The village festival':state.totalEarned>=1000?'Chapter II · Better together':'Chapter I · A first little tune';$('sound').textContent=state.sound?'♫':'♪';$('sound').setAttribute('aria-label',state.sound?'Mute sound':'Enable sound');$('sound').setAttribute('aria-pressed',String(state.sound));renderShop();}
$('rebirth').onclick=()=>{advance();const gain=prestigeGain(state);if(gain<1)return;if(confirm(`Begin a village Reprise for ${gain} renown point${gain===1?'':'s'}?\n\nJOY, villagers, and upgrades will reset. Your renown and lifetime milestones remain. Each renown point adds 10% to all future JOY.`)){resetBurst();prestige(state);last=performance.now();save();render();toast('A new round. A familiar little tune.');}};
$('sound').onclick=()=>{state.sound=!state.sound;sound();save();render();};$('settings').onclick=()=>{clearHeldInput();$('settings-dialog').showModal();};$('settings-dialog').addEventListener('click',e=>{if(e.target===$('settings-dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
$('save-now').onclick=()=>toast(save()?'Your village is safely saved.':'Saving is unavailable. Export a copy to keep your progress.');
$('export-save').onclick=()=>{save();const url=URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='oddfolk-save.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('A little piece of Oddfolk, to keep.');};
$('import-save').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>100000)throw Error();const raw=JSON.parse(await file.text());if(raw.version!==1||!raw.workers||!Array.isArray(raw.upgrades))throw Error();if(!confirm('Replace your current village with this saved gathering?'))return;resetBurst();({state}=loadState(raw));last=performance.now();save();render();toast('Welcome back to Oddfolk.');}catch{toast('That save could not be read. Please choose an Oddfolk save file.');}finally{e.target.value='';}};
$('reset').onclick=()=>{if(confirm('Start a completely new village? All progress, including renown points, will be erased. Export your save first if you want to keep it.')){resetBurst();state=freshState();last=performance.now();save();render();$('settings-dialog').close();toast('Every village starts with one little tune.');}};
function tick(now){const dt=advance(now);updateBurst(now);renderElapsed+=dt;if(renderElapsed>=.15){render();renderElapsed=0;}requestAnimationFrame(tick);}render();requestAnimationFrame(tick);setInterval(save,5000);window.addEventListener('pagehide',save);document.addEventListener('visibilitychange',()=>{if(document.hidden)save();});
if(offline>=1)setTimeout(()=>toast(`While you were away, your villagers shared ${fmt(offline)} JOY. Welcome home.`),600);save();
