/* Существа арены: рисуем цельные силуэты, а позы управляют плащами и конечностями. */
function tgt(f){const T=f.tg,a=f.act,ty=a&&a.type,t=f.t,gr=f.y>=G,sp=Math.abs(f.vx),lp=(x,y,e)=>x+(y-x)*e;let v;
 if(ty=='dead')v=[-.2,-.9,0,.9,0,.2,-.1,-.2,-.1,0];
 else if(ty=='hit')v=[-.35,-.5,.5,-.9,.3,-.2,-.3,.3,-.5,.2];
 else if(ty=='dodge')v=[-.4,1,1.5,.5,1.6,.5,-.8,-.5,-.6,.7];
 else if(ty=='punch'){const e=Math.sin(Math.min(1,a.t/a.d*1.15)*Math.PI);v=[.1+.25*e,lp(.6,1.57,e),lp(2,0,e),.3,2.2,.45,-.4,-.3,-.3,.25]}
 else if(ty=='kick'){const e=Math.sin(a.t/a.d*Math.PI);v=[-.25*e,.3,1,-.6,.6,lp(.25,1.55,e),lp(-.5,0,e),-.1,-.1,0]}
 else if(ty=='special'){const ch=a.t<.3;v=[ch?-.1:.3,ch?-.8:1.57,0,ch?-1:1.5,0,.5,-.4,-.4,-.3,.3]}
 else if(f.blk)v=[.15,.9,1.9,.8,2,.2,-.4,-.2,-.3,.35];
 else if(!gr)v=[.1,2.3,.3,2,.4,.9,-1.2,-.3,-1,0];
 else if(sp>40){const run=sp>150,s=Math.sin(t*(run?15:10)),k=run?1:.65;v=[run?.35:.1,run?.3-s:.6+.2*s,run?1.5:2,run?.3+s:.3,run?1.5:2.2,k*s,-.2-.6*(1-s)/2,-k*s,-.2-.6*(1+s)/2,run?.2:.1]}
 else{const b=Math.sin(t*3);v=[.1+.03*b,.6,2,.3,2.2,.25,-.5,-.2,-.3,.25+.05*b]}
 for(let i=0;i<10;i++)T[i]=v[i]}
