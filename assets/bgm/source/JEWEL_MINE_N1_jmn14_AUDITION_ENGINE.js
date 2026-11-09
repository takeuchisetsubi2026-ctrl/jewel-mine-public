(()=>{
const root=document.getElementById('jmn14');if(root.dataset.init)return;root.dataset.init='1';
const E=(...a)=>a.map(x=>Array.isArray(x)?x:[x,1]);
const songs=[
{name:'N1',bpm:154,wave:'triangle',bars:[
E(79,79,84,86,null,84,81,79),
E(81,84,86,88,86,84,81,84),
E(86,86,91,88,null,86,84,81),
E(84,86,88,86,[84,2],[81,1],[84,1]),
E(84,84,88,91,null,88,86,84),
E(86,88,91,93,91,88,86,88),
E(91,93,95,93,91,88,86,88),
E(91,88,86,84,[83,1],[81,1],[84,2])
],ch:[[60,64,67],[55,59,62],[57,60,64],[60,64,67],[60,64,67],[65,69,72],[57,60,64],[60,64,67]],bass:[48,43,45,48,48,41,45,48]},
{name:'N2',bpm:156,wave:'sawtooth',bars:[
E(84,84,null,88,86,84,81,84),
E(86,88,91,88,86,84,86,88),
E(91,91,null,93,91,88,86,84),
E(86,88,86,84,[81,2],[84,2]),
E(88,88,null,91,93,91,88,86),
E(91,93,95,93,91,88,91,93),
E(95,93,91,88,86,88,91,88),
E(86,84,83,81,[84,2],[84,2])
],ch:[[60,64,67],[57,60,64],[65,69,72],[60,64,67],[60,64,67],[57,60,64],[65,69,72],[60,64,67]],bass:[48,45,41,48,48,45,41,48]},
{name:'N3',bpm:150,wave:'triangle',bars:[
E([79,2],81,84,86,84,81,79),
E(76,79,81,[84,2],81,79,76),
E(81,84,86,[88,2],86,84,81),
E(79,81,84,81,[79,2],[84,2]),
E([84,2],86,88,91,88,86,84),
E(86,88,91,[93,2],91,88,86),
E(88,91,93,95,93,91,88,86),
E(88,86,84,83,[81,2],[84,2])
],ch:[[60,64,67],[55,59,62],[57,60,64],[60,64,67],[60,64,67],[65,69,72],[57,60,64],[60,64,67]],bass:[48,43,45,48,48,41,45,48]}
];
for(const s of songs){
s.notes=new Map();let p=0;
for(const bar of s.bars){let total=0;for(const [n,d] of bar){s.notes.set(p,{n,d});p+=d;total+=d;}if(total!==8)throw Error('小節長エラー');}
}
let ctx,master,active=-1,timer=null,step=0,next=0,voices=[],snare,hat;
const hz=n=>440*Math.pow(2,(n-69)/12);
function tone(n,t,d,v,w){
if(n==null)return;
const o=ctx.createOscillator(),g=ctx.createGain(),f=ctx.createBiquadFilter();
o.type=w;o.frequency.value=hz(n);f.type='lowpass';f.frequency.value=w==='sawtooth'?2700:5200;
g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,v),t+.009);g.gain.exponentialRampToValueAtTime(.0001,t+d);
o.connect(f);f.connect(g);g.connect(master);o.start(t);o.stop(t+d+.025);voices.push(o);
}
function noise(d){
const b=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*d),ctx.sampleRate),a=b.getChannelData(0);
for(let i=0;i<a.length;i++)a[i]=(Math.random()*2-1)*(1-i/a.length);
return b;
}
function drum(t,type){
if(type==='kick'){
const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.setValueAtTime(145,t);o.frequency.exponentialRampToValueAtTime(46,t+.13);g.gain.setValueAtTime(.14,t);g.gain.exponentialRampToValueAtTime(.0001,t+.17);o.connect(g);g.connect(master);o.start(t);o.stop(t+.18);voices.push(o);
}else{
const o=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();
o.buffer=type==='snare'?snare:hat;f.type='highpass';f.frequency.value=type==='snare'?1350:5700;g.gain.value=type==='snare'?.048:.013;
o.connect(f);f.connect(g);g.connect(master);o.start(t);o.stop(t+o.buffer.duration);voices.push(o);
}
}
function schedule(){
if(active<0)return;
const s=songs[active],unit=60/s.bpm/2;
while(next<ctx.currentTime+.16){
const k=step%64,bar=Math.floor(k/8),t=next,m=s.notes.get(k);
if(m&&m.n!=null){tone(m.n,t,unit*m.d*.88,active===1?.08:.105,s.wave);if(k%4===0)tone(m.n-12,t,unit*.8,.014,'sine');}
if(k%8===0)s.ch[bar].forEach((v,j)=>tone(v,t+j*.012,unit*5.9,.015,'sine'));
if(k%2===0)tone(s.bass[bar]+(k%8===6?7:0),t,unit*1.6,.078,'triangle');
if(k%4===0)drum(t,'kick');if(k%4===2)drum(t,'snare');if(k%2===1)drum(t,'hat');
if(active===1&&k%8===7)drum(t,'kick');
step++;next+=unit;
}
if(voices.length>320)voices=voices.slice(-110);
}
function render(){
root.querySelectorAll('.track').forEach((e,i)=>{e.classList.toggle('active',i===active);e.querySelector('.play').textContent=i===active?'Ⅱ 再生中':'▶ 試聴'});
root.querySelector('#jmn14-status').textContent=active<0?'停止中':songs[active].name+' をループ再生中';
}
function stop(){
if(timer!==null){clearInterval(timer);timer=null;}
for(const v of voices){try{v.stop()}catch(e){}}
voices=[];active=-1;step=0;render();
}
async function play(i){
if(active===i){stop();return;}
stop();const AC=window.AudioContext||window.webkitAudioContext;
if(!AC){root.querySelector('#jmn14-status').textContent='音声再生に非対応です';return;}
try{
if(!ctx){ctx=new AC();master=ctx.createGain();master.connect(ctx.destination);snare=noise(.12);hat=noise(.035);}
await ctx.resume();master.gain.value=Number(root.querySelector('#jmn14-vol').value)/100*.65;
active=i;step=0;next=ctx.currentTime+.05;schedule();timer=setInterval(schedule,45);render();
}catch(e){root.querySelector('#jmn14-status').textContent='再生できませんでした';}
}
root.querySelectorAll('.track').forEach(e=>e.querySelector('.play').addEventListener('click',()=>play(Number(e.dataset.i))));
root.querySelector('#jmn14-stop').addEventListener('click',stop);
root.querySelector('#jmn14-vol').addEventListener('input',e=>{if(master)master.gain.value=Number(e.target.value)/100*.65});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});
render();
})();
