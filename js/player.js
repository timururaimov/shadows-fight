/* Боец: состояние, атаки, урон, обновление */
/* ---------- fighters ---------- */
const FIGHTERS={
 sai:{name:'Сай · Самурай-тень',short:'Сай',ability:'Шаг сквозь тьму',description:'Рывок сквозь тень с ударом клинком.',speed:255,accent:'#83d9ff'},
 lika:{name:'Лика · Маска',short:'Лика',ability:'Отголосок',description:'Теневой двойник повторяет последнюю атаку.',speed:225,accent:'#d5a4ff'},
 mor:{name:'Мор · Громила',short:'Мор',ability:'Гул бездны',description:'Удар по земле поражает врагов поблизости.',speed:185,accent:'#ff765d'}
};
const AT={punch:{d:.28,hs:.08,he:.2,dmg:6,reach:62,kb:200,cd:.3,sh:0},kick:{d:.46,hs:.16,he:.3,dmg:10,reach:80,kb:340,cd:.75,sh:5},special:{d:.72,hs:.28,dmg:18,reach:120,kb:460,cd:5,sh:8},hit:{d:.3},dodge:{d:.4}};
const mk=(i,name,col,fighter='sai')=>({i,name,col,fighter,speed:FIGHTERS[fighter].speed,x:0,y:G,vx:0,vy:0,dir:1,hp:100,lag:100,act:null,cd:{punch:0,kick:0,special:0,dodge:0},inv:0,cb:0,cbT:0,blk:0,vm:0,vd:0,vb:0,wins:0,ai:0,aiT:0,aiB:0,rc:0,plan:'',t:0,lastMove:'punch',
 inp:{l:0,r:0,block:0,jump:0,punch:0,kick:0,special:0,dodge:0},pose:new Array(10).fill(0),tg:new Array(10).fill(0)});
function rst(f,i){f.x=i?W-220:220;f.y=G;f.vx=f.vy=0;f.dir=i?-1:1;f.hp=f.lag=100;f.act=null;f.inv=0;f.cb=0;f.cbT=0;f.vm=f.vb=0;f.aiB=0;f.plan='';for(const k in f.cd)f.cd[k]=0}
function hurt(t,sx,dmg,kb,sh){
 if(t.inv>0||(t.act&&t.act.type=='dead')||gm.st!='fight')return;
 const bl=t.blk&&(sx-t.x)*t.dir>0,sg=t.x>=sx?1:-1;
 if(bl){dmg*=.2;kb*=.35;SFX.blk();gm.fx.x=t.x+t.dir*23;gm.fx.y=t.y-58;gm.fx.t=.18;gm.fx.kind='block';burst(t.x+t.dir*16,t.y-55,7,'#83d9ff')}
 else{t.act={type:'hit',t:0,d:.3,h:1,b:0};t.inv=.5;if(sh)gm.sh=sh;gm.fx.x=t.x;gm.fx.y=t.y-55;gm.fx.t=.18;gm.fx.kind='hit';SFX.hit();SFX.hurt();burst(t.x,t.y-55,sh>3?20:10,'#ffad78')}
 t.hp=Math.max(0,t.hp-dmg);t.vx=sg*kb;
 if(t.hp<=0){t.act={type:'dead',t:0,d:1e9,h:1,b:0};t.vx=sg*260;t.vy=-300;endR()}
}
function atk(f,t){const d=AT[t];f.act={type:t,t:0,d:d.d,h:0,b:0};f.cd[t]=d.cd;
 if(t=='punch'){f.cb=f.cbT>0?f.cb+1:1;if(f.cb>=3){f.act.b=5;f.cb=0;f.cd.punch=.6}f.cbT=.55}
 if(t=='punch'||t=='kick')f.lastMove=t;
 (t=='special'?SFX.sp:SFX.sw)();f.vx*=.3}
function specialHit(f,o){
 const id=f.fighter,dir=f.dir,power=shadowPower();
 if(id=='sai'){
  const distance=(o.x-f.x)*dir,advance=Math.max(0,Math.min(105,distance-48));
  f.x=Math.max(40,Math.min(W-40,f.x+dir*advance));
  if(distance>-20&&distance<155&&Math.abs(o.y-f.y)<80)hurt(o,f.x,14*power,430,8);
 }else if(id=='lika'){
  ECHOS.push({owner:f,target:o,x:f.x+dir*24,y:f.y,dir,move:f.lastMove,damage:(f.lastMove=='kick'?7:5)*power,delay:.35,t:0,life:.8,hit:0});
 }else{
  burst(f.x,f.y-8,20,FIGHTERS.mor.accent);
  if(Math.abs(o.x-f.x)<145&&Math.abs(o.y-f.y)<85)hurt(o,f.x,18*power,470,8);
 }
}
function upd(f,o,dt){
 const I=f.inp,gr=f.y>=G,live=gm.st=='fight';let a=f.act;
 f.t+=dt;f.inv=Math.max(0,f.inv-dt);f.cbT-=dt;f.vb-=dt;
 for(const k in f.cd)f.cd[k]=Math.max(0,f.cd[k]-dt);
 if(a){a.t+=dt;const d=AT[a.type];
  if(a.type=='special'&&!a.h&&a.t>=d.hs){a.h=1;specialHit(f,o)}
  else if(d&&a.type!='special'&&d.dmg&&!a.h&&a.t>=d.hs&&a.t<=d.he){const dx=(o.x-f.x)*f.dir;if(dx>-12&&dx<d.reach&&Math.abs(o.y-f.y)<70){a.h=1;hurt(o,f.x,d.dmg+a.b,d.kb,d.sh)}}
  if(a.t>=a.d)f.act=a=null}
 if(!a&&live){
  f.blk=(I.block||f.vb>0)&&gr?1:0;
  let m=(I.r?1:0)-(I.l?1:0);if(f.vm>0){f.vm-=dt;m=f.vd}
  f.vx+=(m*(f.blk?0:f.speed)-f.vx)*Math.min(1,dt*(gr?14:3));
  if(I.jump&&gr&&!f.blk){f.vy=-720;SFX.jump()}
  if(!f.blk){if(I.special&&!f.cd.special)atk(f,'special');else if(I.kick&&!f.cd.kick)atk(f,'kick');else if(I.punch&&!f.cd.punch)atk(f,'punch');
   else if(I.dodge&&gr&&!f.cd.dodge){f.act={type:'dodge',t:0,d:.4,h:1,b:0};f.cd.dodge=1;f.inv=.38;f.vx=-f.dir*420}}
 }else{f.blk=0;f.vx*=Math.pow(.015,dt)}
 I.jump=I.punch=I.kick=I.special=I.dodge=0;
 stepBody(f,dt);
 if(!f.act&&gr&&f.hp>0)f.dir=o.x>=f.x?1:-1;
 tgt(f);const k=Math.min(1,dt*(f.act&&f.act.type=='dead'?6:20));
 for(let i=0;i<10;i++)f.pose[i]+=(f.tg[i]-f.pose[i])*k;
 f.lag=f.lag>f.hp?Math.max(f.hp,f.lag-dt*30):f.hp}
