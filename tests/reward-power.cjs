// Chromium proxy measurements, not Android battery measurements.
const {chromium}=require('playwright'),fs=require('fs'),cp=require('child_process');
const old=cp.execFileSync('git',['show','d4c092e:index.html'],{encoding:'utf8',maxBuffer:4e6}),current=fs.readFileSync('index.html','utf8');
(async()=>{const browser=await chromium.launch(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox']}:{channel:'chrome'});try{
 const root=await browser.newBrowserCDPSession();
 const cpu=async()=>new Map((await root.send('SystemInfo.getProcessInfo')).processInfo.map(x=>[x.id,x.cpuTime]));
 const results={environment:{browser:await browser.version(),node:process.version,viewport:'360x800',sampleMs:1500,repetitions:3},limits:'Desktop headless browser aggregate process CPU and renderer TaskDuration; synthetic visibility; not device battery/GPU energy or an Android thermal test.',cases:{}};
 for(const version of ['pr2','adjusted'])for(const name of ['idle','feverIdle','hiddenFever','clearAnimation']){
  const samples=[];
  for(let trial=0;trial<3;trial++){
   const p=await browser.newPage({viewport:{width:360,height:800}});
   await p.addInitScript(()=>{const raf=window.requestAnimationFrame,cancel=window.cancelAnimationFrame;window.__raf={callbacks:0,pending:new Set()};window.requestAnimationFrame=fn=>{let id=raf.call(window,t=>{window.__raf.pending.delete(id);window.__raf.callbacks++;fn(t)});window.__raf.pending.add(id);return id};window.cancelAnimationFrame=id=>{window.__raf.pending.delete(id);cancel.call(window,id)}});
   const html=(version==='pr2'?old:current).replace('})();</script>','window.__testEval=code=>eval(code);})();</script>');
   await p.route('http://jewel.test/**',r=>r.fulfill({contentType:'text/html',body:html}));await p.goto('http://jewel.test/');
   await p.evaluate(fever=>window.__testEval(`state=fresh(10000);state.board.fill(null);state.gems.fill(null);state.board[27]=0;state.gems[27]='quartz';state.feverTurns=${fever?3:0};render();snapScoreTo(0)`),name==='feverIdle'||name==='hiddenFever');
   if(name==='hiddenFever')await p.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'))});
   await p.waitForTimeout(800);
   const cdp=await p.context().newCDPSession(p);await cdp.send('Performance.enable');
   await p.evaluate(()=>{window.__mutations=0;new MutationObserver(m=>window.__mutations+=m.length).observe(document.body,{subtree:true,attributes:true,childList:true,characterData:true});window.__raf.callbacks=0});
   const before=new Map((await cdp.send('Performance.getMetrics')).metrics.map(m=>[m.name,m.value])),cpuBefore=await cpu();
   if(name==='clearAnimation')await p.evaluate(()=>window.__testEval("showClearToast(4,3,2400);burstClearedCells(Array.from({length:16},(_,i)=>i))"));
   await p.waitForTimeout(1500);
   const after=new Map((await cdp.send('Performance.getMetrics')).metrics.map(m=>[m.name,m.value])),cpuAfter=await cpu();
   const activity=await p.evaluate(()=>({rafCallbacks:window.__raf.callbacks,rafPending:window.__raf.pending.size,domMutations:window.__mutations,runningAnimations:document.getAnimations().filter(a=>a.playState==='running').length}));
   const delta=k=>((after.get(k)||0)-(before.get(k)||0))*1000;
   let processCpuMs=0;for(const [id,t] of cpuAfter)if(cpuBefore.has(id))processCpuMs+=Math.max(0,t-cpuBefore.get(id))*1000;
   samples.push({processCpuMs,taskMs:delta('TaskDuration'),scriptMs:delta('ScriptDuration'),layoutMs:delta('LayoutDuration'),styleMs:delta('RecalcStyleDuration'),...activity});await p.close();
  }
  const median=k=>samples.map(x=>x[k]).sort((a,b)=>a-b)[1];results.cases[version+'-'+name]={samples,medianProcessCpuMs:median('processCpuMs'),medianTaskMs:median('taskMs')};
  fs.writeFileSync('docs/reports/reward-power-measurements.json',JSON.stringify(results,null,2)+'\n');console.log(version,name,JSON.stringify(results.cases[version+'-'+name]));
 }
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
