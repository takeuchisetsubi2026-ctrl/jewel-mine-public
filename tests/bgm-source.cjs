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
 const enginePath=`assets/bgm/source/JEWEL_MINE_${name}_${name==='N1'?'jmn14':'jmfl'}_AUDITION_ENGINE.js`;
 const engineBytes=fs.readFileSync(enginePath),engine=engineBytes.toString();
 const songsLiteral=engine.match(/const songs=(\[[\s\S]*?\n\]);\nfor\(const s of songs\)/);
 assert(songsLiteral,`${name} songs literal`);
 const sourceContext={};vm.runInNewContext(`const E=(...a)=>a.map(x=>Array.isArray(x)?x:[x,1]);globalThis.songs=${songsLiteral[1]}`,sourceContext,{timeout:1000});
 const original=JSON.parse(JSON.stringify(sourceContext.songs[0]));
 assert.deepEqual(original,t,`${name} extract must equal the first audition track`);
 const required=name==='N1'?
  ["snare=noise(.12);hat=noise(.035)","unit=60/s.bpm/2","unit*m.d*.88","unit*5.9,.015,'sine'","unit*1.6,.078,'triangle'","setInterval(schedule,45)","value)/100*.65"]:
  ["noise=ac.createBuffer(1,Math.ceil(ac.sampleRate*.12)","u=30/s.bpm","u*e.d*.88","u*6.4","u*1.48","const d=type==='snare'?.09:.028","setInterval(schedule,40)","value)/100*.44"];
 for(const token of required)assert(engine.includes(token),`${name} engine token: ${token}`);
 evidence.push({name,bpm:t.bpm,bars:8,steps:64,loopSeconds:64*30/t.bpm,extractSha256:crypto.createHash('sha256').update(bytes).digest('hex'),engineSha256:crypto.createHash('sha256').update(engineBytes).digest('hex'),originalTrackEqual:true});
}
console.log(JSON.stringify({status:'full-audition-engine-compared',originalEngineCompared:true,evidence},null,2));
