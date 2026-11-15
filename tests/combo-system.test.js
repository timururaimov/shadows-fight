const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const source=fs.readFileSync(path.join(__dirname,'../js/combo-system.js'),'utf8');
const api=vm.runInNewContext(source+'\n({recordComboHit,updateComboTimer})');

test('combo increments consecutive hits and awards a small reward every three hits',()=>{
 const fighter={combo:0,comboTimer:0,comboBest:0};
 assert.equal(api.recordComboHit(fighter).count,1);
 assert.equal(api.recordComboHit(fighter).reward,0);
 let result=api.recordComboHit(fighter);
 assert.equal(result.count,3);
 assert.equal(result.reward,2);
 assert.equal(api.recordComboHit(fighter).reward,0);
 assert.equal(api.recordComboHit(fighter).reward,0);
 assert.equal(api.recordComboHit(fighter).reward,2);
 assert.equal(fighter.comboBest,6);
});

test('combo resets after its timeout and restarts at one hit',()=>{
 const fighter={combo:2,comboTimer:.15,comboBest:2};
 assert.equal(api.updateComboTimer(fighter,.1),true);
 assert.equal(api.updateComboTimer(fighter,.1),false);
 assert.equal(fighter.combo,0);
 assert.equal(api.recordComboHit(fighter).count,1);
});
