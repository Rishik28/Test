const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 try {
 const context=await browser.newContext({hasTouch:true});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.clock.install();await page.goto(process.env.BASE_URL||'http://127.0.0.1:8080');
 const sizes=[[1440,900],[1366,768],[1024,768],[390,844],[375,667],[320,568],[844,390],[667,375]];
 for(const [width,height] of sizes){
  await page.setViewportSize({width,height});
  for(const tab of ['workers','upgrades']){
   await page.locator('#tab-'+tab).click();
   const result=await page.evaluate(()=>{
    const buttons=[...document.querySelectorAll('#shop-items button,#strike,#rebirth,#tab-workers,#tab-upgrades,#settings')];
    return {scroll:document.documentElement.scrollHeight>innerHeight||document.documentElement.scrollWidth>innerWidth,
     clipped:buttons.filter(b=>{const r=b.getBoundingClientRect();return r.top<0||r.bottom>innerHeight+.5||r.left<0||r.right>innerWidth+.5||r.width<1||r.height<1}).map(b=>b.id||b.dataset.upgrade||b.dataset.worker),
     cards:[...document.querySelectorAll('.worker-card')].filter(b=>{const r=b.getBoundingClientRect();return b.scrollHeight>r.height+2}).length};
   });
   assert.deepEqual(result,{scroll:false,clipped:[],cards:0},`${width}x${height} ${tab}: ${JSON.stringify(result)}`);
  }
 }
 await page.setViewportSize({width:390,height:844});await page.locator('#tab-workers').click();
 const target=await page.locator('#strike').boundingBox(),x=target.x+target.width/2,y=target.y+target.height/2;
 const balance=async()=>Number(await page.locator('#embers').textContent());
 await page.mouse.click(x,y);assert.equal(await balance(),1,'short tap gives one ember');
 await page.mouse.move(x,y);await page.mouse.down();await page.clock.runFor(1100);
 assert.ok(await page.locator('#scene').evaluate(e=>e.classList.contains('bursting')),'hold starts burst');
 await page.mouse.up();await page.clock.runFor(5100);
 assert.equal(await balance(),41,'five second burst awards exactly 40 strikes, with no release click');
 assert.match(await page.locator('#burst-status').textContent(),/recharging/);
 await page.clock.runFor(11000);
 await page.locator('#strike').focus();await page.keyboard.down('Space');await page.clock.runFor(1100);await page.keyboard.up('Space');await page.clock.runFor(5100);
 assert.equal(await balance(),81,'keyboard hold has matching burst reward');
 await page.clock.runFor(11000);await page.mouse.move(x,y);await page.mouse.down();await page.clock.runFor(300);
 await page.evaluate(()=>document.querySelector('#strike').dispatchEvent(new PointerEvent('pointercancel',{pointerId:1,isPrimary:true})));
 await page.mouse.up();await page.clock.runFor(1500);assert.equal(await balance(),81,'cancelled hold pays no currency');
 await page.touchscreen.tap(x,y);await page.clock.runFor(30);await page.touchscreen.tap(x,y);await page.clock.runFor(30);
 assert.equal(await balance(),83,'rapid taps register separately');
 assert.equal(await page.evaluate(()=>visualViewport.scale),1,'touch input preserves viewport scale');
 assert.equal(await page.locator('#strike').evaluate(e=>getComputedStyle(e).touchAction),'none');
 await page.clock.runFor(11000);await page.mouse.move(x,y);await page.mouse.down();await page.clock.runFor(7200);await page.mouse.up();await page.clock.runFor(100);
 assert.equal(await balance(),123,'holding beyond burst does not retrigger or grant a release strike');
 await page.clock.runFor(11000);await page.mouse.down();await page.clock.runFor(2100);
 await page.evaluate(()=>window.dispatchEvent(new Event('blur')));await page.mouse.up();
 const interrupted=await balance();await page.clock.runFor(6000);
 assert.equal(await balance(),interrupted,'blur stops burst and clears held input');
 assert.ok(interrupted>123&&interrupted<163,'interrupted burst only pays completed strikes');
 await page.screenshot({path:'/tmp/oddfolk-mobile.png',fullPage:true});
 await page.setViewportSize({width:1440,height:900});await page.screenshot({path:'/tmp/oddfolk-desktop.png',fullPage:true});
 await page.emulateMedia({reducedMotion:'reduce'});
 assert.equal(await page.locator('#strike .actor-sprite').evaluate(e=>getComputedStyle(e).animationName),'none');
 assert.deepEqual(errors,[]);console.log('Viewport, pointer/keyboard burst, cancellation, rapid touch and reduced-motion checks passed.');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
