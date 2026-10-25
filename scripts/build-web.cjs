const fs=require('node:fs'),path=require('node:path'),{generate,render}=require('./build-identity.cjs');
const root=path.resolve(__dirname,'..'),out=path.join(root,'www');
fs.mkdirSync(out,{recursive:true});fs.mkdirSync('build',{recursive:true});
const metadata=generate();
fs.writeFileSync('build/identity.json',JSON.stringify(metadata,null,2)+'\n');
fs.writeFileSync(path.join(out,'index.html'),render(fs.readFileSync('index.html','utf8'),metadata));
fs.writeFileSync(path.join(out,'build-info.json'),JSON.stringify(metadata,null,2)+'\n');
for(const name of fs.readdirSync(root).filter(x=>x.endsWith('.webp')))fs.copyFileSync(path.join(root,name),path.join(out,name));
console.log(`Built ${metadata.testLabel}, ${metadata.versionName}, ${metadata.gitSha}${metadata.dirty?' DIRTY':''}`);

if(process.env.GITHUB_OUTPUT)fs.appendFileSync(process.env.GITHUB_OUTPUT,`artifactName=${metadata.artifactName}\napkFileName=${metadata.apkFileName}\n`);
