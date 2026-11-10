const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const html=fs.readFileSync('safari-preview/index.html','utf8');
assert(html.includes('let opening=true,'));assert(html.includes("jm-safari-trial-v1:"));
const audio=html.match(/<script id="game-feedback">([\s\S]*?)<\/script>/)[1];
const events={},elements={},stored=new Map(),gains=[];let audioCount=0;
const el=id=>elements[id]??={checked:true,addEventListener(k,f){this[k]=f},showModal(){}};
const param=()=>({value:0,setValueAtTime(){},exponentialRampToValueAtTime(){}});
class Audio{state='suspended';currentTime=0;sampleRate=48000;destination={};constructor(){audioCount++}resume(){this.state='running';return Promise.resolve()}createGain(){const g={gain:param(),connect(){},disconnect(){}};gains.push(g);return g}createOscillator(){return {frequency:param(),connect(){},start(){},stop(){}}}createBiquadFilter(){return {frequency:param(),connect(){}}}createBuffer(c,n,r){return {duration:n/r,getChannelData:()=>new Float32Array(n)}}createBufferSource(){return {connect(){},start(){},stop(){}}}}
const window={AudioContext:Audio,addEventListener:(k,f)=>events[k]=f};
vm.runInNewContext(audio,{window,document:{hidden:false,getElementById:el,addEventListener:(k,f)=>events[k]=f},safariStorage:{getItem:k=>stored.get(k)??null,setItem:(k,v)=>stored.set(k,v)},navigator:{},performance:{now:()=>100},setInterval:()=>1,clearInterval(){},setTimeout:()=>1,clearTimeout(){},Math,Promise});
async function main(){
 const f=window.JewelMineFeedback;f.startOpening();assert.equal(audioCount,0,'no autoplay before gesture');
 events.pointerdown();el('mineOpening').click();await Promise.resolve();assert.equal(f.debug().track,'N1');
 el('safariVolume').value=27;el('safariVolume').input();assert.equal(gains[0].gain.value,.27);assert.equal(stored.get('safari-volume'),'0.27');
 f.setFever(true);assert.equal(f.debug().track,'L1');f.setFever(false);assert.equal(f.debug().track,'N1');
 assert.equal(el('feedback-haptics').disabled,true);console.log('Safari generated preview gesture/volume/persistence/track/haptic UI mock: PASS');
}
main().catch(e=>{console.error(e);process.exitCode=1});
