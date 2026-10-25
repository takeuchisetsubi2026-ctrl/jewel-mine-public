const fs=require('fs'),vm=require('vm'),cp=require('child_process'),{loadEngine,calculateLineReward:reward,shapes,rng}=require('./piece-test-helpers.cjs');
const pr2=loadEngine('d4c092e'),pr3=loadEngine('1ac50c0');
function candidate(){
 const text=cp.execFileSync('git',['show','1ac50c0:index.html'],{encoding:'utf8',maxBuffer:4e6});
 let code=text.split('// BEGIN SCORE ADAPTIVE GENERATOR')[1].split('// END SCORE ADAPTIVE GENERATOR')[0];
 code=code.replace('return {endEmpty:free.empty','return {endLo:(route||start).lo,endHi:(route||start).hi,endEmpty:free.empty');
 code=code.replace('return -blocked*',"const terminal={lo:e.endLo,hi:e.endHi},futureFamilies=['square4','rectangle6','bar'].filter(k=>groups[k].some(id=>masks[id].some(p=>fits(terminal,p)))).length;\n   return e.path.filter(p=>p.lines>=3).length*28+futureFamilies*futureFamilies*4-blocked*").replace('(e.allClear?45:0)','(e.allClear?65:0)');
 return vm.runInNewContext('const SHAPES='+JSON.stringify(shapes)+';'+code+';pieceGenerator');
}
function initial(kind,seed){const b=Array(64).fill(null),random=rng(seed^0xaabbccdd),order=Array.from({length:64},(_,i)=>i);for(let i=63;i>0;i--){const j=Math.floor(random()*(i+1));[order[i],order[j]]=[order[j],order[i]]}for(const i of order.slice(0,kind==='empty'?0:kind==='medium'?20:36))b[i]=0;return Array.from(pr3.decode(pr3.apply(pr3.encode(b),{lo:0,hi:0})))}
function oldPoints(n,L,chain,fever=false){const f=fever?2:1;return Math.round((300*n+150*Math.max(0,n-1))*(1+.01*(L+n))*f)+Math.max(0,chain-1)*100*n*f}
const quantile=(a,p)=>{const b=a.slice().sort((a,b)=>a-b);return b.length?b[Math.floor((b.length-1)*p)]:null};
function play(g,policy,kind,seed){
 const random=rng(seed),tie=rng(seed^0x33557799);let board=initial(kind,seed),b=g.encode(board),pieces=[],turns=0,lines=0,actual=0,legacy=0,combo=0,remain=0,latched=false,allClear=0,nineGenerated=0,nineStranded=0,firstChallenge=null;const trace=[],counts=Array(17).fill(0),times=[];
 while(turns<200){
  if(!pieces.length){const progress=policy==='old-display'?legacy:policy==='B'?legacy:actual;latched||=progress>=8000;if(latched&&firstChallenge===null)firstChallenge=turns;const t=performance.now(),set=g.generate(board,latched?Math.max(progress,8000):progress,10000,random);times.push(performance.now()-t);pieces=set.ids.map(id=>({id}));nineGenerated+=set.ids.filter(id=>id===13).length;trace.push({deal:true,turn:turns,actual,legacy,ids:Array.from(set.ids),mode:set.mode})}
  let best=null;for(let i=0;i<pieces.length;i++)for(const p of g.masks[pieces[i].id])if(g.fits(b,p)){const next=g.apply(b,p),value=next.lines*1000+(next.allClear?10000:0)+g.near(next)*.15+shapes[pieces[i].id].length*.1+tie()*.01;if(!best||value>best.value)best={i,p,next,value}}
  if(!best){nineStranded=pieces.filter(p=>p.id===13).length;break}
  const id=pieces[best.i].id,n=best.next.lines,L=lines;pieces.splice(best.i,1);turns++;
  if(n){combo=remain>0?combo+1:1;remain=3;lines+=n;counts[n]++;if(best.next.allClear)allClear++}else if(remain>0){remain--;if(!remain)combo=0}
  const placement=shapes[id].length*10,bonus=best.next.allClear?1000:0;
  legacy+=placement+(n?oldPoints(n,L,combo):0)+bonus;
  actual+=placement+(n?reward(n,L,combo,false).lineEventPoints:0)+bonus;
  trace.push({deal:false,turn:turns,id,r:best.p.r,c:best.p.c,n,L,combo,full:best.next.allClear,actual,legacy});
  b=best.next;board=Array.from(g.decode(b));
 }
 return {kind,seed,placements:turns,censored:turns===200,lines,allClear,counts,nineGenerated,nineStranded,firstChallenge,actual,legacy,trace,times};
}
function summarize(games){const sum=k=>games.reduce((n,g)=>n+g[k],0),moves=sum('placements'),done=games.filter(g=>!g.censored),times=games.flatMap(g=>g.times);return {games:games.length,linesPer100:100*sum('lines')/moves,threeLineEvents:games.reduce((n,g)=>n+g.counts[3],0),threePer100:100*games.reduce((n,g)=>n+g.counts[3],0)/moves,allClearPer100:100*sum('allClear')/moves,meanPlacements:moves/games.length,p25:quantile(games.map(g=>g.placements),.25),median:quantile(games.map(g=>g.placements),.5),p75:quantile(games.map(g=>g.placements),.75),censored:games.filter(g=>g.censored).length,nineStrandedRate:done.reduce((n,g)=>n+g.nineStranded,0)/Math.max(1,done.reduce((n,g)=>n+g.nineGenerated,0)),ninePer100:100*sum('nineGenerated')/Math.max(1,games.reduce((n,g)=>n+g.trace.filter(t=>t.deal).length*3,0)),generationMs:{median:quantile(times,.5),p95:quantile(times,.95),max:quantile(times,1)},challengeReached:games.filter(g=>g.firstChallenge!==null).length,challengeMedian:quantile(games.filter(g=>g.firstChallenge!==null).map(g=>g.firstChallenge),.5)}}
function replay(games,legacyBest,v2Best,legacyEquivalentBest=0,allBest=Math.max(legacyBest,v2Best)){const out={};for(const policy of ['A','B','C']){const reference=policy==='C'?(v2Best||10000):policy==='B'?(Math.max(legacyBest,legacyEquivalentBest)||10000):(allBest||10000),switches=[],crossings=[];for(const g of games){let crossing=null,switched=null;for(const t of g.trace){const progress=policy==='B'?t.legacy:t.actual;if(progress>=reference*.8){if(crossing===null)crossing=t.turn;if(t.deal){switched=t.turn;break}}}switches.push(switched);crossings.push(crossing)}const reached=switches.filter(x=>x!==null);out[policy]={reference,reached:reached.length,notReached:switches.length-reached.length,p25:quantile(reached,.25),median:quantile(reached,.5),p75:quantile(reached,.75),switches,crossings}}return out}
if(require.main===module){
 const seeds=Array.from({length:Number(process.env.SIM_SEEDS||12)},(_,i)=>20261025+i*97),out={method:'same PR3 seeds/boards/one-step greedy player; no gems/FEVER; cap200; A actual score / B exact old-event progression; replay C uses explicitly specified dedicated v2 best, not copied legacy',seeds,results:{}};
 for(const [name,g,policy] of [['PR2-A',pr2,'old-display'],['PR3-A',pr3,'A'],['PR3-B',pr3,'B'],['candidate-B',candidate(),'B']]){const games=[];for(const kind of ['empty','medium','dense'])for(const seed of seeds)games.push(play(g,policy,kind,seed));out.results[name]={summary:summarize(games),games};fs.writeFileSync('docs/reports/versioning-comparison.json',JSON.stringify(out,null,2)+'\n');console.log(name,JSON.stringify(out.results[name].summary))}
 const reference=out.results['PR3-A'].games;
 out.sameTrajectory={firstPlay:replay(reference,0,0),legacyProfile:replay(reference,10000,0),newBestUpdated:replay(reference,10000,25000,15000,25000),legacyLarger:replay(reference,50000,25000,15000,50000)};
 fs.writeFileSync('docs/reports/versioning-comparison.json',JSON.stringify(out,null,2)+'\n');
}
module.exports={play,summarize,replay,oldPoints,candidate};
