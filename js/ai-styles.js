/* Тактика ИИ зависит от характера бойца. */
function chooseAIPlan(fighter,distance,roll,canSpecial){
 if(fighter=='sai'){
  if(distance>170)return canSpecial&&roll<.2?'sp':roll<.3?'jump':'go';
  if(distance>85)return roll<.45?'go':roll<.68?'kick':roll<.78?'jump':'punch';
  return roll<.48?'punch':roll<.76?'kick':roll<.88?'back':'blk';
 }
 if(fighter=='lika'){
  if(distance>200)return canSpecial&&roll<.18?'sp':'go';
  if(distance>105)return roll<.32?'blk':roll<.62?'kick':roll<.78?'back':'punch';
  return roll<.48?'back':roll<.82?'blk':'kick';
 }
 if(fighter=='mor'){
  if(distance>170)return roll<.18?'jump':'go';
  if(distance>85)return canSpecial&&roll<.12?'sp':roll<.75?'go':'kick';
  return roll<.62?'kick':roll<.84?'punch':'blk';
 }
 if(fighter=='nera'){
  if(distance<85)return roll<.56?'back':roll<.8?'blk':'kick';
  if(canSpecial&&roll<(distance>200?.55:.34))return 'sp';
  return distance>150?'go':roll<.55?'kick':'punch';
 }
 if(distance>170)return canSpecial&&roll<.15?'sp':roll<.2?'jump':'go';
 if(distance>85)return roll<.4?'go':roll<.6?'kick':roll<.7?'jump':'punch';
 return roll<.4?'punch':roll<.6?'kick':roll<.75?'back':roll<.9?'blk':'punch';
}
