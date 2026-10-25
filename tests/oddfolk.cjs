const assert=require('node:assert/strict');const {chromium}=require('playwright');
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});try{
 const page=await browser.newPage({viewport:{width:1440,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(process.env.BASE_URL);
 assert.match(await page.title(),/Oddfolk/);assert.equal(await page.locator('#embers').textContent(),'0');
 await page.locator('#bell-tap').click();assert.equal(await page.locator('#embers').textContent(),'1');
 await page.locator('#strike').click();assert.equal(await page.locator('#embers').textContent(),'2');
 const sprite=page.locator('#strike .actor-sprite');
 const frames=new Set();for(let i=0;i<5;i++){frames.add(await sprite.evaluate(e=>getComputedStyle(e).backgroundPosition));await page.waitForTimeout(130);}
 assert.ok(frames.size>=3,'interaction advances through distinct cel frames');
 await page.emulateMedia({reducedMotion:'reduce'});await page.locator('#strike').click();assert.equal(await sprite.evaluate(e=>getComputedStyle(e).animationName),'none');
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.addInitScript(()=>{const s=JSON.parse(localStorage.getItem('embergrove-save-v1'));Object.assign(s,{embers:1234,runEarned:54321,totalEarned:98765,clicks:77,seeds:4,prestiges:2,workers:{sprite:10,tender:3,fox:2,golem:1},upgrades:['hammer','coals'],savedAt:Date.now(),sound:false});localStorage.setItem('embergrove-save-v1',JSON.stringify(s));});
 await page.reload();assert.equal(await page.locator('[data-card="sprite"] .owned').textContent(),'10 owned');assert.equal(await page.locator('[data-card="sprite"] h3').textContent(),'Piper');
 assert.equal(await page.locator('#scene').getAttribute('data-stage'),'3');assert.equal(await page.locator('#seeds').textContent(),'4 renown points');
 for(const worker of ['tender','fox','golem'])assert.equal(await page.locator(`#villagers [data-worker="${worker}"]`).evaluate(e=>e.hidden),false);
 assert.equal(await page.locator('.festival-flags').evaluate(e=>getComputedStyle(e).display),'flex');
 await page.screenshot({path:'/tmp/oddfolk-desktop.png',fullPage:true});await page.setViewportSize({width:390,height:844});await page.screenshot({path:'/tmp/oddfolk-mobile.png',fullPage:true});
 assert.deepEqual(errors,[]);console.log('Oddfolk bell interaction, cel frames, reduced motion, legacy save and visible village progression passed.');
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
