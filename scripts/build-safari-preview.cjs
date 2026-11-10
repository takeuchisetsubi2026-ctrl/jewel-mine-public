// Generate an isolated browser trial; Android source remains untouched.
const fs=require('node:fs'),crypto=require('node:crypto'),vm=require('node:vm');
let html=fs.readFileSync('index.html','utf8');
const sourceHash=crypto.createHash('sha256').update(html).digest('hex');
function replace(from,to){if(!html.includes(from))throw Error('Missing source token: '+from);html=html.replace(from,to)}
replace('let opening=!!native,','let opening=true,');
replace("const settingsKey='jewel-mine-feedback-v1';","const settingsKey='jewel-mine-feedback-v1';\n let volume=.65;try{const saved=localStorage.getItem('safari-volume');if(saved!==null&&Number.isFinite(Number(saved)))volume=Math.max(0,Math.min(1,Number(saved)))}catch(_){}");
replace('bus.gain.value=blocked()?0:1;','bus.gain.value=blocked()?0:volume;');
replace("const dialog=document.getElementById('feedbackDialog');","const dialog=document.getElementById('feedbackDialog');\n const volumeInput=document.getElementById('safariVolume');volumeInput.value=Math.round(volume*100);\n volumeInput.addEventListener('input',()=>{volume=Number(volumeInput.value)/100;try{localStorage.setItem('safari-volume',String(volume))}catch(_){}sync()});\n if(!navigator.vibrate){const h=document.getElementById('feedback-haptics');h.disabled=true;h.title='このブラウザでは振動を利用できません'}");
replace('<h2>音・振動</h2>','<h2>音・振動</h2><label>音量 <input id="safariVolume" aria-label="音量" type="range" min="0" max="100" value="65"></label>');
replace('タップでスキップ</small>','タップで開始・音声ON</small>');
replace('SFX診断07｜BGMと効果音バランス','Safari試験版｜N1 / L1');
replace('TEST 09｜v4.0.9｜開発ソース（未ビルド）','Safari試験版｜N1 / L1');
replace('テスト広告 ・自動保存','Safari試験版・広告報酬機能は対象外');
// Isolate all storage accesses, including legacy migration lookups, from old Web saves.
html=html.replaceAll('localStorage.getItem(', 'safariStorage.getItem(').replaceAll('localStorage.setItem(', 'safariStorage.setItem(');
const storage="<script>const safariStorage={getItem:k=>localStorage.getItem('jm-safari-trial-v1:'+k),setItem:(k,v)=>localStorage.setItem('jm-safari-trial-v1:'+k,v)};</script>";
replace('<head>','<head>'+storage);
for(const m of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g))if(!m[1].includes('application/json'))new vm.Script(m[2]);
fs.mkdirSync('safari-preview/assets/opening',{recursive:true});
fs.writeFileSync('safari-preview/index.html',html);
fs.copyFileSync('assets/opening/jewel-mine.png','safari-preview/assets/opening/jewel-mine.png');
fs.writeFileSync('safari-preview/build-info.json',JSON.stringify({kind:'safari-trial',sourceSha256:sourceHash,storagePrefix:'jm-safari-trial-v1:',nativeAds:false,physicalSafariVerified:false},null,2)+'\n');
console.log('Safari preview generated; inline syntax PASS; Android index unchanged: '+sourceHash);
