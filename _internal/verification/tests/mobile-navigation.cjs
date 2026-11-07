// 실제 브라우저 입력으로 확인합니다. PLAYWRIGHT_MODULE, BASE_URL로 실행 환경을 지정합니다.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const base = process.env.BASE_URL || 'http://127.0.0.1:4173';
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
async function swipe(client, x, from, to, steps = 12, interval = 16) {
 await client.send('Input.dispatchTouchEvent', { type:'touchStart', touchPoints:[{x,y:from}] });
 for(let i=1;i<=steps;i++) {
  await client.send('Input.dispatchTouchEvent', { type:'touchMove', touchPoints:[{x,y:from+(to-from)*i/steps}] });
  await pause(interval);
 }
 await client.send('Input.dispatchTouchEvent', { type:'touchEnd', touchPoints:[] });
 await pause(600);
}
async function active(page, index) {
 const result = await page.evaluate(() => {
  const pages = [...document.querySelectorAll('.page-track>section')];
  const current = pages.find(p => p.classList.contains('in-view'));
  return {index:pages.indexOf(current), top:current?.getBoundingClientRect().top, root:document.scrollingElement.scrollTop};
 });
 assert.equal(result.index,index,JSON.stringify(result));
 assert.equal(Math.round(result.top),0);
 assert.equal(result.root,0);
}
(async()=> {
 const browser = await chromium.launch({executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium', args:['--no-sandbox']});
 try {
  for(const viewport of [{width:393,height:752},{width:402,height:874},{width:430,height:932}]) {
   const page = await browser.newPage({viewport,isMobile:true,hasTouch:true});
   const errors=[]; page.on('pageerror',e=>errors.push(e.message));
   await page.goto(base); await page.evaluate(()=>document.fonts.ready); await pause(2500);
   const client = await page.context().newCDPSession(page);
   // 카드 위에서 스와이프를 시작하고 모든 페이지를 왕복합니다.
   for(let i=1;i<6;i++) {
    await swipe(client,200,viewport.height*.76,viewport.height*.3);
    await active(page,i);
   }
   await page.locator('.bottom-attendance').tap();
   assert.equal(await page.locator('.rsvp-form-panel').isVisible(),true);
   await page.locator('.attendance-dialog').evaluate(e=>e.scrollTop=0);
   const dialogBefore=0;
   await swipe(client,200,viewport.height*.7,viewport.height*.3);
   await active(page,5);
   const dialogScroll = await page.locator('.attendance-dialog').evaluate(e=>({top:e.scrollTop,height:e.clientHeight,total:e.scrollHeight}));
   assert.ok(dialogScroll.top>dialogBefore || dialogScroll.total<=dialogScroll.height, JSON.stringify(dialogScroll));
   await page.locator('.close-attendance').evaluate(e=>e.scrollIntoView());
   await page.locator('.close-attendance').tap();
   for(let i=4;i>=0;i--) {
    await swipe(client,200,viewport.height*.3,viewport.height*.76);
    await active(page,i);
   }
   // 짧은 제스처, 느린 제스처, 제목 위에서 시작하는 동작도 확인합니다.
   await swipe(client,200,150,90,3,10); await active(page,1);
   await swipe(client,200,150,230,16,30); await active(page,0);
   await pause(2500);
   const card = await page.locator('.illustration-card').boundingBox();
   await page.touchscreen.tap(card.x + card.width/2,card.y + card.height/2);
   assert.equal(await page.locator('.attendance-dialog').evaluate(e=>e.open),true);
   await page.locator('.close-attendance').tap();
   await swipe(client,200,viewport.height*.7,viewport.height*.3); await active(page,1);
   assert.deepEqual(errors,[]);
   console.log('PASS mobile round trip, short/slow swipes, card tap, popup scrolling:',viewport);
   await page.close();
  }
  const page=await browser.newPage({viewport:{width:402,height:874},isMobile:true,hasTouch:true});
  await page.route('**/config.js',async route=>{const r=await route.fetch();await route.fulfill({response:r,body:await r.text()+'\nwindow.invitation.galleryCount=12;window.invitation.gallery=[...window.invitation.gallery,...window.invitation.gallery];'});});
  await page.goto(base);const client=await page.context().newCDPSession(page);
  await swipe(client,200,650,300);await swipe(client,200,650,300);await active(page,2);
  await swipe(client,200,650,300);await active(page,2);
  assert.ok(await page.locator('.gallery-section').evaluate(e=>e.scrollTop)>100);
  await page.locator('.gallery-section').evaluate(e=>e.scrollTop=e.scrollHeight);
  await swipe(client,200,650,300);await active(page,3);
  console.log('PASS long gallery touch scrolling and exit at boundary');
 } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
