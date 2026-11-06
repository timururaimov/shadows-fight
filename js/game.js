/* Игра: состояние, раунды, отрисовка сцены и интерфейс */
const $=s=>document.querySelector(s),cv=$('#cv'),c=cv.getContext('2d');
cv.width=W;cv.height=H;
const S={snd:1,df:1,mode:'ai',picks:['sai','lika'],storyStage:-1},DF=[[.5,'лёгкая'],[.75,'средняя'],[.95,'сложная']];
const gm={st:'menu',round:1,time:60,light:.5,sh:0,bn:'',bt:0,rt:0,pause:0,fx:{x:0,y:0,t:0}};
let fs=[],clk=0,AC;const cam={x:W/2,z:1},PR=[],ECHOS=[],PL=Array.from({length:100},()=>({x:0,y:0,vx:0,vy:0,l:0,c:'#111'}));
/* ---------- раунды ---------- */
function banner(t,s){gm.bn=t;gm.bt=s}
function shadowPower(){return gm.light>.72?.8:gm.light<.28?1.2:1}
function newRound(){fs.forEach((f,i)=>rst(f,i));PR.length=0;ECHOS.length=0;gm.time=60;gm.st='ready';gm.rt=1.4;banner('РАУНД '+gm.round,9)}
function endR(){if(gm.st!='fight')return;gm.st='rend';gm.rt=2.2;const[a,b]=fs,w=a.hp>b.hp?a:b.hp>a.hp?b:null;if(w)w.wins++;banner(w?FIGHTERS[w.fighter].short+' берёт раунд':'Ничья',9)}
function over(){gm.st='over';const[a,b]=fs,w=a.wins>b.wins?a:b.wins>a.wins?b:null;let t;
 if(S.mode=='pvp')t=w?FIGHTERS[w.fighter].short+' победил':'Ничья';else t=w==a?'ПОБЕДА':w?'ПОРАЖЕНИЕ':'Ничья';
 (w&&(w==a||S.mode=='pvp')?SFX.win:SFX.lose)();
 if(S.mode=='story'){
  if(w!==a){showStory('Испытание не окончено','Сай проиграл бой, и ворота арены снова закрылись. Но тень может подняться и попробовать пройти свой путь ещё раз.','Повторить путь','story-retry');return}
  if(S.storyStage==0){showStory('Глава II · Чужие страхи','Лика говорит: «Мы появились из чужой боли, но это не делает нас врагами». За воротами грохочет Мор. Сай идёт дальше — теперь не ради бегства, а чтобы узнать правду.','Продолжить','story-next');return}
  if(S.storyStage==1){showStory('Глава III · Лицом к прошлому','Мор охранял последний проход, потому что не верил обещаниям арены. За воротами появляется двойник Сая — его желание стереть прошлое. Чтобы пройти, Саю придётся встретиться с самим собой.','Продолжить','story-next');return}
  showStory('Финал · Возвращение','Ворота открыты. Сай вспоминает человека, из чьего страха он родился. Тот боится признать прошлую ошибку и просит всё забыть. Сай понимает: прошлое нельзя стереть, но можно вернуться и помочь всё исправить. Он делает шаг обратно в мир людей — уже не чтобы сбежать, а чтобы не оставить человека одного.','Завершить историю','story-finish');return
 }
 $('#et').textContent=t;$('#es').textContent='Счёт раундов '+a.wins+' : '+b.wins;show('end')}
