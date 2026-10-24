const fs=require('fs'),vm=require('vm'),http=require('http'),assert=require('assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const evalGame=(page,fn)=>page.evaluate(code=>window.__testEval('('+code+')()'),fn.toString());
(async()=>{
 const current=fs.readFileSync('index.html','utf8');new vm.Script(current.match(/<script>([\s\S]*?)<\/script>/)[1]);
 const baseline=require('child_process').execFileSync('git',['show','d5ffa1e:index.html'],{encoding:'utf8',maxBuffer:4e6});
 const server=http.createServer((q,r)=>{r.setHeader('Content-Type','text/html; charset=utf-8');r.end((q.url==='/baseline'?baseline:current).replace('})();</script>', 'window.__testEval=code=>eval(code);})();</script>'))}).listen(0,'127.0.0.1');
 const browser=await chromium.launch({headless:true,channel:'chrome'});
 try{
 const results={};
 for(const version of ['baseline','current']){
 const page=await browser.newPage({viewport:{width:360,height:800}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`http://127.0.0.1:${server.address().port}/${version}`);await evalGame(page,()=>document.fonts.ready);
 results[version]=await evalGame(page,()=>{
 const burst=[];
 for(const n of [8,16,32,64]){
 const times=[];let nodes;
 for(let t=0;t<25;t++){
 $('burstLayer').replaceChildren();state.board.fill(0);
 const start=performance.now();burstClearedCells(Array.from({length:n},(_,i)=>i));times.push(performance.now()-start);
 nodes=$('burstLayer').querySelectorAll('*').length;
 }times.sort((a,b)=>a-b);burst.push({cells:n,nodes,medianMs:times[12],p95Ms:times[23]});
 }
 const scenarios=[];
 for(const spec of [{name:'single',rows:1,cols:0,fever:0,progress:0,combo:0},{name:'double',rows:2,cols:0,fever:0,progress:0,combo:0},{name:'cross',rows:1,cols:1,fever:0,progress:0,combo:0},{name:'fever',rows:1,cols:0,fever:3,progress:0,combo:2},{name:'trigger',rows:1,cols:0,fever:0,progress:4,combo:0}]){
 state=fresh();state.board.fill(null);state.gems.fill(null);
 for(let r=0;r<spec.rows;r++)for(let c=0;c<8;c++)state.board[r*8+c]=0;
 for(let c=0;c<spec.cols;c++)for(let r=0;r<8;r++)state.board[r*8+c]=0;
 state.board[0]=null;state.pieces=[{s:SHAPES.findIndex(s=>s.length===1),color:0,used:false},{s:0,color:0,used:false},{s:0,color:0,used:false}];
 state.feverTurns=spec.fever;state.feverProgress=spec.progress;state.comboChain=spec.combo;state.comboRemain=spec.combo?3:0;
 if(spec.progress)state.gems[1]=BONUS_TABLE[0].id;
 selected=0;render();place(0,0);
 scenarios.push({name:spec.name,score:state.score,lines:state.totalLines,turn:state.turn,feverTurns:state.feverTurns,progress:state.feverProgress,combo:state.comboChain,board:state.board.slice(),finds:{...state.finds}});
 }
 return {burst,scenarios};
 });
 assert.deepEqual(errors,[]);await page.close();
 }
 assert.deepEqual(results.current.scenarios,results.baseline.scenarios);
 assert.equal(results.current.scenarios.find(x=>x.name==='trigger').feverTurns,5);
 const page=await browser.newPage({viewport:{width:320,height:760}});await page.goto(`http://127.0.0.1:${server.address().port}/current`);
 await evalGame(page,()=>{state.score=12345;render()});
 const checks=await evalGame(page,async()=>{
 const cell=boardEl.firstElementChild;render();const reused=cell===boardEl.firstElementChild;
 toast('<span class="fever-letters"><b>F</b><b>E</b><b>V</b><b>E</b><b>R</b></span>','','fever');
 await new Promise(r=>setTimeout(r,1100));const visibleAfter1100=$('toast').classList.contains('show');
 const rect=$('toast').querySelector('span').getBoundingClientRect();
 await new Promise(r=>setTimeout(r,220));
 const hiddenAfter1320=!$('toast').classList.contains('show');
 const saved=JSON.parse(localStorage.getItem(KEY));
 return {reused,visibleAfter1100,hiddenAfter1320,feverFits:rect.left>=0&&rect.right<=innerWidth,savedScore:saved.score,score:state.score,font:getComputedStyle($('toast')).fontSize};
 });
 for(const key of ['reused','visibleAfter1100','hiddenAfter1320','feverFits'])assert.equal(checks[key],true,key);
 assert.equal(checks.savedScore,checks.score);
 
 const sizes=[];
 for(const width of [280,320,360,390,393,480]){
 await page.setViewportSize({width,height:800});
 sizes.push(await evalGame(page,()=>{toast('<span class="fever-letters"><b>F</b><b>E</b><b>V</b><b>E</b><b>R</b></span>','','fever');const r=$('toast').firstElementChild.getBoundingClientRect();return {width:innerWidth,font:parseFloat(getComputedStyle($('toast')).fontSize),fits:r.left>=0&&r.right<=innerWidth}}));
 }
 sizes.forEach(x=>{assert.equal(x.fits,true);assert.equal(x.font,x.width<=390?Math.min(72,x.width*.24):Math.min(82.8,x.width*.24))});
 await page.setViewportSize({width:320,height:760});
 const effects=await evalGame(page,()=>{for(let i=0;i<5;i++)burstClearedCells(Array.from({length:64},(_,i)=>i));return {groups:$('burstLayer').childElementCount,nodes:$('burstLayer').querySelectorAll('*').length}});
 assert.equal(effects.groups,2);assert.equal(effects.nodes,198);
 results.sizes=sizes;results.effects=effects;results.checks=checks;await page.reload();assert.equal(await evalGame(page,()=>state.score),checks.score);
 await evalGame(page,()=>toast('<span class="fever-letters"><b>F</b><b>E</b><b>V</b><b>E</b><b>R</b></span>','','fever'));await page.waitForTimeout(100);
 await page.screenshot({path:'docs/fever-320.png'});
 console.log(JSON.stringify({baseline:results.baseline.burst,current:results.current.burst,checks},null,2));fs.writeFileSync('docs/test-results.json',JSON.stringify(results,null,2)+'\n');
 }finally{await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exitCode=1});

