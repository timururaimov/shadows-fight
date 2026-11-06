/* Эффекты: частицы (пул PL объявлен в game.js) */
function burst(x,y,n,col){for(let i=0,k=0;i<PL.length&&k<n;i++){const p=PL[i];if(p.l<=0){const a=Math.random()*6.28,s=80+Math.random()*260;p.x=x;p.y=y;p.vx=Math.cos(a)*s;p.vy=Math.sin(a)*s-60;p.l=.5;p.c=col;k++}}}
