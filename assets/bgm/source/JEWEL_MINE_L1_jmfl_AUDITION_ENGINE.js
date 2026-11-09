(()=>{
const root=document.getElementById('jmfl');if(root.dataset.ready)return;root.dataset.ready='1';
const E=(...a)=>a.map(x=>Array.isArray(x)?x:[x,1]);
const songs=[
{name:'L1',bpm:174,mode:0,bars:[
E(77,77,80,77,84,80,77,75),
E(75,75,79,82,79,75,74,75),
E(80,80,84,87,84,80,77,80),
E(79,82,79,77,75,74,[77,2]),
E(84,84,87,84,89,87,84,82),
E(82,82,86,89,86,82,79,82),
E(87,87,92,89,87,84,82,80),
E(79,80,79,77,75,74,[77,2])
],ch:[[53,56,60],[51,55,58],[53,56,60],[50,54,57],[53,56,60],[51,55,58],[50,54,57],[53,56,60]],bass:[41,39,41,38,41,39,38,41]},
{name:'L2',bpm:176,mode:1,bars:[
E(77,77,77,80,[84,2],80,77),
E(75,75,75,79,[82,2],79,75),
E(80,80,80,84,87,84,80,77),
E(79,79,82,79,77,75,[74,2]),
E(84,84,84,87,[89,2],87,84),
E(82,82,82,86,[89,2],86,82),
E(87,87,89,92,89,87,84,82),
E(80,79,77,75,74,75,[77,2])
],ch:[[53,56,60],[51,55,58],[53,56,60],[50,54,57],[56,60,63],[54,58,61],[50,54,57],[53,56,60]],bass:[41,39,41,38,44,42,38,41]},
{name:'L3',bpm:172,mode:2,bars:[
E(77,80,[84,2],80,77,75,77),
E(79,82,[86,2],82,79,75,79),
E(80,84,87,84,80,77,[80,2]),
E(79,82,79,77,75,74,[77,2]),
E([89,2],87,84,82,84,87,89),
E(91,89,[86,2],84,86,[89,2]),
E(92,89,87,84,87,89,[87,2]),
E(84,82,80,79,75,74,[77,2])
],ch:[[53,56,60],[51,55,58],[53,56,60],[50,54,57],[56,60,63],[58,62,65],[55,59,62],[53,56,60]],bass:[41,39,41,38,44,46,43,41]}
];
for(const s of songs){s.events=new Map();let k=0;for(const bar of s.bars){let total=0;for(const [n,d] of bar){s.events.set(k,{n,d});k+=d;total+=d;}if(total!==8)throw Error('invalid bar');}if(k!==64)throw Error('invalid song');}
let ac,master,timer=null,active=-1,step=0,next=0,voices=[],noise;
const hz=n=>440*Math.pow(2,(n-69)/12);
function tone(n,t,d,v,w,cut=2900){
if(n==null)return;
const o=ac.createOscillator(),g=ac.createGain(),f=ac.createBiquadFilter();
o.type=w;o.frequency.value=hz(n);f.type='lowpass';f.frequency.value=cut;
g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.009);
g.gain.exponentialRampToValueAtTime(.0001,t+Math.max(.03,d));
o.connect(f);f.connect(g);g.connect(master);o.start(t);o.stop(t+d+.025);voices.push(o);
}
function drum(t,type){
if(type==='kick'){
const o=ac.createOscillator(),g=ac.createGain();o.type='sine';
o.frequency.setValueAtTime(155,t);o.frequency.exponentialRampToValueAtTime(43,t+.12);
g.gain.setValueAtTime(.17,t);g.gain.exponentialRampToValueAtTime(.0001,t+.15);
o.connect(g);g.connect(master);o.start(t);o.stop(t+.16);voices.push(o);
}else{
const o=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain();
o.buffer=noise;f.type='highpass';f.frequency.value=type==='snare'?1550:6300;
const d=type==='snare'?.09:.028;
g.gain.setValueAtTime(type==='snare'?.063:.018,t);
g.gain.exponentialRampToValueAtTime(.0001,t+d);
o.connect(f);f.connect(g);g.connect(master);o.start(t);o.stop(t+d+.01);voices.push(o);
}
}
function schedule(){
if(active<0)return;const s=songs[active],u=30/s.bpm;
while(next<ac.currentTime+.14){
const k=step%64,b=Math.floor(k/8),p=k%8,t=next,e=s.events.get(k);
if(e){
tone(e.n,t,u*e.d*.88,s.mode===2?.09:.078,s.mode===2?'triangle':'sawtooth',s.mode===1?2200:3000);
if(s.mode===2&&b>=4)tone(e.n+12,t+.012,u*e.d*.58,.012,'sine',6000);
}
if(p===0)s.ch[b].forEach((n,j)=>tone(n,t+j*.011,u*6.4,s.mode===2?.021:.016,'triangle'));
if(p%2===0){
tone(s.bass[b]+(p===6?7:0),t,u*1.48,s.mode===1?.112:.098,'sawtooth',1450);
if(s.mode!==2)tone(s.bass[b]+12,t+.018,u*.5,.014,'square',1300);
}
if(p%4===0)drum(t,'kick');
if(p%4===2)drum(t,'snare');
if(p%2===1||s.mode===1)drum(t,'hat');
if(s.mode===0&&(p===3||p===7))drum(t,'kick');
if(s.mode===1&&(p===1||p===3||p===7))drum(t,'kick');
if(s.mode===2&&b>=4&&p===7)drum(t,'kick');
step++;next+=u;
}
if(voices.length>420)voices=voices.slice(-140);
}
function render(){
root.querySelectorAll('.track').forEach((el,i)=>{el.classList.toggle('active',i===active);el.querySelector('button').textContent=i===active?'Ⅱ 再生中':'▶ 試聴'});
root.querySelector('#jmfl-status').textContent=active<0?'停止中':songs[active].name+' をループ再生中';
}
function stop(){
if(timer!==null){clearInterval(timer);timer=null;}
for(const v of voices){try{v.stop()}catch(e){}}
voices=[];active=-1;step=0;render();
}
async function play(i){
if(i===active){stop();return;}stop();
try{
if(!ac){
const AC=window.AudioContext||window.webkitAudioContext;if(!AC)throw Error('unsupported');
ac=new AC();master=ac.createGain();master.connect(ac.destination);
noise=ac.createBuffer(1,Math.ceil(ac.sampleRate*.12),ac.sampleRate);
const a=noise.getChannelData(0);for(let j=0;j<a.length;j++)a[j]=Math.random()*2-1;
}
await ac.resume();
master.gain.value=Number(root.querySelector('#jmfl-volume').value)/100*.44;
active=i;step=0;next=ac.currentTime+.05;schedule();timer=setInterval(schedule,40);render();
}catch(e){root.querySelector('#jmfl-status').textContent='再生できませんでした';}
}
root.querySelectorAll('.track').forEach(el=>el.querySelector('button').addEventListener('click',()=>play(Number(el.dataset.i))));
root.querySelector('#jmfl-stop').addEventListener('click',stop);
root.querySelector('#jmfl-volume').addEventListener('input',e=>{if(master)master.gain.value=Number(e.target.value)/100*.44});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});render();
})();
