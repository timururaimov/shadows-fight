/* Цикл теневых выбросов для уровней режима ИИ. */
const HAZARD_LANES=[180,450,720];
function createArenaHazard(level){
 if(level%3!==0)return null;
 const lane=(Math.floor(level/3)-1)%HAZARD_LANES.length;
 return {level,lane,x:HAZARD_LANES[lane],phase:'warning',timer:1.25};
}
function advanceArenaHazard(h,dt){
 if(!h||dt<=0)return[];
 const events=[];let left=dt;
 while(left>0){
  if(h.timer>left){h.timer-=left;break}
  left-=h.timer;h.timer=0;
  if(h.phase=='warning'){h.phase='strike';h.timer=.32;events.push({type:'strike',x:h.x,level:h.level})}
  else if(h.phase=='strike'){h.phase='cooldown';h.timer=2.4}
  else{h.lane=(h.lane+1)%HAZARD_LANES.length;h.x=HAZARD_LANES[h.lane];h.phase='warning';h.timer=1.25;events.push({type:'warning',x:h.x,level:h.level})}
  if(left<=0)break
 }
 return events;
}
