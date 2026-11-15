const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const source=fs.readFileSync(path.join(__dirname,'../js/survival-mode.js'),'utf8');
const api=vm.runInNewContext(source+'\n({survivalWaveConfig})');

test('survival chooses a different opponent and increases difficulty by wave',()=>{
 const first=api.survivalWaveConfig(1,'sai');
 const next=api.survivalWaveConfig(2,'sai');
 assert.notEqual(first.foe,'sai');
 assert.notEqual(next.foe,'sai');
 assert.ok(next.maxHp>first.maxHp);
 assert.ok(next.power>first.power);
 assert.ok(next.speedScale>first.speedScale);
});

test('every fifth survival wave is a boss and unlocked Nera can join the rival pool',()=>{
 assert.equal(api.survivalWaveConfig(5,'sai').boss,true);
 assert.equal(api.survivalWaveConfig(6,'sai').boss,false);
 const config=api.survivalWaveConfig(4,'sai',true);
 assert.ok(['lika','mor','nera'].includes(config.foe));
 assert.equal(api.survivalWaveConfig(1,'nera',true).foe==='nera',false);
});
