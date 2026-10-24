const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('index.html','utf8');
for(const match of source.matchAll(/<script>([\s\S]*?)<\/script>/g))new vm.Script(match[1]);
for(const token of ['82.8px','72px',"mode==='fever'?1250",'Math.min(16,indices.length)','k<5;k++'])assert.ok(source.includes(token),token);
assert.equal(fs.readFileSync('www/index.html','utf8'),source);
if(fs.existsSync('android/app/src/main/assets/public/index.html'))assert.equal(fs.readFileSync('android/app/src/main/assets/public/index.html','utf8'),source);
console.log('Syntax, FEVER, bounded particles and generated asset equality: PASS');
