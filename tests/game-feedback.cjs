const assert=require('node:assert/strict'),fs=require('node:fs');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');

(async()=>{
 const browser=await chromium.launch(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox']}:{channel:'chrome'});
 try{
  const page=await browser.newPage({viewport:{width:393,height:851},hasTouch:true});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{
   const mock=window.feedbackMock={ads:0,haptics:[],notes:[],stopped:0};
   window.Capacitor={Plugins:{
    JewelMineAds:{initialize:async()=>{mock.ads++},showRewarded:req=>new Promise(resolve=>{mock.dismiss=()=>resolve({...req,dismissed:true,rewardEarned:false})})},
    JewelMineHaptics:{play:async({kind})=>{mock.haptics.push(kind)}}
   }};
   window.AudioContext=class{
    currentTime=0; state='running';destination={};
    createGain(){return {connect(){},disconnect(){mock.stopped++},gain:{value:1,setValueAtTime(){},exponentialRampToValueAtTime(){}}}}
    createOscillator(){return {frequency:{value:0},connect(){},start(){mock.notes.push(this.frequency.value)},stop(){}}}
   };
  });
  const html=fs.readFileSync('index.html','utf8').replace('})();</script>','window.__testEval=code=>eval(code);})();</script>');
  await page.route('http://jewel.test/**',r=>r.request().url().endsWith('/assets/opening/jewel-mine.png')?r.fulfill({contentType:'image/png',path:'assets/opening/jewel-mine.png'}):r.fulfill({contentType:'text/html',body:html}));
  await page.clock.install();
  await page.clock.pauseAt(new Date(Date.now()+2000));
  await page.goto('http://jewel.test/');
  const run=code=>page.evaluate(code=>window.__testEval(code),code);
  const opening=page.locator('#mineOpening');
  assert(await opening.isVisible());
  await opening.locator('img').evaluate(img=>img.decode());
  assert.equal(await opening.locator('img').evaluate(img=>img.naturalWidth),1086);
  assert.equal(await page.evaluate(()=>feedbackMock.ads),0);
  assert.equal(await page.locator('#gameViewport').evaluate(el=>el.inert),true);
  const save=()=>page.evaluate(()=>Object.fromEntries(Object.entries(localStorage).filter(([k])=>k.includes('score'))));
  const initial=await save();
  await page.clock.runFor(1999);
  assert(await opening.isVisible());
  assert.equal(await page.evaluate(()=>feedbackMock.ads),0);
  await page.clock.runFor(1);
  assert(!(await opening.isVisible()));
  assert.equal(await page.evaluate(()=>feedbackMock.ads),1);
  assert.deepEqual(await save(),initial);
  await page.clock.resume();

  await page.reload();
  assert(await opening.isVisible());
  assert.equal(await page.evaluate(()=>feedbackMock.ads),0);
  await opening.click();
  assert(!(await opening.isVisible()));
  assert.equal(await page.evaluate(()=>feedbackMock.ads),1);
  assert.deepEqual(await save(),initial);

  await page.waitForFunction(()=>feedbackMock.notes.length>0);
  const count=()=>page.evaluate(()=>feedbackMock.notes.length);
  await page.evaluate(()=>{void JewelMineRewardedAds.request('revive')});
  const during=await count();
  await page.waitForTimeout(380);
  assert.equal(await count(),during);
  await page.evaluate(()=>feedbackMock.dismiss());
  await page.waitForFunction(n=>feedbackMock.notes.length>n,during);
  await run('state.feverTurns=2;render()');
  assert.equal(Math.round(await page.evaluate(()=>feedbackMock.notes.at(-1))),220);
  await run('state.feverTurns=0;render()');
  assert.equal(Math.round(await page.evaluate(()=>feedbackMock.notes.at(-1))),110);

  await page.locator('#feedbackSettings').click();
  await page.locator('#feedback-music').uncheck();
  await page.locator('#feedback-effects').uncheck();
  const silent=await count();
  await page.evaluate(()=>JewelMineFeedback.cue('place'));
  assert.equal(await count(),silent);
  assert.equal(await page.evaluate(()=>feedbackMock.haptics.at(-1)),'place');
  await page.locator('#feedback-haptics').uncheck();
  await page.locator('#feedback-effects').check();
  await page.evaluate(()=>JewelMineFeedback.cue('score'));
  assert((await count())>silent);
  assert.equal(await page.evaluate(()=>feedbackMock.haptics.at(-1)),'place');
  await page.locator('#feedbackDialog button').click();

  await page.reload();
  await opening.click();
  await page.locator('#feedbackSettings').click();
  assert(!(await page.locator('#feedback-music').isChecked()));
  assert(await page.locator('#feedback-effects').isChecked());
  assert(!(await page.locator('#feedback-haptics').isChecked()));
  await page.locator('#feedback-haptics').check();
  await page.locator('#feedbackDialog button').click();
  await run('state=fresh(0);state.pieces[0]={s:0,color:0,used:false};render()');
  await page.locator('.piece').first().dispatchEvent('pointerdown',{pointerId:14,clientX:0,clientY:0});
  await run(`(()=>{
   const d=drag,point=(r,c)=>({clientX:d.boardOrigin.left+c*d.pitch+d.width/2,clientY:d.boardOrigin.top+r*d.pitch+d.lift+d.height/2});
   dragPosition(point(0,0));dragPosition(point(0,0));dragPosition(point(0,1));
  })()`);
  assert.deepEqual(await page.evaluate(()=>feedbackMock.haptics),['pick','step']);
  await page.waitForTimeout(75);
  await run(`dragPosition({clientX:drag.boardOrigin.left+2*drag.pitch+drag.width/2,clientY:drag.boardOrigin.top+drag.lift+drag.height/2})`);
  assert.deepEqual(await page.evaluate(()=>feedbackMock.haptics),['pick','step','step']);
  await page.locator('.piece').first().dispatchEvent('pointercancel',{pointerId:14});
  // Drive a real line clear with a retained combo and a collected jewel.
  await run(`state=fresh(0);state.board=Array(64).fill(null);state.gems=Array(64).fill(null);
   for(let i=0;i<7;i++)state.board[i]=0;
   state.gems[0]=BONUS_TABLE[0].id;state.comboChain=1;state.comboRemain=2;
   state.pieces=[{s:0,color:0,used:false},{s:0,color:0,used:false},{s:0,color:0,used:false}];
   selected=0;render();`);
  await run('preview(-1,-1)'); // Invalid placement must clear hints without calling a removed helper.
  const before=await count();
  await run('place(0,7)');
  await page.waitForTimeout(350);
  const notes=await page.evaluate(n=>feedbackMock.notes.slice(n),before);
  assert(notes.includes(988),'combo sound');assert(notes.includes(1568),'jewel sound');
  assert.equal(await run('state.comboChain'),2);
  assert.equal(await run('state.finds[BONUS_TABLE[0].id]'),1);
  const beforeOver=await count();
  await run('finishGame()');
  await page.waitForFunction(n=>feedbackMock.notes.length>n,beforeOver);
  assert.deepEqual(await page.evaluate(n=>feedbackMock.notes.slice(n),beforeOver),[440,370,294,220]);
  assert.deepEqual(errors,[]);
  console.log('Opening 2000ms/skip and ad gate, saved state, ad/FEVER BGM return, settings, drag haptics, real combo/jewel and game-over sounds: PASS');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
