const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),out=path.join(root,'www');
fs.mkdirSync(out,{recursive:true});
// Copy the single canonical game, never maintain a second Android game source.
fs.copyFileSync(path.join(root,'index.html'),path.join(out,'index.html'));
for(const name of fs.readdirSync(root).filter(x=>x.endsWith('.webp')))
 fs.copyFileSync(path.join(root,name),path.join(out,name));
console.log('Web assets generated from root index.html');
