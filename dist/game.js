import {WORKERS,UPGRADES,freshState,cost,clickPower,production,strike,buyWorker,buyUpgrade,prestigeGain,prestige,earn,loadState} from './engine.mjs';
const $=id=>document.getElementById(id), KEY='embergrove-save-v1';
let state=freshState(), offline=0, quantity=1, tab='workers', toastTimer, audio;
let last=performance.now(),renderElapsed=0;
function advance(now=performance.now()){now=Math.max(last,now);const dt=Math.min(8*3600,Math.max(0,(now-last)/1000));last=now;earn(state,production(state)*dt);return dt;}
try{({state,offline}=loadState(JSON.parse(localStorage.getItem(KEY))));}catch{}
const fmt=n=>n<1000?new Intl.NumberFormat('en-US',{maximumFractionDigits:n<10?1:0}).format(n):new Intl.NumberFormat('en-US',{notation:'compact',maximumFractionDigits:1}).format(n);
function toast(message){$('toast').textContent=message;$('toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),4200);}
function save(){advance();state.savedAt=Date.now();try{localStorage.setItem(KEY,JSON.stringify(state));$('save-status').textContent='● Progress saved locally';return true;}catch{$('save-status').textContent='Local saving unavailable';return false;}}
function sound(){if(!state.sound)return;try{audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();const osc=audio.createOscillator(),gain=audio.createGain();osc.type='triangle';osc.frequency.setValueAtTime(420+Math.random()*140,audio.currentTime);osc.frequency.exponentialRampToValueAtTime(180,audio.currentTime+.13);gain.gain.setValueAtTime(.045,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.17);osc.connect(gain);gain.connect(audio.destination);osc.start();osc.stop(audio.currentTime+.18);}catch{}}
const forge=$('strike'), sceneElement=$('scene');
const HOLD_MS=1000, BURST_MS=5000, BURST_STRIKES=40, RECHARGE_MS=10000;
let chargeStart=null, burstStart=null, burstPaid=0, cooldownUntil=0, heldPointer=null, heldKey=null, heldTriggered=false, suppressClickUntil=0;
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
function haptic(pattern){try{navigator.vibrate?.(pattern);}catch{}}
function feedback(amount,e,burst=false){
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
forge.addEventListener('click',e=>{if(performance.now()<suppressClickUntil)return;doStrike(e);});
function beginCharge(){if(chargeStart!==null||burstStart!==null||performance.now()<cooldownUntil)return;chargeStart=performance.now();sceneElement.classList.add('charging');haptic(12);}
function cancelCharge(){chargeStart=null;sceneElement.classList.remove('charging');}
function startBurst(now){heldTriggered=true;cancelCharge();burstStart=now;burstPaid=0;suppressClickUntil=now+BURST_MS+400;sceneElement.classList.add('bursting');haptic([25,30,50]);$('burst-status').textContent='EMBER BURST · 5.0s';}
function stopBurst(now){burstStart=null;sceneElement.classList.remove('bursting');cooldownUntil=now+RECHARGE_MS;save();}
function updateBurst(now){
 if(chargeStart!==null){const fraction=Math.min(1,(now-chargeStart)/HOLD_MS);$('burst-fill').style.width=fraction*100+'%';$('burst-status').textContent='Charging · keep holding';if(fraction>=1)startBurst(now);}
 if(burstStart!==null){
  const elapsed=Math.max(0,now-burstStart), due=Math.min(BURST_STRIKES,Math.floor(elapsed/BURST_MS*BURST_STRIKES));
  const count=due-burstPaid;if(count>0){const amount=clickPower(state)*count;earn(state,amount);state.clicks+=count;burstPaid=due;feedback(amount,null,true);}
  $('burst-fill').style.width=Math.max(0,1-elapsed/BURST_MS)*100+'%';
  $('burst-status').textContent='EMBER BURST · '+Math.max(0,(BURST_MS-elapsed)/1000).toFixed(1)+'s';
  if(elapsed>=BURST_MS)stopBurst(now);
 }else if(chargeStart===null){const remaining=Math.max(0,cooldownUntil-now);$('burst-fill').style.width=(remaining?1-remaining/RECHARGE_MS:1)*100+'%';$('burst-status').textContent=remaining?'Burst recharging · '+Math.ceil(remaining/1000)+'s':'Hold 1s → 5s ember burst';}
}
forge.addEventListener('pointerdown',e=>{if(!e.isPrimary||e.button!==0||heldPointer!==null||heldKey!==null)return;heldPointer=e.pointerId;heldTriggered=false;forge.setPointerCapture(e.pointerId);forge.classList.add('pressed');beginCharge();});
function releasePointer(e){if(e.pointerId!==heldPointer)return;if(heldTriggered)suppressClickUntil=performance.now()+400;heldPointer=null;cancelCharge();forge.classList.remove('pressed');}
forge.addEventListener('pointerup',releasePointer);
forge.addEventListener('pointercancel',e=>{releasePointer(e);suppressClickUntil=performance.now()+400;});
forge.addEventListener('lostpointercapture',e=>{if(e.pointerId===heldPointer)releasePointer(e);});
forge.addEventListener('contextmenu',e=>e.preventDefault());
document.addEventListener('keydown',e=>{if(!['Space','Enter'].includes(e.code)||$('settings-dialog').open||!['BODY','HTML'].includes(document.activeElement.tagName)&&document.activeElement!==forge)return;e.preventDefault();if(e.repeat||heldKey||heldPointer!==null)return;heldKey=e.code;heldTriggered=false;forge.classList.add('pressed');beginCharge();});
document.addEventListener('keyup',e=>{if(e.code!==heldKey)return;e.preventDefault();const wasCharging=chargeStart!==null;heldKey=null;cancelCharge();forge.classList.remove('pressed');if(!heldTriggered&&(wasCharging||burstStart===null&&performance.now()>=suppressClickUntil))doStrike();});
function clearHeldInput(){heldPointer=null;heldKey=null;cancelCharge();forge.classList.remove('pressed');if(burstStart!==null)stopBurst(performance.now());}
window.addEventListener('blur',clearHeldInput);
document.addEventListener('visibilitychange',()=>{if(document.hidden)clearHeldInput();});
function resetBurst(){clearHeldInput();cooldownUntil=0;suppressClickUntil=0;}
function totalCost(w){let sum=0;for(let i=0;i<quantity;i++)sum+=cost(w,state.workers[w.id]+i);return sum;}
let shopSignature='';
function renderShop(){$('shop-items').dataset.view=tab;const signature=tab+quantity+JSON.stringify(state.workers)+state.upgrades.join(',');if(signature!==shopSignature){shopSignature=signature;$('shop-items').innerHTML=tab==='workers'?WORKERS.map(w=>`<article class="worker-card" data-card="${w.id}"><div class="worker-icon ${w.color}" aria-hidden="true">${w.icon}</div><div><div class="worker-title"><h3>${w.name}</h3><span class="owned">${state.workers[w.id]} owned</span></div><p class="worker-desc">${w.role}</p><div class="worker-bottom"><span class="worker-rate">+${fmt(w.rate)} <small>/ sec each</small></span><button class="buy-button" data-worker="${w.id}" aria-label="Buy ${quantity} ${w.name}"></button></div></div></article>`).join(''):UPGRADES.map((u,i)=>`<article class="worker-card ${state.upgrades.includes(u.id)?'purchased':''}" data-card="${u.id}"><div class="worker-icon ${['gold','orange','green','blue'][i%4]}" aria-hidden="true">${['⚒','✧','◆','⚒','▣','✦'][i]}</div><div><div class="worker-title"><h3>${u.name}</h3>${state.upgrades.includes(u.id)?'<span class="owned">OWNED</span>':''}</div><p class="worker-desc">${u.desc}</p><div class="worker-bottom"><span class="worker-rate">${u.type==='click'?'Strike power':'All companions'} ×${u.factor}</span><button class="buy-button" data-upgrade="${u.id}" aria-label="Buy ${u.name}"></button></div></div></article>`).join('');}
if(tab==='workers')for(const w of WORKERS){const btn=document.querySelector(`[data-worker="${w.id}"]`),price=totalCost(w);btn.textContent='◆ '+fmt(price);btn.disabled=state.embers<price;btn.closest('article').classList.toggle('unaffordable',btn.disabled);}
else for(const u of UPGRADES){const btn=document.querySelector(`[data-upgrade="${u.id}"]`),owned=state.upgrades.includes(u.id);btn.textContent=owned?'Acquired':'◆ '+fmt(u.cost);btn.disabled=owned||state.embers<u.cost;btn.closest('article').classList.toggle('unaffordable',btn.disabled&&!owned);}
}
$('shop-items').addEventListener('click',e=>{const btn=e.target.closest('button');if(!btn)return;advance();if(btn.dataset.worker){const w=WORKERS.find(w=>w.id===btn.dataset.worker);const old=state.workers[w.id];if(state.embers<totalCost(w))return;const n=buyWorker(state,w.id,quantity);if(n){toast(`${n===1?w.name:n+' '+w.name+' companions'} joined the grove.`);for(const m of [10,25,50])if(old<m&&state.workers[w.id]>=m)toast(`${w.name} milestone! This companion’s production doubled.`);}}else if(btn.dataset.upgrade&&buyUpgrade(state,btn.dataset.upgrade))toast('A little more magic for the forge.');save();render();});
$('quantities').addEventListener('click',e=>{const btn=e.target.closest('[data-qty]');if(!btn)return;quantity=Number(btn.dataset.qty);document.querySelectorAll('[data-qty]').forEach(b=>b.classList.toggle('active',b===btn));renderShop();});
function setTab(t){tab=t;for(const name of ['workers','upgrades']){$('tab-'+name).classList.toggle('active',t===name);$('tab-'+name).setAttribute('aria-selected',String(t===name));}$('quantities').style.visibility=t==='workers'?'visible':'hidden';$('shop-label').textContent=t==='workers'?'PASSIVE EMBER PRODUCTION':'A LITTLE ANCIENT KNOW-HOW';renderShop();}
$('tab-workers').onclick=()=>setTab('workers');$('tab-upgrades').onclick=()=>setTab('upgrades');
const milestones=[{at:100,name:'First light',icon:'✧'},{at:1000,name:'A warmer welcome',icon:'♣'},{at:10000,name:'The grove awakens',icon:'⚒'},{at:100000,name:'Ancient magic',icon:'❋'},{at:1000000,name:'A forest of fireflies',icon:'✦'},{at:10000000,name:'An everlasting flame',icon:'♛'}];
$('milestones').innerHTML=milestones.map(m=>`<span class="milestone" title="${m.name}: ${fmt(m.at)} lifetime embers" aria-label="${m.name}: ${fmt(m.at)} lifetime embers">${m.icon}</span>`).join('');
function render(){$('embers').textContent=fmt(state.embers);$('rate').textContent=fmt(production(state));$('click-power').textContent='+'+fmt(clickPower(state));$('upgrade-count').textContent=UPGRADES.length-state.upgrades.length;const unlocked=milestones.filter(m=>state.totalEarned>=m.at).length;$('milestone-count').textContent=`${unlocked} / 6 discovered`;document.querySelectorAll('.milestone').forEach((el,i)=>el.classList.toggle('unlocked',state.totalEarned>=milestones[i].at));const next=milestones.find(m=>state.totalEarned<m.at);$('milestone-text').textContent=next?`${next.name} · Gather ${fmt(next.at)} embers`:'An everlasting flame · All milestones discovered';$('milestone-progress').textContent=next?`${fmt(state.totalEarned)} / ${fmt(next.at)}`:'6 / 6';$('milestone-fill').style.width=(next?Math.min(100,state.totalEarned/next.at*100):100)+'%';const gain=prestigeGain(state);$('rebirth').disabled=gain<1;$('rebirth-copy').textContent=gain?`Rekindle for ${fmt(gain)} ancient seed${gain===1?'':'s'}. Your next grove grows stronger.`:'Gather 100K embers in one journey to awaken the grove.';$('seeds').textContent=`${fmt(state.seeds)} ancient seed${state.seeds===1?'':'s'}`;$('seed-bonus').textContent=state.seeds?`+${fmt(state.seeds*10)}% permanent ember production.`:'Your next chapter is waiting.';$('chapter-title').textContent=state.prestiges?'An ancient promise':state.totalEarned>=10000?'The grove awakens':state.totalEarned>=1000?'Kindred spirits':'A new beginning';$('chapter-sub').textContent=state.prestiges?'Chapter IV · An everlasting flame':state.totalEarned>=10000?'Chapter III · The living forest':state.totalEarned>=1000?'Chapter II · Better together':'Chapter I · The first flame';$('sound').textContent=state.sound?'♫':'♪';$('sound').setAttribute('aria-label',state.sound?'Mute sound':'Enable sound');$('sound').setAttribute('aria-pressed',String(state.sound));renderShop();}
$('rebirth').onclick=()=>{advance();const gain=prestigeGain(state);if(gain<1)return;if(confirm(`Rekindle the grove for ${gain} ancient seed${gain===1?'':'s'}?\n\nEmbers, companions, and upgrades will reset. Your seeds and lifetime milestones remain. Each seed adds 10% to all future income.`)){resetBurst();prestige(state);last=performance.now();save();render();toast('A new beginning. A brighter flame.');}};
$('sound').onclick=()=>{state.sound=!state.sound;sound();save();render();};$('settings').onclick=()=>{clearHeldInput();$('settings-dialog').showModal();};$('settings-dialog').addEventListener('click',e=>{if(e.target===$('settings-dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
$('save-now').onclick=()=>toast(save()?'Your grove is safely saved.':'Saving is unavailable. Export a copy to keep your progress.');
$('export-save').onclick=()=>{save();const url=URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='embergrove-save.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('A little piece of the grove, to keep.');};
$('import-save').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>100000)throw Error();const raw=JSON.parse(await file.text());if(raw.version!==1||!raw.workers||!Array.isArray(raw.upgrades))throw Error();if(!confirm('Replace your current grove with this saved journey?'))return;resetBurst();({state}=loadState(raw));last=performance.now();save();render();toast('Welcome back to your grove.');}catch{toast('That save could not be read. Please choose an Embergrove save file.');}finally{e.target.value='';}};
$('reset').onclick=()=>{if(confirm('Start a completely new grove? All progress, including ancient seeds, will be erased. Export your save first if you want to keep it.')){resetBurst();state=freshState();last=performance.now();save();render();$('settings-dialog').close();toast('Every legend starts with a little spark.');}};
function tick(now){const dt=advance(now);updateBurst(now);renderElapsed+=dt;if(renderElapsed>=.15){render();renderElapsed=0;}requestAnimationFrame(tick);}render();requestAnimationFrame(tick);setInterval(save,5000);window.addEventListener('pagehide',save);document.addEventListener('visibilitychange',()=>{if(document.hidden)save();});
if(offline>=1)setTimeout(()=>toast(`While you were away, your companions gathered ${fmt(offline)} embers. Welcome home.`),600);save();
