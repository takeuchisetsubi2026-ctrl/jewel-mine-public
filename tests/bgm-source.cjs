const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const evidence=[];
for(const name of ['N1','L1']){
 const path=`assets/bgm/source/JEWEL_MINE_${name}_ORIGINAL.js`;
 const bytes=fs.readFileSync(path),context={};
 vm.runInNewContext(bytes.toString()+`;globalThis.track=${name};`,context,{timeout:1000});
 const t=JSON.parse(JSON.stringify(context.track));
 assert.equal(t.name,name);assert.equal(t.bpm,name==='N1'?154:174);
 assert.equal(t.bars.length,8);assert.equal(t.ch.length,8);assert.equal(t.bass.length,8);
 for(const bar of t.bars){
  assert.equal(bar.reduce((n,[,d])=>n+d,0),8);
  for(const [pitch,duration] of bar){assert(pitch===null||Number.isInteger(pitch)&&pitch>=0&&pitch<=127);assert(Number.isInteger(duration)&&duration>0)}
 }
 for(const chord of t.ch){assert.equal(chord.length,3);assert(chord.every(Number.isInteger))}
 assert(t.bass.every(Number.isInteger));
 evidence.push({name,bpm:t.bpm,bars:8,steps:64,loopSeconds:64*30/t.bpm,sha256:crypto.createHash('sha256').update(bytes).digest('hex')});
}
console.log(JSON.stringify({status:'data-validation-only',originalEngineCompared:false,evidence},null,2));
