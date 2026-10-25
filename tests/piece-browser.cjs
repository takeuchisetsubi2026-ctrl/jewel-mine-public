const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');const fs=require('fs'),assert=require('assert/strict');
(async()=>{const browser=await chromium.launch(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox']}:{channel:'chrome'});try{
 const page=await browser.newPage({viewport:{width:360,height:800}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const source=fs.readFileSync('index.html','utf8').replace('})();</script>','window.__testEval=code=>eval(code);})();</script>');
 await page.route('http://jewel.test/**',r=>r.fulfill({contentType:'text/html',body:source}));await page.goto('http://jewel.test/');
 const run=fn=>page.evaluate(s=>window.__testEval('('+s+')()'),fn.toString());
 const result=await run(()=>{
  state=fresh(10000);state.board.fill(null);state.gems.fill(null);state.score=7900;state.best=10000;state.pieces=[0,1,2].map(()=>({s:0,color:0,used:false}));render();
  const offered=JSON.stringify(state.pieces);state.score=8000;state.legacyProgress=8000;state.best=50000;render();const stable=offered===JSON.stringify(state.pieces)&&state.sessionBest===10000;
  const original=pieceGenerator.generate;const modes=[];pieceGenerator.generate=function(...args){const value=original(...args);modes.push(value.mode);return value};
  for(let i=0;i<3;i++){selected=i;place(0,i)}pieceGenerator.generate=original;
  const refill=modes.length===1&&modes[0]==='challenge'&&state.pieces.length===3&&state.pieces.every(p=>!p.used);
  state.board[9]=1;state.gems.fill(null);state.gems[9]='quartz';state.feverTurns=3;state.feverProgress=2;render();
  return {stable,refill,saved:JSON.stringify(state),sessionBest:state.sessionBest,mode:pieceGenerator.mode(state.score,state.sessionBest)};
 });assert(result.stable&&result.refill);await page.reload();
 const restored=await run(()=>({sessionBest:state.sessionBest,mode:pieceGenerator.mode(state.score,state.sessionBest),board:state.board,pieces:state.pieces,score:state.score,best:state.best,feverTurns:state.feverTurns,gems:state.gems}));
 const saved=JSON.parse(result.saved);for(const k of ['sessionBest','board','pieces','score','best','feverTurns','gems'])assert.deepEqual(restored[k],saved[k]);assert.equal(restored.mode,'challenge');
 const reset=await run(()=>{reset();return {best:state.best,sessionBest:state.sessionBest,mode:pieceGenerator.mode(state.score,state.sessionBest)}});assert.equal(reset.best,50000);assert.equal(reset.sessionBest,50000);assert.equal(reset.mode,'joy');
 await run(()=>{delete state.sessionBest;state.best=4321;state.pieces=[{s:27,color:0,used:false},{s:29,color:0,used:false},{s:12,color:0,used:false}];save()});await page.reload();
 const migrated=await run(()=>({sessionBest:state.sessionBest,ids:state.pieces.map(p=>p.s)}));assert.equal(migrated.sessionBest,4321);assert.deepEqual(migrated.ids,[5,5,12]);
 await run(()=>{state=fresh(0);render()});await page.reload();assert.equal(await run(()=>pieceGenerator.mode(state.score,state.sessionBest)),'joy');assert.deepEqual(errors,[]);
 fs.writeFileSync('docs/reports/piece-browser-results.json',JSON.stringify({stableOfferedPieces:result.stable,refillAtThreshold:result.refill,restoredMode:restored.mode,reset,migrated,firstPlay:'joy',errors},null,2)+'\n');console.log('Session snapshot, threshold, refill, restore and legacy saves: PASS');
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
