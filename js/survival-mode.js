/* Настройки бесконечных волн режима выживания. */
function survivalWaveConfig(wave,hero,neraUnlocked=false){
 const n=Math.max(1,Math.floor(wave)),fighters=['sai','lika','mor'];
 if(neraUnlocked)fighters.push('nera');
 const rivals=fighters.filter(id=>id!==hero),foe=rivals[(n-1)%rivals.length],boss=n%5===0;
 return {wave:n,foe,boss,maxHp:boss?180+Math.min(80,(n-5)*8):100+Math.min(150,(n-1)*10),power:1+Math.min(1,(n-1)*.06)+(boss?.25:0),speedScale:1+Math.min(.45,(n-1)*.025)+(boss?.12:0)};
}
