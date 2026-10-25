const assert=require('assert/strict'),fs=require('fs');
const {shapes,engine:g,rng}=require('./piece-test-helpers.cjs');
const empty=()=>Array(64).fill(null);
assert.equal(g.mode(7999,10000),'joy');assert.equal(g.mode(8000,10000),'challenge');assert.equal(g.mode(20000,10000),'challenge');assert.equal(g.mode(0,0),'joy');
assert.equal(g.config.bar4Share,.5);
assert.deepEqual(Array.from(g.groups.rectangle6),[12,33]);
for(const ids of Object.values(g.groups))assert(ids.every(i=>i!==27&&i!==29));
for(let i=0;i<33;i++)assert(shapes[i]);
// Independent array implementation: rows and columns clear simultaneously.
function reference(board,id,r,c){const b=board.slice();for(const [x,y] of shapes[id]){assert.equal(b[(r+y)*8+c+x],null);b[(r+y)*8+c+x]=0}const rows=[],cols=[];for(let k=0;k<8;k++){if(Array.from({length:8},(_,j)=>b[k*8+j]).every(v=>v!==null))rows.push(k);if(Array.from({length:8},(_,j)=>b[j*8+k]).every(v=>v!==null))cols.push(k)}for(let i=0;i<64;i++)if(rows.includes(i>>3)||cols.includes(i%8))b[i]=null;return {board:b,lines:rows.length+cols.length}}
const random=rng(0x12345678);
for(let t=0;t<1000;t++){
 const board=empty().map(()=>random()<.4?0:null),b=g.encode(board),id=Math.floor(random()*shapes.length);
 for(const p of g.masks[id])if(g.fits(b,p)){const ref=reference(board,id,p.r,p.c),actual=g.apply(b,p);assert.equal(actual.lines,ref.lines);assert.deepEqual(Array.from(g.decode(actual)),ref.board)}
}
// 9+9+6 really can clear three rows on an empty 8x8 when the 6 is 2x3.
const good=g.evaluate(empty(),[13,13,33]);assert(good.complete);assert(good.allClear);assert.equal(good.ordersConsidered,6);
function verify(board,ids,result){let b=board.slice();for(const p of result.path){assert.equal(p.id,ids[p.index]);const ref=reference(b,p.id,p.r,p.c);assert.equal(ref.lines,p.lines);assert.equal(ref.lines>0&&ref.board.every(v=>v===null),p.allClear);b=ref.board}assert.equal(new Set(result.path.map(p=>p.index)).size,result.path.length)}
verify(empty(),[13,13,33],good);
// Same 24-cell set on a board with one extra cell cannot clear all 25 cells.
const one=empty();one[63]=0;const bad=g.evaluate(one,[13,13,33],{beamWidth:Infinity});assert.equal(bad.allClear,false);assert.equal(bad.exhaustive,true);
// A deliberately scarce board needs the small piece first to make room for 3x3.
const scarce=Array(64).fill(0);for(let r=0;r<2;r++)for(let c=0;c<3;c++)scarce[r*8+c]=null;
for(const [r,c] of [[2,7],[3,3],[4,4],[5,5],[6,6],[7,7]])scarce[r*8+c]=null;
const scarceResult=g.evaluate(scarce,[13,0,5],{beamWidth:Infinity});assert(scarceResult.complete);assert.equal(scarceResult.ordersConsidered,6);assert(scarceResult.completeOrders.every(order=>order[0]!=='0'));assert(scarceResult.completeOrders.some(order=>order[0]==='1'));verify(scarce,[13,0,5],scarceResult);
// Bounded evaluations only assert witnessed feasibility; unknown is not impossible.
for(let seed=0;seed<24;seed++){const random=rng(seed),board=empty().map(()=>random()<.45?0:null),candidate=g.generate(board,0,10000,random);verify(board,candidate.ids,candidate.evaluation);assert(candidate.evaluation.complete);assert(candidate.ids.every(id=>id!==27&&id!==29))}
const stats={};
for(const mode of ['joy','challenge']){
 const random=rng(mode==='joy'?20261025:20261026),count=100000,counts={square4:0,rectangle6:0,square9:0,bar:0,other:0},bar={horizontal:0,vertical:0,four:0,five:0},seen=new Set();
 for(let i=0;i<count;i++){const id=g.draw(mode,random);seen.add(id);const cat=g.category(id);counts[cat]++;if(cat==='bar'){bar[Math.max(...shapes[id].map(p=>p[1]))===0?'horizontal':'vertical']++;bar[shapes[id].length===4?'four':'five']++}}
 const rows=Object.fromEntries(Object.entries(counts).map(([k,n])=>{const actual=n/count*100,target=g.config.weights[mode][k];assert(Math.abs(actual-target)<.65);return [k,{count:n,targetPercent:target,actualPercent:actual,errorPercentagePoints:actual-target}]}));
 for(const id of [5,12,13,33,9,23,24,25])assert(seen.has(id));assert(!seen.has(27)&&!seen.has(29));assert(Math.abs(bar.horizontal/(bar.horizontal+bar.vertical)-.5)<.02);stats[mode]={count,rows,bar};
}
// Base drawing and corrected selection consume injected RNG only and are repeatable.
const a=g.generate(empty(),0,10000,rng(42)),b=g.generate(empty(),0,10000,rng(42));assert.deepEqual(a,b);verify(empty(),a.ids,a.evaluation);
fs.mkdirSync('docs/reports',{recursive:true});fs.writeFileSync('docs/reports/piece-base-statistics.json',JSON.stringify({seed:'20261025/20261026',stats,checks:{independentTransitionTrials:1000,allOrders:6,areaOnlyFalsePositive:false,retiredIds:[27,29],deterministic:true}},null,2)+'\n');
console.log('Piece functional + 200000 base draws: PASS');
