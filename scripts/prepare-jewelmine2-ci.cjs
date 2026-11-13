// CI-only preparation of generated Jewelmine2 assets; never modifies committed TEST 09 sources.
const fs = require('node:fs');
const assert = require('node:assert/strict');
const ID = 'com.takeuchisetsubi.jewelmine2';
assert.equal(process.env.CI, 'true', 'CI-only tool');
assert.ok(['feature/jewelmine2-unsigned-aab-20261104','feat/jewelmine2-feedback-resume-20261107','feat/work3-bgm-ci-20261110','feat/work3-n1-l1-integration-20261110','fix/jewelmine2-final-ad-cadence-20261113'].includes(process.env.GITHUB_REF_NAME), 'Unexpected branch');
const identityPath = 'build/identity.json';
const m = JSON.parse(fs.readFileSync(identityPath, 'utf8'));
assert.equal(m.applicationId, 'com.wilduncle.jewelmine.codextest', 'Unexpected source identity');
assert.equal(m.testLabel, 'TEST 09', 'Unexpected source test label');
m.applicationId = ID;
m.appName = 'ジュエルマイン2';
m.testLabel = 'Jewelmine2';
m.certificateSha256 = null; // Unsigned artifact: never imply the TEST 09 key is used.
const config = JSON.parse(fs.readFileSync('capacitor.config.json', 'utf8'));
assert.equal(config.appId, 'com.wilduncle.jewelmine.codextest');
config.appId = ID;
config.appName = m.appName;
fs.writeFileSync('capacitor.config.json', JSON.stringify(config, null, 2) + '\n');
for (const path of [identityPath, 'www/build-info.json']) {
  fs.writeFileSync(path, JSON.stringify(m, null, 2) + '\n');
}
const path = 'www/index.html';
let html = fs.readFileSync(path, 'utf8');
const scriptPattern = /(<script type="application\/json" id="buildMetadata">)[\s\S]*?(<\/script>)/g;
assert.equal([...html.matchAll(scriptPattern)].length, 1, 'Expected one embedded buildMetadata');
html = html.replace(scriptPattern, (_, open, close) => open + JSON.stringify(m).replace(/</g, '\\u003c') + close);
const labelPattern = /(<div[^>]*id="buildIdentity"[^>]*>)[\s\S]*?(<\/div>)/g;
assert.equal([...html.matchAll(labelPattern)].length, 1, 'Expected one buildIdentity label');
html = html.replace(labelPattern, (_, open, close) => open + 'Jewelmine2｜v' + m.versionName + '｜' + m.gitSha.slice(0, 7) + close);
fs.writeFileSync(path, html);
assert.equal(JSON.parse(fs.readFileSync('www/build-info.json', 'utf8')).applicationId, ID);
assert.equal(JSON.parse(fs.readFileSync('capacitor.config.json', 'utf8')).appId, ID);
console.log('Prepared generated Jewelmine2 identity (unsigned; TEST 09 source preserved)');
