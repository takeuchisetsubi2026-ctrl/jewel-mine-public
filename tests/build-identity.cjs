const fs=require('node:fs'),cp=require('node:child_process'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {generate,render}=require('../scripts/build-identity.cjs');
const config=require('../config/test-release.json'),m=generate({requireClean:false}),source=fs.readFileSync('index.html','utf8'),base=cp.execFileSync('git',['show','d513c89:index.html'],{encoding:'utf8',maxBuffer:4e6});
// Compare PR4 gameplay after removing the viewport and rewarded-ad additions.
const withoutFeedback = html => html
 .replace('else{setClearHint(false)}','') // Removed stale helper call in invalid preview.
 .replace(/\n if\(comboChain>1\) cosmeticTimeout[^\n]*\n/,'\n')
 .replace(/\n cosmeticTimeout\(\(\)=>feedback.cue\('gem'\)[^\n]*\n/,'\n')
 .replace(".finally(()=>feedback.cue('over'))",'')
 .replace("$('footerStatus').textContent","document.querySelector('.footer').textContent")
 .replace(/<style id="game-feedback-style">[\s\S]*?<\/style>\n/,'')
 .replace(/\/\/ Haptics only work[^\n]*\nfunction buzz[^\n]*\nlet clearHintActive[^\n]*\nfunction setClearHint[^\n]*\n/,'')
 .replace("const feedback=window.JewelMineFeedback;\nfunction buzz(kind){feedback.cue(kind)}\n",'')
 .replace(/setClearHint\((?:false|glowing.size>0)\);/g,'')
 .replace(/^[ ]cosmeticTimeout\(\(\)=>buzz\('(?:fever|score)'\)[^\n]*\n/gm,'')
 .replace("cosmeticTimeout(()=>buzz('clear'),38,'clear-feedback');","buzz('clear');")
 .replace('feedback.setFever(state.feverTurns>0);','')
 .replace('function dragPosition(e,moveFeedback=true){','function dragPosition(e){')
 .replace(/ const cell=r>=0&&c>=0&&r<N&&c<N\?r\*N\+c:null;\n if\(moveFeedback[^\n]*\n d.feedbackCell=cell;\n/,'')
 .replace('dragPosition(e,false);','dragPosition(e);')
 .replace("feedback.afterOpening(()=>{if(!scorePersistenceBlocked&&!canPlay())finishGame()});feedback.startOpening();","if(!scorePersistenceBlocked&&!canPlay())finishGame();");
const normalizeGame = html => withoutFeedback(html)
 .replace(/<style id="game-viewport-lock">[\s\S]*?<\/style>\n/,'')
 .replace(/<script>\n\/\/ Layout-only fitting:[\s\S]*?<\/script>/,'')
  .replace("window.addEventListener('gameviewportresize',refreshDragOrigin);",'')
 .replace(/\/\/ Rewarded board reset:[\s\S]*?(?=render\(\);if\(scorePersistenceBlocked)/,base.slice(base.indexOf("$('restart').addEventListener('click'"),base.indexOf("render();if(scorePersistenceBlocked)",base.indexOf("$('restart').addEventListener('click'"))))
 .replace('drag||rewardedAds.busy||animationLocked','drag||animationLocked')
 .replace('suppressTap||rewardedAds.busy||scorePersistenceBlocked','suppressTap||scorePersistenceBlocked')
 .replace('window.JewelMineAds?.newGame();','')
 .replace('const MAX_REVIVES=2;\n','')
 .replace('revivesUsed:0,','')
 .replace(/\/\/ Older saves have no reliable revive history[^\n]*\nif\(!Number\.isInteger\(state\.revivesUsed\)[^\n]*\n/,'')
 .replace(/ const over=\$\('over'\),revive=\$\('revive'\);\n const remaining=MAX_REVIVES-state\.revivesUsed;\n revive\.disabled=[^\n]*\n revive\.textContent=[^\n]*\n/," const over=$('over');\n")
 .replace(";void rewardedAds.request('game-over')",'')
 // Approved SFX diagnostic changes: exact audio-only substitutions, not gameplay wildcards.
 .replace(' // Combo audio is triggered once by the line-clear transaction in place().\n','')
 .replace("   // SFX-02: a combo replaces the normal line-clear cue; never stack both.\n   cosmeticTimeout(()=>buzz(state.comboChain>1?'combo':'clear'),38,'clear-feedback');\n",'')
 .replace("   document.querySelector('.boardwrap').classList.add('haptic-clear');", "   buzz('clear');document.querySelector('.boardwrap').classList.add('haptic-clear');")
 .replace(' // SFX-01: avoid long score fanfare on every placement; the short place cue is sufficient.\n','')
 .replace('<style>#sfxDiagLabel{position:fixed;z-index:99999;top:3px;left:3px;background:#1c2840;color:#fff;border:2px solid #62e2b6;border-radius:7px;padding:4px 8px;font:700 11px sans-serif;pointer-events:none}</style>','');
const gameSource=normalizeGame(source);
assert.deepEqual([...gameSource.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(x=>x[1]),[...withoutFeedback(base).matchAll(/<script>([\s\S]*?)<\/script>/g)].map(x=>x[1]));
assert.equal(gameSource.split('</head>')[0],base.split('</head>')[0]);
// Prove the audio exceptions cannot hide changes to scoring, FEVER duration or persistence.
for(const [before,after] of [["state.score+=placementPoints","state.score+=placementPoints*2"],["state.feverTurns=5","state.feverTurns=6"],["state.turn++","state.turn+=2"],["localStorage.setItem(KEY","localStorage.setItem('wrong-key'"]]){
 assert.ok(source.includes(before),`Missing negative-test target ${before}`);
 assert.notEqual(normalizeGame(source.replace(before,after)),gameSource,`Must detect ${before}`);
}
assert.equal(m.applicationId,'com.wilduncle.jewelmine.codextest');
assert.equal(m.versionName,config.versionName);assert.equal(m.appName,String(config.testNumber).padStart(2,'0')+' ジュエルマイン');assert.ok(m.versionCode>26);
assert.equal(m.gitSha,cp.execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim());
assert.equal(m.sourceSha256,crypto.createHash('sha256').update(source).digest('hex'));
const html=render(source,m);assert.ok(html.includes(`${m.testLabel}｜v${m.versionName}｜${m.gitSha.slice(0,7)}`));
assert.deepEqual(JSON.parse(html.match(/id="buildMetadata">(.*?)<\/script>/)[1]),m);
assert.equal(require('../capacitor.config.json').appId,m.applicationId);assert.equal(require('../capacitor.config.json').appName,m.appName);
assert.throws(()=>render(source.replace('id="buildIdentity"','id="bad"'),m));
console.log('Build identity, label, versionCode and PR4 logic/CSS preservation outside viewport adapter: PASS');