function drawF(f,ox=0,alpha=1){
 const id=f.fighter||'sai',P=f.pose,a=f.act,ty=a&&a.type,accent=f.accentOverride||FIGHTERS[id].accent;
 c.save();c.globalAlpha=alpha*(ty=='dodge'?.42:f.inv>0&&ty!='hit'&&(f.t*25|0)%2?.55:1);
 c.translate(f.x+ox,f.y);if(ty=='dead')c.rotate(-f.dir*Math.min(1,a.t*2.5)*1.2);c.scale(f.dir,1);
 c.lineJoin='round';c.lineCap='round';
 // Мягкий ореол отличает бойцов от тёмного фона.
 c.shadowColor=accent;c.shadowBlur=id=='mor'?8:13;
 if(id=='sai')drawSai(f,P,accent);
 else if(id=='lika')drawLika(f,P,accent);
 else drawMor(f,P,accent);
 drawCombatFX(f,ty,accent);
 c.shadowBlur=0;c.restore()
}
function limb(x,y,angle,length,width,color){c.save();c.translate(x,y);c.rotate(angle);c.fillStyle=color;c.beginPath();c.roundRect(-width/2,0,width,length,width/2);c.fill();c.restore()}
function drawCombatFX(f,ty,accent){
 if(f.blk){c.save();c.globalAlpha=.38+.12*Math.sin(f.t*18);c.fillStyle=accent;c.strokeStyle=accent;c.lineWidth=3;c.beginPath();c.moveTo(4,-101);c.quadraticCurveTo(42,-91,43,-62);c.quadraticCurveTo(40,-34,4,-25);c.quadraticCurveTo(22,-61,4,-101);c.fill();c.globalAlpha=.95;c.stroke();c.restore()}
 if(ty=='punch'||ty=='kick'){
  const a=f.act,phase=Math.max(0,Math.min(1,a.t/a.d)),kick=ty=='kick';
  if(phase>(kick?.18:.12)&&phase<(kick?.82:.88)){c.save();c.globalAlpha=.9*Math.sin(Math.PI*(phase-(kick?.18:.12))/(kick?.64:.76));c.strokeStyle=accent;c.lineWidth=kick?5:4;c.beginPath();c.arc(kick?22:15,kick?-38:-59,kick?39:31,kick?-1.25:-1.45,kick?.82:.95);c.stroke();c.restore()}
 }else if(ty=='dodge'){
  c.save();c.globalAlpha=.45;c.strokeStyle=accent;c.lineWidth=4;for(let i=0;i<3;i++){c.beginPath();c.moveTo(-18-i*8,-30-i*16);c.lineTo(-43-i*10,-30-i*16);c.stroke()}c.restore()
 }else if(ty=='hit'){
  c.save();c.strokeStyle='#ffb16d';c.lineWidth=3;c.globalAlpha=.8;c.beginPath();c.moveTo(12,-91);c.lineTo(23,-103);c.moveTo(18,-81);c.lineTo(32,-82);c.moveTo(5,-98);c.lineTo(-2,-109);c.stroke();c.restore()
 }else if(ty=='special'){
  c.save();c.globalAlpha=.55;c.strokeStyle=accent;c.lineWidth=3;c.beginPath();c.arc(0,-62,27+Math.sin(f.act.t*22)*4,0,Math.PI*2);c.stroke();c.restore()
 }
}
function drawSai(f,p,a){
 const lean=p[0]*8,robe=c.createLinearGradient(-25,-75,22,-5);robe.addColorStop(0,'#30283d');robe.addColorStop(1,'#090b12');
 // Рваный плащ и широкие плечи.
 c.fillStyle=robe;c.strokeStyle='#596176';c.lineWidth=2;c.beginPath();c.moveTo(-18+lean,-76);c.lineTo(17+lean,-76);c.lineTo(26,-42);c.lineTo(18,-17);c.lineTo(28,-3);c.lineTo(7,-10);c.lineTo(-3,-1);c.lineTo(-9,-13);c.lineTo(-28,-4);c.lineTo(-22,-28);c.lineTo(-29,-48);c.closePath();c.fill();c.stroke();
 limb(-17,-70,p[1],23,12,'#171723');limb(18,-70,p[3],23,12,'#171723');
 limb(-8,-16,p[5]-.15,24,13,'#101018');limb(8,-16,p[7]-.15,24,13,'#101018');
 // Маска самурая, гребень и лезвие.
 c.fillStyle='#171723';c.beginPath();c.moveTo(-14,-99);c.lineTo(-10,-110);c.lineTo(-2,-104);c.lineTo(3,-113);c.lineTo(10,-102);c.lineTo(14,-97);c.lineTo(12,-79);c.lineTo(0,-72);c.lineTo(-13,-80);c.closePath();c.fill();
 c.fillStyle=a;c.fillRect(2,-91,8,3);c.fillRect(2,-84,7,2);
 c.strokeStyle='#171723';c.lineWidth=5;c.beginPath();c.moveTo(11,-54);c.lineTo(25,-31);c.stroke();
 c.strokeStyle=a;c.lineWidth=2;c.beginPath();c.moveTo(17,-67);c.lineTo(44,-22);c.stroke();
}
function drawLika(f,p,a){
 const sway=Math.sin(f.t*3)*2;
 // Вместо ног — разветвлённый дымчатый подол.
 c.fillStyle='#211a30';c.strokeStyle='#66517d';c.lineWidth=2;c.beginPath();c.moveTo(-19,-76);c.quadraticCurveTo(-35,-45,-27,-22);c.lineTo(-37,-7);c.lineTo(-17,-16);c.lineTo(-7,-3);c.lineTo(2,-18);c.lineTo(18,-5);c.lineTo(20,-22);c.quadraticCurveTo(34,-50,17,-77);c.closePath();c.fill();c.stroke();
 c.fillStyle='#332641';c.beginPath();c.ellipse(sway,-66,28,15,-.1,0,Math.PI*2);c.fill();
 limb(-17,-67,p[1],25,13,'#282032');limb(17,-67,p[3],25,13,'#282032');
 // Плавающая маска с прорезями-глазами и меняющейся улыбкой.
 c.fillStyle='#ddd4e2';c.strokeStyle='#8a719b';c.lineWidth=2;c.beginPath();c.moveTo(-13,-104);c.quadraticCurveTo(0,-114,14,-103);c.lineTo(12,-83);c.quadraticCurveTo(0,-72,-12,-83);c.closePath();c.fill();c.stroke();
 c.fillStyle=a;c.beginPath();c.moveTo(-9,-97);c.lineTo(-2,-94);c.lineTo(-8,-90);c.closePath();c.fill();c.beginPath();c.moveTo(9,-97);c.lineTo(2,-94);c.lineTo(8,-90);c.closePath();c.fill();
 c.strokeStyle='#5d496d';c.lineWidth=2;c.beginPath();c.arc(0,-84,5,.2,2.9);c.stroke();
 c.fillStyle='rgba(208,163,255,.45)';c.beginPath();c.ellipse(-26,-34,8,17,-.35,0,7);c.ellipse(28,-48,6,14,.4,0,7);c.fill()
}
function drawMor(f,p,a){
 const pulse=Math.sin(f.t*2)*1.5,body=c.createLinearGradient(-35,-90,35,-10);body.addColorStop(0,'#39303b');body.addColorStop(1,'#17141d');
 // Тяжёлая широкая туша, массивные рукава и короткие ноги.
 c.fillStyle=body;c.strokeStyle='#66525b';c.lineWidth=3;c.beginPath();c.moveTo(-26,-79);c.lineTo(-39,-65);c.lineTo(-31,-48);c.lineTo(-25,-43);c.lineTo(-21,-18);c.lineTo(-31,-5);c.lineTo(-8,-4);c.lineTo(-3,-19);c.lineTo(8,-19);c.lineTo(13,-4);c.lineTo(35,-4);c.lineTo(22,-20);c.lineTo(28,-47);c.lineTo(38,-61);c.lineTo(27,-78);c.lineTo(14,-84);c.lineTo(-15,-84);c.closePath();c.fill();c.stroke();
 limb(-28,-67,p[1],30,18,'#302733');limb(28,-67,p[3],30,18,'#302733');
 limb(-9,-17,p[5]-.15,22,17,'#201b25');limb(10,-17,p[7]-.15,22,17,'#201b25');
 // Голова и рога.
 c.fillStyle='#29222e';c.beginPath();c.moveTo(-16,-92);c.lineTo(-12,-108);c.lineTo(-27,-116);c.lineTo(-24,-96);c.lineTo(-15,-82);c.lineTo(15,-82);c.lineTo(25,-97);c.lineTo(28,-117);c.lineTo(12,-106);c.lineTo(10,-92);c.closePath();c.fill();
 c.fillStyle='#4a343b';c.beginPath();c.ellipse(0,-91+pulse*.15,18,16,0,0,7);c.fill();
 c.fillStyle=a;c.fillRect(-11,-94,8,4);c.fillRect(4,-94,8,4);
 // Светящиеся трещины на груди.
 c.strokeStyle=a;c.lineWidth=3;c.beginPath();c.moveTo(-2,-78);c.lineTo(4,-62);c.lineTo(-3,-51);c.lineTo(5,-40);c.moveTo(4,-62);c.lineTo(14,-68);c.stroke();
 c.fillStyle='#17141d';c.beginPath();c.ellipse(-20,-8,15,5,0,0,7);c.ellipse(22,-8,15,5,0,0,7);c.fill()
}
