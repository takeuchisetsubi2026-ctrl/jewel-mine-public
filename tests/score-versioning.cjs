const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const source=fs.readFileSync('index.html','utf8'),code=source.split('// BEGIN SCORE VERSIONING')[1].split('// END SCORE VERSIONING')[0];
const api=vm.runInNewContext(code+';({mergeScoreRecords,newScoreRun,hydrateScoreRun,difficultyDecision,legacyEventReward,advanceScoreRun,finishScoreRun,SCORE_RULE_V2,SCORE_RULE_UNKNOWN,SCORE_RULE_MIXED})');
const records=api.mergeScoreRecords({legacyBest:50000,allBest:50000});
let state={score:0,best:50000,sessionBest:50000,...api.newScoreRun(50000,records)};
assert.equal(state.scoreRecords.v2Best,0);assert.equal(state.legacyProgress,0);assert.equal(state.difficultyReference,50000);
state.score=50000;state.legacyProgress=39999;assert.equal(api.difficultyDecision(state).mode,'joy');state.legacyProgress=40000;assert.equal(api.difficultyDecision(state).mode,'challenge');state.challengeLatched=true;state.legacyProgress=0;assert.equal(api.difficultyDecision(state).mode,'challenge');
state=api.hydrateScoreRun({score:12000,best:50000,sessionBest:50000,totalLines:7},records,true);
assert.equal(state.legacyProgress,null);assert.equal(state.difficultyPolicy,'resume-display-unknown');assert.equal(state.scoreRecords.v2Best,0);
const event={cells:1,lines:2,previousLines:7,comboChain:3,feverActive:true,fullClear:false};
const expected=20+Math.round(750*1.09*2)+800;
assert.equal(api.advanceScoreRun(state,event,5000),expected);assert.equal(state.scoreRuleId,api.SCORE_RULE_MIXED);assert.equal(state.legacyProgress,null);assert.equal(state.legacyProgressSinceMigration,expected);assert.equal(state.v2ScoreSinceMigration,5000);assert.equal(state.migrationPrefix.score,12000);
state.score=60000;state.best=60000;api.finishScoreRun(state);assert.equal(state.scoreRecords.v2Best,0);assert.equal(state.scoreRecords.legacyBest,50000);
const fresh={score:10000,best:60000,sessionBest:60000,...api.newScoreRun(60000,state.scoreRecords)};fresh.legacyProgress=7500;api.finishScoreRun(fresh);assert.equal(fresh.scoreRecords.v2Best,10000);assert.equal(fresh.scoreRecords.legacyEquivalentBest,7500);
const c={...fresh,challengeLatched:false,difficultyPolicy:'new-record',sessionV2Best:10000,score:7999};assert.equal(api.difficultyDecision(c).mode,'joy');c.score=8000;assert.equal(api.difficultyDecision(c).mode,'challenge');
const unknown=api.hydrateScoreRun({score:4000,best:5000,sessionBest:5000,totalLines:0},null,false);assert.equal(unknown.legacyProgressSinceMigration,null);api.advanceScoreRun(unknown,event,5000);assert.equal(unknown.legacyProgressSinceMigration,null);
console.log('Score provenance, independent records, exact event progress, migration and sticky boundary: PASS');

const {engine,rng,loadEngine}=require('./piece-test-helpers.cjs'),{candidate}=require('./versioning-comparison.cjs'),prototype=candidate();for(let seed=0;seed<6;seed++){const random=rng(seed),board=Array.from({length:64},()=>random()<.35?0:null);const a=engine.generate(board,0,10000,rng(seed)),b=prototype.generate(board,0,10000,rng(seed));delete a.evaluation.visited;delete b.evaluation.visited;delete a.evaluation.symmetrySkipped;assert.equal(JSON.stringify(a),JSON.stringify(b))}console.log('Selected generator equals compared prototype: PASS');

const repeated=engine.evaluate(Array(64).fill(null),[5,5,5]);assert.equal(repeated.ordersConsidered,6);assert.equal(repeated.symmetrySkipped,5);

const baseline=loadEngine('1ac50c0');for(let seed=0;seed<6;seed++){const random=rng(seed+9),board=Array.from({length:64},()=>random()<.35?0:null),a=engine.generate(board,2000,10000,rng(seed),null,false),b=baseline.generate(board,2000,10000,rng(seed));assert.equal(JSON.stringify(a.ids),JSON.stringify(b.ids));assert.equal(JSON.stringify(a.evaluation.path),JSON.stringify(b.evaluation.path))}console.log('Legacy-resume piece evaluation matches PR3: PASS');
