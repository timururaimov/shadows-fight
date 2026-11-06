/* Физика: константы арены, гравитация, границы, столкновение бойцов */
const W=900,H=450,G=390,GRAV=1800;
function stepBody(f,dt){
  f.vy+=GRAV*dt;f.y=Math.min(G,f.y+f.vy*dt);if(f.y>=G&&f.vy>0)f.vy=0;
  f.x=Math.max(40,Math.min(W-40,f.x+f.vx*dt)); // не выходим за арену
}
function separate(a,b){ // бойцы не проходят друг сквозь друга
  const dx=b.x-a.x;
  if(Math.abs(dx)<30&&Math.abs(a.y-b.y)<60){const sg=dx>=0?1:-1,p=(30-Math.abs(dx))/2;a.x-=sg*p;b.x+=sg*p}
}
