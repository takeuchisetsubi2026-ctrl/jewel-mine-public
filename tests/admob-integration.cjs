const fs=require('fs'),assert=require('assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{
 const browser=await chromium.launch(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox']}:{channel:'chrome'});
 try{
 const page=await browser.newPage({viewport:{width:393,height:851},hasTouch:true}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{
  window.adMock={calls:[],finals:[],shown:0};
  window.Capacitor={Plugins:{JewelMineAds:{
   initialize:async()=>{},
   showRewarded:request=>new Promise(resolve=>{
    adMock.calls.push(request);let earned=false;
    adMock.reward=()=>{earned=true};
    adMock.close=()=>resolve({...request,dismissed:true,rewardEarned:earned});
    adMock.fail=()=>resolve({...request,dismissed:false,rewardEarned:false});
   }),
   gameOver:async request=>{
    adMock.finals.push(request.eventId);
    if(localStorage.getItem('mock-last-final')===request.eventId)return {...request,dismissed:false};
    localStorage.setItem('mock-last-final',request.eventId);
    const parity=localStorage.getItem('mock-parity')==='1'?'0':'1';
    localStorage.setItem('mock-parity',parity);
    if(parity==='1')return {...request,dismissed:false};
    adMock.shown++;
    return new Promise(resolve=>{
     adMock.closeFinal=()=>resolve({...request,dismissed:true});
     adMock.failFinal=()=>resolve({...request,dismissed:false});
    });
   }
  }}};
 });
 const source=fs.readFileSync('index.html','utf8').replace("(()=>{'use strict';","(()=>{'use strict';window.__testEval=code=>eval(code);");
 await page.route('http://jewel.test/**',r=>r.fulfill({contentType:'text/html',body:source}));await page.goto('http://jewel.test/');await page.locator('#mineOpening').click();
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
 assert.equal(await page.evaluate(()=>adMock.finals.length),0,'opening game over and reviving do not finalize');
 assert.equal(await page.locator('#sfxDiagLabel').count(),0);
 const deadBoard='state.board.fill(1);state.gems.fill(null);render();finishGame()';
 await run(deadBoard);
 await page.reload();await page.locator('#mineOpening').click();
 await page.waitForFunction(()=>document.querySelector('#over').open);
 assert.equal(await run('state.revivesUsed'),1);
 assert.match(await page.locator('#revive').textContent(),/残り1回/);
 await page.locator('#revive').click();
 await page.waitForFunction(()=>adMock.calls.length===1);
 await page.evaluate(()=>adMock.reward());
 await page.reload();await page.locator('#mineOpening').click(); // Process/page lost after reward and before dismissal.
 assert.equal(await run('state.revivesUsed'),1);
 assert(await run('state.board.every(x=>x===1)'));
 await page.locator('#revive').click();
 await page.waitForFunction(()=>adMock.calls.length===1);
 await page.locator('#revive').dispatchEvent('click');
 assert.equal(await page.evaluate(()=>adMock.calls.length),1);
 await page.evaluate(()=>{adMock.reward();adMock.close()});
 await page.waitForFunction(()=>!document.querySelector('#over').open);
 assert.equal(await run('state.revivesUsed'),2);
 await run(deadBoard);
 await page.reload();await page.locator('#mineOpening').click();
 assert(await page.locator('#revive').isDisabled());
 await run('requestRevive()');
 assert.equal(await page.evaluate(()=>adMock.calls.length),0);
 await page.locator('#again').click();
 await page.waitForFunction(()=>!document.querySelector('#over').open);
 assert.equal(await run('state.revivesUsed'),0);
 assert.equal(await page.evaluate(()=>adMock.finals.length),1);
 assert.equal(await page.evaluate(()=>adMock.shown),0);
 await run(deadBoard);
 await page.reload();await page.locator('#mineOpening').click();
 await page.locator('#again').click();
 await page.waitForFunction(()=>adMock.shown===1);
 await page.locator('#again').dispatchEvent('click');
 await page.locator('#revive').dispatchEvent('click');
 assert.equal(await page.evaluate(()=>adMock.finals.length),1);
 assert.equal(await page.evaluate(()=>adMock.calls.length),0);
 assert(await run("$('over').open&&state.board.every(x=>x===1)"));
 await page.evaluate(()=>adMock.closeFinal());
 await page.waitForFunction(()=>!document.querySelector('#over').open);
 await run(deadBoard);
 await page.locator('#again').click();
 await page.waitForFunction(()=>!document.querySelector('#over').open);
 await run(deadBoard);
 await page.locator('#again').click();
 await page.waitForFunction(()=>adMock.shown===2);
 await page.evaluate(()=>adMock.failFinal());
 await page.waitForFunction(()=>!document.querySelector('#over').open);
 await run(deadBoard);
 await page.locator('#revive').click();
 await page.waitForFunction(()=>adMock.calls.length===1);
 await page.evaluate(()=>{
  window.restoreStorage=()=>{Storage.prototype.setItem=write};
  const write=Storage.prototype.setItem;
  Storage.prototype.setItem=()=>{throw new Error('Storage unavailable')};
  adMock.reward();adMock.close();
 });
 await page.waitForFunction(()=>document.querySelector('#toast').textContent.includes('復活を保存できませんでした'));
 await page.evaluate(()=>window.restoreStorage());
 assert(await run("state.revivesUsed===0&&state.board.every(x=>x===1)&&$('over').open"));
 await run('delete state.revivesUsed;save()');
 await page.reload();await page.locator('#mineOpening').click();
 assert(await page.locator('#revive').isDisabled());
 assert.deepEqual(errors,[]);
 // Test-only IDs and native reward/dismiss split cannot be overridden by JS IDs.
 const java=fs.readFileSync('android/app/src/main/java/com/wilduncle/jewelmine/codextest/JewelMineAdsPlugin.java','utf8');
 assert(java.includes('complete(call, earned[0], true'));
 assert.match(java,/column\.addView\(web,[^\n]*\n\s*bannerHost = new FrameLayout[^\n]*\n\s*column\.addView\(bannerHost,/);
 assert.match(java,/putString\("lastFinalGame", eventId\)[\s\S]*?putInt\("finalGameParity", parity\)\.commit\(\)/);
 assert(java.includes('prefs.getInt("finalGameParity", 0) == 0 ? 1 : 0'));
 assert(java.includes('eventId.equals(prefs.getString("lastFinalGame", ""))'));assert(!java.includes('8200983228535531'));
 assert(fs.readFileSync('android/app/src/main/AndroidManifest.xml','utf8').includes('ca-app-pub-3940256099942544~3347511713'));
 console.log('AdMob bridge: cancellation, restart during ad, two revives, third blocked after reload, final cadence across reload, duplicate clicks, dismissal and failed interstitial, banner separation, post-ad drag, test IDs PASS');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
