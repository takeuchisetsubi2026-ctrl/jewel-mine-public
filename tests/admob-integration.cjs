const fs=require('fs'),assert=require('assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{
 const browser=await chromium.launch(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox']}:{channel:'chrome'});
 try{
 const page=await browser.newPage({viewport:{width:393,height:851},hasTouch:true}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{
  window.adMock={calls:[],count:0,last:null};
  window.Capacitor={Plugins:{JewelMineAds:{
   initialize:async()=>{},
   showRewarded:request=>new Promise(resolve=>{
    adMock.calls.push(request);let earned=false;
    adMock.reward=()=>{earned=true};
    adMock.close=()=>resolve({...request,dismissed:true,rewardEarned:earned});
    adMock.fail=()=>resolve({...request,dismissed:false,rewardEarned:false});
   }),
   gameOver:async request=>{
    if(adMock.last===request.eventId)return {...request,dismissed:false};
    adMock.last=request.eventId;adMock.count++;
    return {...request,dismissed:adMock.count%3===0};
   }
  }}};
 });
 const source=fs.readFileSync('index.html','utf8').replace('})();</script>','window.__testEval=code=>eval(code);})();</script>');
 await page.route('http://jewel.test/**',r=>r.fulfill({contentType:'text/html',body:source}));await page.goto('http://jewel.test/');
 const run=code=>page.evaluate(code=>window.__testEval(code),code);
 const snapshot=()=>run('JSON.stringify(state)');
 await run('state=fresh(50000);state.score=4321;state.feverTurns=3;state.board[0]=1;state.gems[0]="quartz";render()');
 const initial=await snapshot(),stored=await page.evaluate(()=>JSON.stringify(localStorage));
 await page.locator('#restart').click();await page.locator('#resetYes').click();
 assert.equal(await page.evaluate(()=>adMock.calls[0].purpose),'board-reset');
 await page.evaluate(()=>adMock.reward());assert.equal(await snapshot(),initial); // Reward alone is insufficient.
 await page.locator('.piece').first().dispatchEvent('pointerdown',{pointerId:2});assert.equal(await run('drag'),null);
 await page.evaluate(()=>adMock.close());await page.waitForTimeout(30);
 assert(await run('state.board.every(x=>x===null)'));assert.equal(await run('state.score'),4321);assert.equal(await run('state.feverTurns'),3);
 await run('state.board[0]=1;render();finishGame()');await page.waitForTimeout(30);
 const ended=await snapshot(),savedEnd=await page.evaluate(()=>JSON.stringify(localStorage));
 await page.locator('#revive').click();await page.evaluate(()=>adMock.close());await page.waitForTimeout(30);
 assert.equal(await snapshot(),ended);assert.equal(await page.evaluate(()=>JSON.stringify(localStorage)),savedEnd);assert(await page.locator('#over').evaluate(d=>d.open));
 await page.locator('#revive').click();await page.evaluate(()=>adMock.reward());assert.equal(await snapshot(),ended);
 await page.evaluate(()=>adMock.close());await page.waitForTimeout(30);assert(!(await page.locator('#over').evaluate(d=>d.open)));
 assert(await run('state.board.every(x=>x===null)'));assert.equal(await run('state.score'),4321);
 await page.locator('.piece').first().dispatchEvent('pointerdown',{pointerId:4,clientX:100,clientY:600});assert(await run('!!drag'));await page.dispatchEvent('body','pointercancel',{pointerId:4});assert.equal(await run('drag'),null);
 const pos=await page.locator('.boardshell').boundingBox();
 await run('state.board[1]=1;render()');const failure=await snapshot(),failureSave=await page.evaluate(()=>JSON.stringify(localStorage));
 await page.locator('#restart').click();await page.locator('#resetYes').click();await page.evaluate(()=>adMock.fail());await page.waitForTimeout(30);
 assert.equal(await snapshot(),failure);assert.equal(await page.evaluate(()=>JSON.stringify(localStorage)),failureSave);assert.deepEqual(await page.locator('.boardshell').boundingBox(),pos);
 const cadence=await page.evaluate(async()=>{const p=Capacitor.Plugins.JewelMineAds;adMock.count=0;adMock.last=null;const shown=[];for(let i=1;i<=6;i++)shown.push((await p.gameOver({eventId:String(i)})).dismissed);return shown});
 assert.deepEqual(cadence,[false,false,true,false,false,true]);assert.deepEqual(errors,[]);
 // Test-only IDs and native reward/dismiss split cannot be overridden by JS IDs.
 const java=fs.readFileSync('android/app/src/main/java/com/wilduncle/jewelmine/codextest/JewelMineAdsPlugin.java','utf8');
 assert(java.includes('complete(call, earned[0], true'));assert(!java.includes('8200983228535531'));
 assert(fs.readFileSync('android/app/src/main/AndroidManifest.xml','utf8').includes('ca-app-pub-3940256099942544~3347511713'));
 console.log('AdMob bridge: reward-before-dismiss denied, cancel/failure unchanged, revive, shared gate, post-ad drag/layout, test IDs PASS');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
