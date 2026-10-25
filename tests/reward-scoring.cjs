const fs=require('fs'),assert=require('assert/strict'),{calculateLineReward:reward}=require('./piece-test-helpers.cjs');
const rows=[];
for(let lines=1;lines<=6;lines++)for(const previous of [0,5,10,20,40])for(const combo of [1,2,4])for(const fever of [false,true]){
 const r=reward(lines,previous,combo,fever),base=300*lines+150*Math.max(0,lines-1),expected=Math.round((base*lines*(1+.05*previous)+(combo-1)*100*lines)*(fever?2:1));
 assert.equal(r.lineEventPoints,expected);assert.equal(r.cumulativeMultiplier,1+.05*previous);assert.equal(r.simultaneousMultiplier,lines);rows.push({lines,previous,combo,fever,points:r.lineEventPoints});
}
assert.equal(reward(1,.02,1,true).lineEventPoints,601); // Synthetic fractional input exposes intermediate rounding.
fs.writeFileSync('docs/reports/reward-score-table.json',JSON.stringify({formula:'round(((300*n+150*max(0,n-1))*n*(1+0.05*L_before)+(combo-1)*100*n)*FEVER)',excluded:['placement','jewel','all-clear'],rows},null,2)+'\n');
console.log('Line reward arithmetic (180 combinations): PASS');
