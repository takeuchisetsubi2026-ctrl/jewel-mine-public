const fs=require('node:fs'),cp=require('node:child_process'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {generate,render}=require('../scripts/build-identity.cjs');
const config=require('../config/test-release.json'),m=generate({requireClean:false}),source=fs.readFileSync('index.html','utf8'),base=cp.execFileSync('git',['show','d513c89:index.html'],{encoding:'utf8',maxBuffer:4e6});
// Preserve the PR4 game logic and styles except the explicit viewport adapter.
const gameSource=source
 .replace(/<style id="game-viewport-lock">[\s\S]*?<\/style>\n/,'')
 .replace(/<script>\n\/\/ Layout-only fitting:[\s\S]*?<\/script>/,'')
  .replace("window.addEventListener('gameviewportresize',refreshDragOrigin);",'')
 .replace(/\/\/ Rewarded board reset:[\s\S]*?(?=render\(\);if\(scorePersistenceBlocked)/,base.slice(base.indexOf("$('restart').addEventListener('click'"),base.indexOf("render();if(scorePersistenceBlocked)",base.indexOf("$('restart').addEventListener('click'"))))
 .replace('drag||rewardedAds.busy||animationLocked','drag||animationLocked')
 .replace('suppressTap||rewardedAds.busy||scorePersistenceBlocked','suppressTap||scorePersistenceBlocked');
assert.deepEqual([...gameSource.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(x=>x[1]),[...base.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(x=>x[1]));
assert.equal(gameSource.split('</head>')[0],base.split('</head>')[0]);
assert.equal(m.applicationId,'com.wilduncle.jewelmine.codextest');
assert.equal(m.versionName,config.versionName);assert.equal(m.appName,String(config.testNumber).padStart(2,'0')+' ジュエルマイン');assert.ok(m.versionCode>26);
assert.equal(m.gitSha,cp.execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim());
assert.equal(m.sourceSha256,crypto.createHash('sha256').update(source).digest('hex'));
const html=render(source,m);assert.ok(html.includes(`${m.testLabel}｜v${m.versionName}｜${m.gitSha.slice(0,7)}`));
assert.deepEqual(JSON.parse(html.match(/id="buildMetadata">(.*?)<\/script>/)[1]),m);
assert.equal(require('../capacitor.config.json').appId,m.applicationId);assert.equal(require('../capacitor.config.json').appName,m.appName);
assert.throws(()=>render(source.replace('id="buildIdentity"','id="bad"'),m));
console.log('Build identity, label, versionCode and PR4 logic/CSS preservation outside viewport adapter: PASS');