function step(dt){
 const live=gm.st=='fight';gm.light=.5+.5*Math.sin(clk*.34);
 if(gm.st=='ready'){gm.rt-=dt;if(gm.rt<=0){gm.st='fight';banner('БОЙ!',.8)}}
 else if(live){gm.time-=dt;if(gm.time<=0){gm.time=0;endR()}}
 else if(gm.st=='rend'){gm.rt-=dt;if(gm.rt<=0){const[a,b]=fs;if(a.wins>=2||b.wins>=2||gm.round>=5)over();else{gm.round++;newRound()}}}
 fs.forEach((f,i)=>{if(f.ai&&live)ai(f,fs[1-i],dt);upd(f,fs[1-i],dt)});
 if(fs.length)separate(fs[0],fs[1]);
 for(let i=ECHOS.length-1;i>=0;i--){const e=ECHOS[i];e.t+=dt;e.delay-=dt;e.life-=dt;
  if(e.delay<=0){e.x+=e.dir*360*dt;if(!e.hit&&e.t>.28){e.hit=1;const dx=(e.target.x-e.x)*e.dir,reach=e.move=='kick'?74:58;if(dx>-18&&dx<reach&&Math.abs(e.target.y-e.y)<75)hurt(e.target,e.x,e.damage,230,3)}}
  if(e.life<=0)ECHOS.splice(i,1)}
 for(let i=PR.length-1;i>=0;i--){const p=PR[i],o=p.o===fs[0]?fs[1]:fs[0];p.x+=p.vx*dt;p.l-=dt;
  if(Math.abs(p.x-o.x)<24&&p.y>o.y-100&&p.y<o.y+10){hurt(o,p.o.x,AT.special.dmg,AT.special.kb,AT.special.sh);burst(p.x,p.y,12,'#111');PR.splice(i,1)}
  else if(p.l<=0||p.x<0||p.x>W)PR.splice(i,1)}
 for(const p of PL)if(p.l>0){p.l-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=900*dt}
 gm.sh=Math.max(0,gm.sh-dt*30);gm.bt-=dt;gm.fx.t-=dt;
 if(fs.length){const[a,b]=fs;$('#h1').style.width=a.hp+'%';$('#l1').style.width=a.lag+'%';$('#h2').style.width=b.hp+'%';$('#l2').style.width=b.lag+'%';$('#tm').textContent=Math.ceil(gm.time);$('#sc').textContent='Раунд '+gm.round+' · '+a.wins+' : '+b.wins;$('#light-state').textContent=gm.light>.72?'Яркий свет · тени слабее':gm.light<.28?'Полумрак · тени сильнее':'Сумерки'}}
