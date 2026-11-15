/* Учёт непрерывных серий попаданий. */
function recordComboHit(f){
 f.combo=f.comboTimer>0?f.combo+1:1;
 f.comboTimer=2;
 f.comboBest=Math.max(f.comboBest||0,f.combo);
 return {count:f.combo,reward:f.combo>=3&&f.combo%3===0?2:0};
}
function updateComboTimer(f,dt){
 if(f.comboTimer<=0)return false;
 f.comboTimer=Math.max(0,f.comboTimer-dt);
 if(f.comboTimer===0)f.combo=0;
 return f.combo>0;
}
