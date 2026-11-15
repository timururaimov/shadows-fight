const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const source=fs.readFileSync(path.join(__dirname,'../js/arena-hazards.js'),'utf8');
const api=vm.runInNewContext(source+'\n({createArenaHazard,advanceArenaHazard})');

test('hazard is enabled only on every third campaign level',()=>{
 assert.equal(api.createArenaHazard(1),null);
 assert.equal(api.createArenaHazard(2),null);
 assert.equal(api.createArenaHazard(3).x,180);
});

test('hazard warns, strikes once, cools down, and moves to the next lane',()=>{
 const hazard=api.createArenaHazard(3);
 assert.equal(api.advanceArenaHazard(hazard,1.2).length,0);
 let events=api.advanceArenaHazard(hazard,.1);
 assert.equal(events[0].type,'strike');
 assert.equal(events[0].x,180);
 assert.equal(hazard.phase,'strike');
 api.advanceArenaHazard(hazard,.4);
 assert.equal(hazard.phase,'cooldown');
 events=api.advanceArenaHazard(hazard,2.5);
 assert.equal(events[0].type,'warning');
 assert.equal(events[0].x,450);
 assert.equal(hazard.phase,'warning');
});