/* ---------- арена и отрисовка ---------- */
const bgG=c.createLinearGradient(0,0,0,H);bgG.addColorStop(0,'#171423');bgG.addColorStop(.62,'#242033');bgG.addColorStop(1,'#100f18');
function draw(){
 c.save();if(gm.sh>0)c.translate((Math.random()-.5)*gm.sh*2,(Math.random()-.5)*gm.sh*2);
 c.fillStyle=bgG;c.fillRect(-20,-20,W+40,H+40);
 // Камера держит бойцов в центре и мягко отдаляется, если они разошлись.
 c.translate(W/2-cam.x*cam.z,G*(1-cam.z));c.scale(cam.z,cam.z);
 // Дальние скалы и разрушенные колонны.
 c.fillStyle='#11111b';c.beginPath();c.moveTo(0,285);c.lineTo(0,245);c.lineTo(65,198);c.lineTo(105,225);c.lineTo(157,160);c.lineTo(225,285);c.lineTo(300,220);c.lineTo(365,285);c.lineTo(440,172);c.lineTo(520,285);c.lineTo(590,220);c.lineTo(675,285);c.lineTo(755,175);c.lineTo(825,235);c.lineTo(900,190);c.lineTo(900,390);c.lineTo(0,390);c.fill();
 c.fillStyle='#30283c';c.globalAlpha=.55;for(const x of [80,265,635,824]){c.fillRect(x,180,13,100);c.fillRect(x-9,174,31,9)}c.globalAlpha=1;
 const glow=c.createRadialGradient(W/2,138,4,W/2,138,285);glow.addColorStop(0,`rgba(218,190,255,${.08+gm.light*.25})`);glow.addColorStop(1,'rgba(185,145,226,0)');c.fillStyle=glow;c.fillRect(0,0,W,390);
 // Низкий слой тумана двигается медленно, не закрывая бойцов.
 c.fillStyle='rgba(148,126,173,.07)';for(let i=0;i<5;i++){const x=((i*245+clk*(8+i*2))%1150)-120;c.beginPath();c.ellipse(x,305+i%3*22,135+i*12,18+i*3,0,0,7);c.fill()}
 c.fillStyle='#171522';c.fillRect(-20,G,W+40,H);c.fillStyle='#8a719b';c.fillRect(-20,G,W+40,2);
 fs.forEach(f=>{const w=1-(G-f.y)/450;c.fillStyle='rgba(0,0,0,.52)';c.beginPath();c.ellipse(f.x,G+4,31*w,8*w,0,0,7);c.fill()});
 fs.forEach(f=>{if(f.y>=G&&Math.abs(f.vx)>150&&!f.act){drawF(f,-f.vx*.05,.12);drawF(f,-f.vx*.1,.06)}drawF(f,0,1);
  if(f.act&&f.act.type=='special'){const col=f.accentOverride||FIGHTERS[f.fighter].accent;c.save();c.strokeStyle=col;c.lineWidth=3;
   if(f.fighter=='sai'){c.globalAlpha=.75;c.beginPath();c.moveTo(f.x-28,f.y-35);c.lineTo(f.x+42*f.dir,f.y-108);c.stroke()}
   else if(f.fighter=='mor'){for(let k=0;k<3;k++){const r=(f.act.t*330+k*26)%150;c.globalAlpha=1-r/150;c.beginPath();c.ellipse(f.x,f.y-3,r,Math.max(5,r*.12),0,0,7);c.stroke()}}
   else{for(let k=0;k<3;k++){const r=(f.act.t*230+k*25)%82;c.globalAlpha=1-r/82;c.beginPath();c.arc(f.x,f.y-50,r,0,7);c.stroke()}}
   c.restore()}});
 ECHOS.forEach(e=>drawF(e.owner,e.x-e.owner.x,.34));
 PR.forEach(p=>{c.fillStyle=c.strokeStyle='#b99ae3';c.lineWidth=3;c.beginPath();c.arc(p.x,p.y,11+Math.sin(clk*30)*2,0,7);c.fill();c.beginPath();c.moveTo(p.x,p.y);c.lineTo(p.x-Math.sign(p.vx)*60,p.y);c.stroke()});
 for(const p of PL)if(p.l>0){c.globalAlpha=Math.min(1,p.l*2);c.fillStyle=p.c;c.fillRect(p.x-2,p.y-2,5,5)}
 c.globalAlpha=1;
 if(gm.fx.t>0){const q=1-gm.fx.t/.18,col=gm.fx.kind=='block'?'#83d9ff':'#ffe2bd';c.save();c.globalAlpha=1-q;c.fillStyle=col;c.strokeStyle=gm.fx.kind=='block'?'#d6f5ff':'#fff5e9';c.lineWidth=3;c.beginPath();c.arc(gm.fx.x,gm.fx.y,8+q*23,0,7);c.fill();c.stroke();for(let k=0;k<6;k++){const a=k*Math.PI/3;c.beginPath();c.moveTo(gm.fx.x+Math.cos(a)*(10+q*10),gm.fx.y+Math.sin(a)*(10+q*10));c.lineTo(gm.fx.x+Math.cos(a)*(20+q*25),gm.fx.y+Math.sin(a)*(20+q*25));c.stroke()}c.restore()}
 if(gm.bt>0&&gm.st!='menu'){c.save();c.setTransform(1,0,0,1,0,0);c.globalAlpha=Math.min(1,gm.bt*3);c.fillStyle='#f3e8d0';c.font='900 56px system-ui,sans-serif';c.textAlign='center';c.shadowColor='#ad83d6';c.shadowBlur=20;c.fillText(gm.bn,W/2,170);c.restore()}
 c.restore()}
let last=0;
function loop(t){requestAnimationFrame(loop);const dt=Math.min(.033,(t-last)/1000||0);last=t;clk+=dt;if(gm.st!='menu'&&!gm.pause)step(dt);
 const targetX=fs.length?(fs[0].x+fs[1].x)/2:W/2,dist=fs.length?Math.abs(fs[1].x-fs[0].x):0,targetZ=fs.length?Math.max(.78,Math.min(1,900/(dist+440))):1,follow=1-Math.exp(-dt*5);
 cam.x+=(targetX-cam.x)*follow;cam.z+=(targetZ-cam.z)*follow;draw()}
/* ---------- UI и запуск ---------- */
function show(id){document.querySelectorAll('.scr').forEach(e=>e.classList.toggle('on',e.id==id))}
function updatePickText(){for(let i=1;i<=2;i++){const def=FIGHTERS[$('#pick-'+i).value];$('#pick-desc-'+i).textContent=def.ability+' — '+def.description}}
function start(m){S.mode=m;const story=m=='story';$('#pick-label-1').textContent=story?'ГЕРОЙ':m=='voice'?'ГОЛОСОВОЕ УПРАВЛЕНИЕ':'ИГРОК 1';$('#pick-label-2').textContent=m=='pvp'?'ИГРОК 2':'СОПЕРНИК';
 $('#fighter-picks').classList.toggle('story-mode',story);document.querySelectorAll('#fighter-picks .pick')[1].classList.toggle('story-hidden',story);$('#select .eyebrow').textContent=story?'ПУТЬ САЯ · СЮЖЕТНЫЙ РЕЖИМ':'АРЕНА ВЫБИРАЕТ СВОИХ БОЙЦОВ';$('#pick-1').disabled=story;$('#pick-1').value=story?'sai':S.picks[0];$('#pick-2').value=S.picks[1];
 $('#select h2').textContent=story?'История Сая':'Выбери бойцов';$('#begin-fight').textContent=story?'Начать историю':'Войти на арену';updatePickText();show('select')}
