const fs=require('fs'),vm=require('vm'),cp=require('child_process');
const source=fs.readFileSync('index.html','utf8');
const shapes=JSON.parse(source.match(/const SHAPES=(\[.*?\]);const COLORS=/)[1]);
const engineSource=source.split('// BEGIN SCORE ADAPTIVE GENERATOR')[1].split('// END SCORE ADAPTIVE GENERATOR')[0];
const engine=vm.runInNewContext('const SHAPES='+JSON.stringify(shapes)+';'+engineSource+';pieceGenerator');
function rng(seed){let x=seed>>>0;return ()=>{x+=0x6d2b79f5;let t=x;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296}}
function oldGenerator(random){
 const old=cp.execFileSync('git',['show','8b598c8:index.html'],{encoding:'utf8',maxBuffer:4e6});
 const oldShapes=JSON.parse(old.match(/const SHAPES=(\[.*?\]);const COLORS=/)[1]);
 const code=old.slice(old.indexOf('const PIECE_POOL='),old.indexOf('try{const x=JSON.parse'));
 const math=Object.create(Math);math.random=random;
 return vm.runInNewContext('const SHAPES='+JSON.stringify(oldShapes)+",N=8,COLORS=Array(6);function dims(s){return [Math.max(...s.map(x=>x[0]))+1,Math.max(...s.map(x=>x[1]))+1]}"+code+';makePieces',{Math:math});
}
module.exports={source,shapes,engine,rng,oldGenerator};
