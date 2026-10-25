const fs=require('fs'),os=require('os'),{engine:current,loadEngine,rng}=require('./piece-test-helpers.cjs'),old=loadEngine(process.env.GENERATION_BASELINE_REF||'d4c092e');
const baselineLabel=process.env.GENERATION_BASELINE_REF?'pr3':'pr2',times={[baselineLabel]:[],adjusted:[]};
for(const g of [old,current])for(let i=0;i<8;i++)g.generate(Array(64).fill(null),0,10000,rng(i));
const samples=[];
for(const score of [0,8000])for(const fill of [0,.3,.55])for(let seed=0;seed<12;seed++){
 const random=rng(20261025+seed),raw=Array.from({length:64},()=>random()<fill?0:null),board=Array.from(old.decode(old.apply(old.encode(raw),{lo:0,hi:0})));
 for(const [version,g] of (seed%2?[['adjusted',current],[baselineLabel,old]]:[[baselineLabel,old],['adjusted',current]])){
  const t=performance.now();g.generate(board,score,10000,rng(seed));const ms=performance.now()-t;times[version].push(ms);samples.push({version,score,fill,seed,ms});
 }
}
const q=(a,p)=>a.slice().sort((a,b)=>a-b)[Math.floor((a.length-1)*p)];
const summary=Object.fromEntries(Object.entries(times).map(([k,v])=>[k,{count:v.length,medianMs:q(v,.5),p95Ms:q(v,.95),maxMs:Math.max(...v)}]));
fs.writeFileSync(process.env.GENERATION_REPORT_PATH||'docs/reports/reward-generation-benchmark.json',JSON.stringify({node:process.version,cpu:os.cpus()[0].model,warmup:8,method:'72 identical normalized board/score/seed inputs per version; alternating execution order; Node CPU proxy',summary,samples},null,2)+'\n');console.log(summary);
