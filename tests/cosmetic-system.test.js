const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const source=fs.readFileSync(path.join(__dirname,'../js/cosmetic-system.js'),'utf8');
const api=vm.runInNewContext(source+'\n({getCosmetic,unlockedCosmetics})');

test('cosmetic rewards unlock at their level milestones',()=>{
 assert.equal(Array.from(api.unlockedCosmetics(4),x=>x.id).join(','),'shadow');
 assert.equal(Array.from(api.unlockedCosmetics(5),x=>x.id).join(','),'shadow,embers');
 assert.equal(Array.from(api.unlockedCosmetics(15),x=>x.id).join(','),'shadow,embers,moonlight');
 assert.equal(Array.from(api.unlockedCosmetics(25),x=>x.id).length,4);
});

test('unknown cosmetic safely falls back to the default',()=>{
 assert.equal(api.getCosmetic('missing').id,'shadow');
});
