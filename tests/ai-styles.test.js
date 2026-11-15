const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const source=fs.readFileSync(path.join(__dirname,'../js/ai-styles.js'),'utf8');
const api=vm.runInNewContext(source+'\n({chooseAIPlan})');

test('fighters choose distinct actions at the same distance and roll',()=>{
 assert.equal(api.chooseAIPlan('sai',130,.3,true),'go');
 assert.equal(api.chooseAIPlan('lika',130,.3,true),'blk');
 assert.equal(api.chooseAIPlan('mor',130,.3,true),'go');
 assert.equal(api.chooseAIPlan('nera',130,.3,true),'sp');
});

test('Lika retreats and blocks while Mor favors close attacks',()=>{
 assert.equal(api.chooseAIPlan('lika',60,.6,true),'blk');
 assert.equal(api.chooseAIPlan('mor',60,.1,true),'kick');
 assert.equal(api.chooseAIPlan('nera',60,.2,true),'back');
});

test('AI spends special only when its cooldown is ready',()=>{
 assert.notEqual(api.chooseAIPlan('nera',250,.1,false),'sp');
 assert.notEqual(api.chooseAIPlan('sai',250,.1,false),'sp');
});
