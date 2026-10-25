// Occupancy-only comparison. No gems/FEVER/score progression; modes fixed per cohort.
const fs=require('fs'),{engine:g,rng,oldGenerator}=require('./piece-test-helpers.cjs');
const seeds=Array.from({length:Number(process.env.SIM_SEEDS||12)},(_,i)=>20261025+i*97),cap=200;
function initial(kind,seed){const b=Array(64).fill(null),random=rng(seed^0xaabbccdd);const order=Array.from({length:64},(_,i)=>i);for(let i=63;i>0;i--){const j=Math.floor(random()*(i+1));[order[i],order[j]]=[order[j],order[i]]}for(const i of order.slice(0,kind==='empty'?0:kind==='medium'?20:36))b[i]=0;return b}
function quantile(a,q){const b=a.slice().sort((x,y)=>x-y);return b[Math.floor((b.length-1)*q)]||0}
const out={model:'occupancy-only; fixed mode; no gems/FEVER; deterministic one-step greedy player, not a human; capped games are right-censored',seeds,cap,results:{}};
for(const mode of ['joy','challenge'])for(const version of ['old','new']){
 const games=[],categories={square4:0,rectangle6:0,square9:0,bar:0,other:0},generatedTimes=[];
 for(const kind of ['empty','medium','dense'])for(const seed of seeds){
  const random=rng(seed),tie=rng(seed^0x33557799),old=version==='old'?oldGenerator(random):null;
  let board=initial(kind,seed),b=g.encode(board),pieces=[],turns=0,lines=0,multi=0,clears=0,allClear=0,barLines=0,generatedLarge=0,strandedLarge=0;
  while(turns<cap){
   if(!pieces.length){const t=performance.now();const ids=version==='old'?old(board).map(p=>p.s):g.generate(board,mode==='joy'?0:800,1000,random).ids;generatedTimes.push(performance.now()-t);pieces=ids.map(id=>({id}));for(const id of ids){categories[g.category(id)]++;if(['square4','rectangle6','square9'].includes(g.category(id)))generatedLarge++}}
   let best=null;
   for(let i=0;i<pieces.length;i++)for(const p of g.masks[pieces[i].id])if(g.fits(b,p)){
    const next=g.apply(b,p),value=next.lines*1000+(next.allClear?10000:0)+g.near(next)*.15+g.masks[pieces[i].id].length*.001+tie()*.01;
    if(!best||value>best.value)best={i,p,next,value};
   }
   if(!best){strandedLarge=pieces.filter(p=>['square4','rectangle6','square9'].includes(g.category(p.id))).length;break}
   const id=pieces[best.i].id;pieces.splice(best.i,1);b=best.next;board=Array.from(g.decode(b));turns++;lines+=best.next.lines;if(best.next.lines)clears++;if(best.next.lines>=2)multi++;if(best.next.allClear)allClear++;if(g.category(id)==='bar')barLines+=best.next.lines;
  }
  games.push({kind,seed,placements:turns,censored:turns===cap,lines,multi,clears,allClear,barLines,generatedLarge,strandedLarge});
 }
 const sum=k=>games.reduce((n,x)=>n+x[k],0),placements=sum('placements'),totalCats=Object.values(categories).reduce((a,b)=>a+b,0);
 const summary={games:games.length,placements,linesPer100Placements:sum('lines')/placements*100,multiClearEventsPer100Placements:sum('multi')/placements*100,multiShareOfClearEvents:sum('multi')/Math.max(1,sum('clears')),allClearPer100Placements:sum('allClear')/placements*100,meanPlacements:placements/games.length,placementQuantiles:{min:Math.min(...games.map(x=>x.placements)),p25:quantile(games.map(x=>x.placements),.25),median:quantile(games.map(x=>x.placements),.5),p75:quantile(games.map(x=>x.placements),.75),p90:quantile(games.map(x=>x.placements),.9),max:Math.max(...games.map(x=>x.placements))},censored:games.filter(x=>x.censored).length,strandedLargePerGeneratedLarge:sum('strandedLarge')/Math.max(1,sum('generatedLarge')),barShareOfClearedLines:sum('barLines')/Math.max(1,sum('lines')),correctedCategoryPercent:Object.fromEntries(Object.entries(categories).map(([k,v])=>[k,100*v/totalCats])),generatorMs:{median:quantile(generatedTimes,.5),p95:quantile(generatedTimes,.95),max:Math.max(...generatedTimes)}};
 out.results[mode+'-'+version]={summary,games};
 fs.writeFileSync('docs/reports/piece-simulation.json',JSON.stringify(out,null,2)+'\n');console.log(mode,version,JSON.stringify(summary));
}