function setupBattle(m,one,two,n){S.mode=m;S.picks=[one,two];
 fs=[mk(0,n[0],'#e23b3b',one),mk(1,n[1],'#2f6bff',two)];fs[1].ai=m!='pvp'?1:0;gm.round=1;gm.pause=0;ECHOS.length=0;show('');
 document.querySelectorAll('#hud .hp')[0].style.setProperty('--c',FIGHTERS[one].accent);document.querySelectorAll('#hud .hp')[1].style.setProperty('--c',FIGHTERS[two].accent);
 $('#hud').classList.add('on');$('#vp').classList.toggle('on',m=='voice');$('#pad').classList.toggle('on',m=='voice'||matchMedia('(pointer:coarse)').matches);$('#pad [data-k="special"]').textContent='Способность';
 $('#n1').textContent=FIGHTERS[one].short+' · '+n[0];$('#n2').textContent=FIGHTERS[two].short+' · '+n[1];newRound()}
function showStory(title,copy,button,action='story-next'){$('#story-heading').textContent=title;$('#story-copy').textContent=copy;$('#story-next').textContent=button;$('#story-next').dataset.a=action;gm.st='story';gm.pause=1;show('story')}
function launch(m,one,two){if(m=='story'){S.mode='story';S.picks=['sai','lika'];S.storyStage=-1;showStory('Шаг сквозь прошлое','Сай родился из страха человека, который хотел убежать от своего прошлого. Он уверен: если покинет арену, воспоминания исчезнут. Первой путь преграждает Лика, хранительница масок. Она видит, что Сай сражается не только с соперниками, но и со своей памятью.','Начать историю');return}
 if(one==two)two=({sai:'lika',lika:'mor',mor:'sai'})[one];const n=m=='pvp'?['Игрок 1','Игрок 2']:[m=='voice'?'Голос':'Игрок','ИИ'];setupBattle(m,one,two,n)}
function startStoryFight(stage){const rivals=[{fighter:'lika',name:'Лика'},{fighter:'mor',name:'Мор'},{fighter:'sai',name:'Тень прошлого'}],r=rivals[stage];S.storyStage=stage;setupBattle('story','sai',r.fighter,['Сай',r.name]);
 if(stage==2){fs[1].accentOverride='#b77bff';document.querySelectorAll('#hud .hp')[1].style.setProperty('--c','#b77bff')}}
function toMenu(){if(V.on)mic();gm.st='menu';gm.pause=0;fs=[];PR.length=0;ECHOS.length=0;$('#hud').classList.remove('on');$('#vp').classList.remove('on');$('#pad').classList.remove('on');show('menu')}
function togglePause(){if(gm.pause){gm.pause=0;show('')}else if(['ready','fight','rend'].includes(gm.st)){gm.pause=1;show('pause')}}
$('#pick-1').addEventListener('change',updatePickText);$('#pick-2').addEventListener('change',updatePickText);
$('#begin-fight').addEventListener('click',()=>launch(S.mode,$('#pick-1').value,$('#pick-2').value));
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const d=b.dataset;
 if(d.go){d.go=='menu'?toMenu():show(d.go)}else if(d.m)start(d.m);else if(d.story)launch('story',d.story,'lika');
 else if(d.a=='pause'||d.a=='resume')togglePause();
 else if(d.a=='restart'){if(S.mode=='story')startStoryFight(S.storyStage);else launch(S.mode,S.picks[0],S.picks[1])}
 else if(d.a=='story-next')startStoryFight(S.storyStage+1);
 else if(d.a=='story-retry')launch('story','sai','lika');
 else if(d.a=='story-finish')toMenu();
 else if(d.a=='snd'){S.snd^=1;b.textContent='Звук: '+(S.snd?'вкл':'выкл')}
 else if(d.a=='df'){S.df=(S.df+1)%3;b.textContent='Сложность ИИ: '+DF[S.df][1]}
 else if(d.a=='mic')mic()});
