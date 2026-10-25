const fs=require('node:fs'),cp=require('node:child_process'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const config=require('../config/test-release.json');
function generate({requireClean=true}={}){
 const sha=cp.execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
 const dirty=!!cp.execFileSync('git',['status','--porcelain','--untracked-files=normal'],{encoding:'utf8'}).trim();
 if(process.env.CI&&requireClean)assert.equal(dirty,false,'CI must build a clean checkout');
 if(process.env.GITHUB_EVENT_NAME==='push'&&process.env.GITHUB_SHA)assert.equal(sha,process.env.GITHUB_SHA,'checkout mismatch');
 const n=config.testNumber,run=Number(process.env.GITHUB_RUN_NUMBER||0),attempt=Number(process.env.GITHUB_RUN_ATTEMPT||1);
 assert.ok(Number.isInteger(n)&&n>0&&n<=2000);
 assert.ok(Number.isInteger(run)&&run>=0&&run<100000);
 assert.ok(Number.isInteger(attempt)&&attempt>0&&attempt<10);
 assert.match(config.versionName,/^\d+\.\d+\.\d+$/);
 const number=String(n).padStart(2,'0'),appName=`${number} ジュエルマイン`,versionCode=n*1000000+run*10+attempt;
 assert.ok(versionCode<=2100000000);
 const source=fs.readFileSync('index.html','utf8'),sourceSha256=crypto.createHash('sha256').update(source).digest('hex');
 const m={schema:1,testNumber:n,testLabel:`TEST ${number}`,appName,versionName:config.versionName,versionCode,applicationId:config.applicationId,gitSha:sha,dirty,buildUtc:new Date().toISOString(),sourceSha256,certificateSha256:config.certificateSha256,runNumber:run,runAttempt:attempt,runUrl:process.env.GITHUB_REPOSITORY&&process.env.GITHUB_RUN_ID?`https://github.com/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`:null};
 m.artifactName=`jewel-mine-test-${number}-${sha.slice(0,7)}-${run}-${attempt}`;
 m.apkFileName=`jewel-mine-test-${number}-v${m.versionName}-${sha.slice(0,7)}-${run}-${attempt}-debug.apk`;
 return m;
}
function render(source,m){
 const label=`${m.testLabel}｜v${m.versionName}｜${m.gitSha.slice(0,7)}${m.dirty?' DIRTY':''}`;
 const count=source.split('id="buildIdentity"').length-1;assert.equal(count,1);
 return source.replace(/(<div[^>]*id="buildIdentity"[^>]*>)[\s\S]*?(<\/div>)/,(_,a,b)=>a+label+b).replace('</head>',`<script type="application/json" id="buildMetadata">${JSON.stringify(m).replace(/</g,'\\u003c')}</script></head>`);
}
module.exports={generate,render};
