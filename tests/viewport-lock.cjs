const fs=require('fs'),assert=require('assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{
 const browser=await chromium.launch(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox']}:{channel:'chrome'});
 try{
 const results=[];
 for(const [width,height] of [[360,640],[393,851],[412,915],[800,360]]){
  const context=await browser.newContext({viewport:{width,height},hasTouch:true,isMobile:true});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  const source=fs.readFileSync('index.html','utf8').replace('})();</script>','window.__testEval=code=>eval(code);})();</script>');
  await page.route('http://jewel.test/**',r=>r.fulfill({contentType:'text/html',body:source}));await page.goto('http://jewel.test/');
  const run=code=>page.evaluate(code=>window.__testEval(code),code);
  await page.waitForTimeout(150);
  const bounds=()=>page.evaluate(()=>['.hud','.boardshell','.tray','.rulebar'].map(s=>{const r=document.querySelector(s).getBoundingClientRect();return [r.x,r.y,r.width,r.height]}));
  const before=await bounds();for(const r of before){assert(r[0]>=-1&&r[1]>=-1&&r[0]+r[2]<=width+1&&r[1]+r[3]<=height+1)}
  const saved=await page.evaluate(()=>JSON.stringify(localStorage));
  const cdp=await context.newCDPSession(page);
  async function gesture(x,y,tx,ty){await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});for(let i=1;i<=12;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+(tx-x)*i/12,y:y+(ty-y)*i/12}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
  for(const [x,y,tx,ty] of [[2,100,2,height-2],[width-2,height-2,width-2,2],[2,height/2,width-2,height/2],[width-2,height/2,2,height/2]])await gesture(x,y,tx,ty);
  assert.deepEqual(await bounds(),before);assert.equal(await page.evaluate(()=>JSON.stringify(localStorage)),saved);
  await run('state=fresh(12345);state.board.fill(null);state.gems.fill(null);state.pieces=[0,1,2].map(()=>({s:0,color:0,used:false}));render()');
  for(let i=0;i<3;i++){
   const rect=await page.locator('.piece').nth(i).boundingBox(),x=rect.x+rect.width/2,y=rect.y+rect.height/2;
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
   const target=await run(`({x:drag.boardOrigin.left+drag.width/2+${i}*drag.pitch,y:drag.boardOrigin.top+drag.lift+drag.height/2})`);
   for(let j=1;j<=12;j++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+(target.x-x)*j/12,y:y+(target.y-y)*j/12}]});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(120);
  }
  assert.equal(await run('state.board.filter(x=>x!==null).length'),3);
  assert.deepEqual(await bounds(),before);assert.equal(await page.evaluate(()=>scrollX+scrollY),0);
  await page.locator('#restart').click();assert(await page.locator('#resetConfirm').evaluate(d=>d.open));await page.locator('#resetNo').click();
  assert.equal(await run('state.best'),12345);
  const persisted=await page.evaluate(()=>JSON.stringify(localStorage));
  await page.setViewportSize({width:height,height:width});await page.waitForTimeout(150);
  for(const r of await bounds())assert(r[0]>=-1&&r[1]>=-1&&r[0]+r[2]<=height+1&&r[1]+r[3]<=width+1);
  assert.equal(await page.evaluate(()=>JSON.stringify(localStorage)),persisted);assert.deepEqual(errors,[]);
  results.push({width,height,edgeGestures:4,successfulDrags:3,layoutStable:true,saveUnchangedByEdgeGestures:true});await context.close();
 }
 fs.writeFileSync('docs/reports/viewport-lock-results.json',JSON.stringify(results,null,2)+'\n');console.log('Viewport lock:',JSON.stringify(results));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
