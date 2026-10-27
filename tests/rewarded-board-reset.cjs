const fs=require('fs'),assert=require('assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{
const browser=await chromium.launch(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox']}:{channel:'chrome'});
try{
 const page=await browser.newPage({viewport:{width:393,height:851}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const source=fs.readFileSync('index.html','utf8').replace('})();</script>','window.__testEval=code=>eval(code);})();</script>');
 await page.route('http://jewel.test/**',r=>r.fulfill({contentType:'text/html',body:source}));await page.goto('http://jewel.test/');
 const run=code=>page.evaluate(code=>window.__testEval(code),code);
 await run('state=fresh(12345);state.score=1000;state.feverTurns=3;state.board[0]=1;state.gems[0]="quartz";render()');
 const state=()=>run('JSON.stringify(state)'),saved=()=>page.evaluate(()=>JSON.stringify(localStorage));
 const initial=await state(),initialSave=await saved();
 async function request(){await page.locator('#restart').click();await page.locator('#resetYes').click();}
 await page.locator('#restart').click();await page.locator('#resetNo').click();assert.equal(await state(),initial);
 await request();await page.waitForTimeout(20);assert.equal(await state(),initial);assert.equal(await saved(),initialSave);
 for(const outcome of ['cancel','fail','wrong','ok']){
  await page.evaluate(outcome=>{window.calls=0;window.JewelMineRewardedAdProvider={show:({requestId})=>{window.calls++;return new Promise((resolve,reject)=>{window.settle=()=>outcome==='fail'?reject(Error('load failed')):resolve({requestId:outcome==='wrong'?'old':requestId,rewardEarned:outcome==='ok'})})}}},outcome);
  await request();assert(await page.evaluate(()=>JewelMineRewardedAds.busy));
  assert.equal(await page.evaluate(()=>JewelMineRewardedAds.request('revive')),false);
  await page.locator('.piece').first().dispatchEvent('pointerdown',{pointerId:7,clientX:20,clientY:20});assert.equal(await run('drag'),null);
  assert.equal(await state(),initial);await page.evaluate(()=>settle());await page.waitForTimeout(30);
  assert.equal(await page.evaluate(()=>calls),1);
  await page.locator('.piece').first().dispatchEvent('pointerdown',{pointerId:9,clientX:100,clientY:600});assert(await run('!!drag'));
  await page.dispatchEvent('body','pointercancel',{pointerId:9,clientX:100,clientY:600});assert.equal(await run('drag'),null);
  if(outcome!=='ok'){assert.equal(await state(),initial);assert.equal(await saved(),initialSave);}
 }
 const after=JSON.parse(await state()),before=JSON.parse(initial);assert(after.board.every(x=>x===null));assert(after.gems.every(x=>x===null));
 for(const k of Object.keys(before))if(!['board','gems'].includes(k))assert.deepEqual(after[k],before[k]);
 await run('state.board[1]=2;render()');const repeat=await state();await request();assert.equal(await state(),repeat);await page.evaluate(()=>settle());await page.waitForTimeout(30);assert.equal(await page.evaluate(()=>calls),2);assert(await run('state.board.every(x=>x===null)'));
 await page.reload();assert(await run('state.board.every(x=>x===null)'));assert.equal(await run('state.score'),1000);assert.equal(await run('state.best'),12345);
 // A request for revive shares the same lock and cannot overlap reset.
 await page.evaluate(()=>{window.JewelMineRewardedAdProvider={show:({requestId})=>new Promise(resolve=>window.finishRevive=()=>resolve({requestId,rewardEarned:true}))};window.revive=JewelMineRewardedAds.request('revive')});
 assert.equal(await page.evaluate(()=>JewelMineRewardedAds.request('board-reset')),false);await page.evaluate(()=>finishRevive());assert(await page.evaluate(()=>revive));
 assert.deepEqual(errors,[]);console.log('Rewarded board reset: confirmation/cancel/missing provider/failure/stale reward/state preservation/repeated reward/shared revive lock/reload PASS');
}finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
