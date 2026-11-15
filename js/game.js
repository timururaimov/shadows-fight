/* Игра: состояние, раунды, отрисовка сцены и интерфейс */
const $=s=>document.querySelector(s),cv=$('#cv'),c=cv.getContext('2d');
cv.width=W;cv.height=H;
const S={snd:1,df:1,mode:'ai',picks:['sai','lika'],storyStage:-1,storyHero:'sai',level:1,aiHero:'sai',aiBoss:0,aiProgress:0,aiPage:0,survivalWave:1,survivalBest:0},DF=[[.5,'лёгкая'],[.75,'средняя'],[.95,'сложная']];
const AI_LEADERS=[{name:'Ben',level:30},{name:'Ая',level:25},{name:'Ворон',level:20},{name:'Кира',level:15},{name:'Рэй',level:10}];
const gm={st:'menu',round:1,time:60,light:.5,sh:0,bn:'',bt:0,rt:0,pause:0,storyChars:[],storyIndex:0,storyProgress:0,storyDone:1,storyButtonText:'',tutorialHint:0,tutorialHintTime:0,fx:{x:0,y:0,t:0}};
let fs=[],clk=0,AC,arenaHazard=null;const cam={x:W/2,z:1},PR=[],ECHOS=[],BWAVES=[],CSP=[],PL=Array.from({length:100},()=>({x:0,y:0,vx:0,vy:0,l:0,c:'#111'}));
/* ---------- раунды ---------- */
function banner(t,s){gm.bn=t;gm.bt=s}
function shadowPower(){return gm.light>.72?.8:gm.light<.28?1.2:1}
function noteComboHit(f){const result=recordComboHit(f);if(result.reward){f.hp=Math.min(f.maxHp||100,f.hp+result.reward);f.lag=Math.max(f.lag,f.hp)}const badge=$('#combo'+(f.i+1));if(badge){badge.textContent='КОМБО ×'+result.count+(result.reward?' · +'+result.reward+' HP':'');badge.classList.toggle('on',result.count>=2)}if(result.count>=2)burst(f.x,f.y-106,7,FIGHTERS[f.fighter].accent)}
function updateCosmeticTrails(dt){for(let i=CSP.length-1;i>=0;i--){const p=CSP[i];p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.life<=0)CSP.splice(i,1)}if(gm.st!='fight'||S.mode!='ai')return;const f=fs[0];if(!f||!f.cosmetic||!f.cosmetic.accent||Math.abs(f.vx)<80)return;f.trailTimer=(f.trailTimer||0)-dt;if(f.trailTimer<=0){CSP.push({x:f.x-f.dir*17,y:f.y-20,vx:-f.dir*(35+Math.random()*20),vy:-16,life:.42,maxLife:.42,color:f.cosmetic.accent});f.trailTimer=.055}}
function newRound(){fs.forEach((f,i)=>rst(f,i));PR.length=0;ECHOS.length=0;BWAVES.length=0;CSP.length=0;arenaHazard=S.mode=='ai'?createArenaHazard(S.level):null;gm.time=60;gm.st='ready';gm.rt=1.4;banner(S.mode=='ai'?(S.aiBoss?'БОСС · УРОВЕНЬ '+S.level:'УРОВЕНЬ '+S.level):S.mode=='survival'?'ВОЛНА '+S.survivalWave:'РАУНД '+gm.round,9)}
function endR(){if(gm.st!='fight')return;gm.st='rend';gm.rt=2.2;const[a,b]=fs,w=a.hp>b.hp?a:b.hp>a.hp?b:null;if(w)w.wins++;banner(w?FIGHTERS[w.fighter].short+' берёт раунд':'Ничья',9)}
function over(){gm.st='over';const[a,b]=fs,w=a.wins>b.wins?a:b.wins>a.wins?b:null;let t;
 if(S.mode=='pvp')t=w?FIGHTERS[w.fighter].short+' победил':'Ничья';else t=w==a?'ПОБЕДА':w?'ПОРАЖЕНИЕ':'Ничья';
 (w&&(w==a||S.mode=='pvp')?SFX.win:SFX.lose)();
 if(S.mode=='story'){
  if(S.storyHero=='nera'){
   if(w!==a){showStory('Искры не погасли','«Я снова соберу осколки. Пока в арене теплится хоть одно воспоминание, мой путь не окончен».','Попробовать снова','story-retry','Нэра','nera');return}
   if(S.storyStage==0){showStory('Маска помнит','«Лика спрятала первое воспоминание, чтобы никто не заставил её забыть себя. Я сохраню его для неё».','Продолжить','story-next','Нэра','nera');return}
   if(S.storyStage==1){showStory('Сердце под камнем','«Мор держал осколок у самого сердца. Он боялся, что без него исчезнет. Но память не должна быть цепью».','Продолжить','story-next','Нэра','nera');return}
   showStory('История Нэры · Первый свет','«Теперь я знаю: я не храню чужие воспоминания — я помогаю им найти дорогу домой». Нэра зажигает собранные искры; на стене арены проступает выход.','Завершить историю','story-finish','Нэра','nera');return
  }
  if(w!==a){showStory('Поражение','«Нет… Я ещё вернусь! В следующий раз арена меня не остановит».','Попробовать снова','story-retry');return}
  if(S.storyStage==0){showStory('Победа над Ликой','«Лика была права. Я видел врага в каждом, кто здесь оказался. Но я всё равно узнаю, что скрывается за воротами».','Продолжить','story-next');return}
  if(S.storyStage==1){showStory('Победа над Мором','«Мор защищал проход, а не прошлое. Теперь впереди только моя собственная тень».','Продолжить','story-next');return}
  showStory('Финал · Возвращение','«Я вспомнил, почему появился. Тот человек боится прошлого, но я не стану помогать ему убегать. Я вернусь и помогу ему всё исправить». Сай шагает обратно в мир людей.','Завершить историю','story-finish');return
 }
 if(S.mode=='survival'){
  S.survivalBest=Math.max(S.survivalBest,S.survivalWave);saveSurvivalBest(S.aiHero,S.survivalBest);const action=$('#end .b');
  if(w===a){$('#et').textContent='ВОЛНА '+S.survivalWave+' ПРОЙДЕНА';$('#es').textContent='Следующая волна станет сильнее. Твой рекорд: '+S.survivalBest+'.';action.textContent='Следующая волна';action.dataset.a='survival-next'}
  else{$('#et').textContent='ВЫБЫВАНИЕ · ВОЛНА '+S.survivalWave;$('#es').textContent='Ты выдержал '+S.survivalWave+' волн. Лучший результат: '+S.survivalBest+'.';action.textContent='Начать заново';action.dataset.a='survival-retry'}
  show('end');return
 }
 if(S.mode=='ai'){
  const action=$('#end .b');
  if(w===a){const wasUnlocked=isNeraUnlocked();S.aiProgress=Math.max(S.aiProgress,S.level);saveAIProgress(S.aiHero,S.aiProgress);const next=S.aiProgress+1,unlockedNow=!wasUnlocked&&S.aiProgress>=10;if(unlockedNow)try{localStorage.setItem('shadowArenaNeraUnlocked','1')}catch(e){}$('#et').textContent=unlockedNow?'ДОСТИЖЕНИЕ · НЭРА ОТКРЫТА':'УРОВЕНЬ '+S.level+' ПРОЙДЕН';$('#es').textContent=unlockedNow?'Пройдено 10 уровней! Нэра, Хранительница искр, теперь доступна в выборе бойцов и историй.':next%6==0?'Открыт уровень '+next+' — босс '+FIGHTERS[bossFighter(next)].short+'.':'Уровень '+next+' открыт на карте.';action.textContent='Карта уровней';action.dataset.a='level-map'}
  else{$('#et').textContent='УРОВЕНЬ '+S.level+' НЕ ПРОЙДЕН';$('#es').textContent='Уровень остался на карте. Выбери его, чтобы попробовать снова.';action.textContent='Вернуться к уровням';action.dataset.a='level-map'}
  show('end');return
 }
 const action=$('#end .b');action.textContent='Снова на арену';action.dataset.a='restart';
 $('#et').textContent=t;$('#es').textContent='Счёт раундов '+a.wins+' : '+b.wins;show('end')}
function step(dt){
 const live=gm.st=='fight';gm.light=.5+.5*Math.sin(clk*.34);
 if(gm.st=='ready'){gm.rt-=dt;if(gm.rt<=0){gm.st='fight';banner('БОЙ!',.8)}}
 else if(live){gm.time-=dt;if(gm.time<=0){gm.time=0;endR()}}
 else if(gm.st=='rend'){gm.rt-=dt;if(gm.rt<=0){const[a,b]=fs;if(S.mode=='survival'||a.wins>=2||b.wins>=2||gm.round>=5)over();else{gm.round++;newRound()}}}
 fs.forEach((f,i)=>{if(f.ai&&live)ai(f,fs[1-i],dt);upd(f,fs[1-i],dt)});
 if(fs.length)separate(fs[0],fs[1]);
 updateCosmeticTrails(dt);
 if(live&&arenaHazard)for(const event of advanceArenaHazard(arenaHazard,dt))if(event.type=='strike'){for(const f of fs)if(Math.abs(f.x-event.x)<58&&f.y>=G-4){hurt(f,event.x,9,360,7);gm.sh=Math.max(gm.sh,7)}}
 for(let i=ECHOS.length-1;i>=0;i--){const e=ECHOS[i];e.t+=dt;e.delay-=dt;e.life-=dt;
  if(e.delay<=0){e.x+=e.dir*360*dt;if(!e.hit&&e.t>.28){e.hit=1;const dx=(e.target.x-e.x)*e.dir,reach=e.move=='kick'?74:58;if(dx>-18&&dx<reach&&Math.abs(e.target.y-e.y)<75)hurt(e.target,e.x,e.damage,230,3,e.owner)}}
  if(e.life<=0)ECHOS.splice(i,1)}
 for(let i=BWAVES.length-1;i>=0;i--){const w=BWAVES[i];w.x+=w.vx*dt;w.life-=dt;if(!w.hit&&Math.abs(w.target.x-w.x)<w.r&&Math.abs(w.target.y-G)<70){w.hit=1;hurt(w.target,w.owner.x,w.damage,w.kb,10,w.owner)}if(w.life<=0)BWAVES.splice(i,1)}
 for(let i=PR.length-1;i>=0;i--){const p=PR[i],o=p.o===fs[0]?fs[1]:fs[0];p.x+=p.vx*dt;p.l-=dt;
  if(Math.abs(p.x-o.x)<24&&p.y>o.y-100&&p.y<o.y+10){hurt(o,p.o.x,p.damage||AT.special.dmg,p.kb||AT.special.kb,AT.special.sh,p.o);burst(p.x,p.y,12,p.color||'#111');PR.splice(i,1)}
  else if(p.l<=0||p.x<0||p.x>W)PR.splice(i,1)}
 for(const p of PL)if(p.l>0){p.l-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=900*dt}
 gm.sh=Math.max(0,gm.sh-dt*30);gm.bt-=dt;gm.fx.t-=dt;
 if(fs.length){const[a,b]=fs;$('#h1').style.width=(a.hp/a.maxHp*100)+'%';$('#l1').style.width=(a.lag/a.maxHp*100)+'%';$('#h2').style.width=(b.hp/b.maxHp*100)+'%';$('#l2').style.width=(b.lag/b.maxHp*100)+'%';$('#tm').textContent=Math.ceil(gm.time);$('#sc').textContent=S.mode=='ai'?'Уровень '+S.level+(S.aiBoss?' · БОСС':'')+' · Раунд '+gm.round:S.mode=='survival'?'Выживание · Волна '+S.survivalWave+' · Рекорд '+S.survivalBest:'Раунд '+gm.round+' · '+a.wins+' : '+b.wins;$('#light-state').textContent=gm.light>.72?'Яркий свет · тени слабее':gm.light<.28?'Полумрак · тени сильнее':'Сумерки'}}
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
 if(arenaHazard){const warning=arenaHazard.phase=='warning',pulse=.35+.45*(.5+.5*Math.sin(clk*15));c.save();c.globalAlpha=warning?pulse:.9;c.strokeStyle=warning?'#9f75d7':'#ff665b';c.fillStyle=warning?'rgba(155,110,218,.12)':'rgba(239,66,91,.22)';c.lineWidth=warning?3:5;c.setLineDash(warning?[8,7]:[]);c.beginPath();c.ellipse(arenaHazard.x,G-3,58,13,0,0,Math.PI*2);c.fill();c.stroke();c.setLineDash([]);if(!warning){for(let i=-2;i<=2;i++){const x=arenaHazard.x+i*17;c.beginPath();c.moveTo(x,G-8);c.lineTo(x+Math.sin(clk*35+i)*4,G-62-Math.abs(i)*8);c.lineTo(x+12,G-8);c.fill()}}c.restore()}
 fs.forEach(f=>{const w=1-(G-f.y)/450;c.fillStyle='rgba(0,0,0,.52)';c.beginPath();c.ellipse(f.x,G+4,31*w,8*w,0,0,7);c.fill()});
 BWAVES.forEach(w=>{c.save();c.globalAlpha=Math.min(.85,w.life);c.strokeStyle='#ffcf68';c.lineWidth=4;c.beginPath();c.ellipse(w.x,G-4,w.r,10,0,0,Math.PI*2);c.stroke();c.globalAlpha*=.55;c.lineWidth=2;c.beginPath();c.ellipse(w.x-w.dir*13,G-4,w.r*.62,6,0,0,Math.PI*2);c.stroke();c.restore()});
 CSP.forEach(p=>{c.save();c.globalAlpha=Math.max(0,p.life/p.maxLife);c.fillStyle=p.color;c.shadowColor=p.color;c.shadowBlur=12;c.beginPath();c.arc(p.x,p.y,2.5+3*p.life/p.maxLife,0,Math.PI*2);c.fill();c.restore()});
 fs.forEach(f=>{if(f.y>=G&&Math.abs(f.vx)>150&&!f.act){drawF(f,-f.vx*.05,.12);drawF(f,-f.vx*.1,.06)}drawF(f,0,1);
  if(f.act&&f.act.type=='special'){const col=f.accentOverride||(f.boss?'#ffcf68':FIGHTERS[f.fighter].accent);c.save();c.strokeStyle=col;c.lineWidth=3;
   if(f.fighter=='sai'){c.globalAlpha=.75;c.beginPath();c.moveTo(f.x-28,f.y-35);c.lineTo(f.x+42*f.dir,f.y-108);c.stroke()}
   else if(f.fighter=='mor'){for(let k=0;k<3;k++){const r=(f.act.t*330+k*26)%150;c.globalAlpha=1-r/150;c.beginPath();c.ellipse(f.x,f.y-3,r,Math.max(5,r*.12),0,0,7);c.stroke()}}
   else{for(let k=0;k<3;k++){const r=(f.act.t*230+k*25)%82;c.globalAlpha=1-r/82;c.beginPath();c.arc(f.x,f.y-50,r,0,7);c.stroke()}}
   c.restore()}});
 ECHOS.forEach(e=>drawF(e.owner,e.x-e.owner.x,.34));
 PR.forEach(p=>{c.fillStyle=c.strokeStyle=p.color||'#b99ae3';c.lineWidth=3;c.beginPath();c.arc(p.x,p.y,11+Math.sin(clk*30)*2,0,7);c.fill();c.beginPath();c.moveTo(p.x,p.y);c.lineTo(p.x-Math.sign(p.vx)*60,p.y);c.stroke()});
 for(const p of PL)if(p.l>0){c.globalAlpha=Math.min(1,p.l*2);c.fillStyle=p.c;c.fillRect(p.x-2,p.y-2,5,5)}
 c.globalAlpha=1;
 if(gm.fx.t>0){const q=1-gm.fx.t/.18,col=gm.fx.kind=='block'?'#83d9ff':'#ffe2bd';c.save();c.globalAlpha=1-q;c.fillStyle=col;c.strokeStyle=gm.fx.kind=='block'?'#d6f5ff':'#fff5e9';c.lineWidth=3;c.beginPath();c.arc(gm.fx.x,gm.fx.y,8+q*23,0,7);c.fill();c.stroke();for(let k=0;k<6;k++){const a=k*Math.PI/3;c.beginPath();c.moveTo(gm.fx.x+Math.cos(a)*(10+q*10),gm.fx.y+Math.sin(a)*(10+q*10));c.lineTo(gm.fx.x+Math.cos(a)*(20+q*25),gm.fx.y+Math.sin(a)*(20+q*25));c.stroke()}c.restore()}
 if(gm.bt>0&&gm.st!='menu'){c.save();c.setTransform(1,0,0,1,0,0);c.globalAlpha=Math.min(1,gm.bt*3);c.fillStyle='#f3e8d0';c.font='900 56px system-ui,sans-serif';c.textAlign='center';c.shadowColor='#ad83d6';c.shadowBlur=20;c.fillText(gm.bn,W/2,170);c.restore()}
 c.restore()}
let last=0;
function loop(t){requestAnimationFrame(loop);const dt=Math.min(.033,(t-last)/1000||0);last=t;clk+=dt;if(gm.st!='menu'&&!gm.pause)step(dt);
 updateStoryText(dt);updateTutorialHint(dt);
 const targetX=fs.length?(fs[0].x+fs[1].x)/2:W/2,dist=fs.length?Math.abs(fs[1].x-fs[0].x):0,targetZ=fs.length?Math.max(.78,Math.min(1,900/(dist+440))):1,follow=1-Math.exp(-dt*5);
 cam.x+=(targetX-cam.x)*follow;cam.z+=(targetZ-cam.z)*follow;draw()}
/* ---------- UI и запуск ---------- */
function updateUnlockUI(){const unlocked=isNeraUnlocked();for(const selector of ['#mode-fighter-choice','#pick-1','#pick-2']){const option=$(selector+' option[value="nera"]');if(option)option.disabled=!unlocked}
 const card=$('#story-nera-card'),button=$('#story-nera-button'),status=$('#story-nera-status');if(card&&button){card.classList.toggle('muted',!unlocked);button.disabled=!unlocked;button.textContent=unlocked?'Играть историю':'Открыть персонажа';status.textContent=unlocked?'ДОСТУПНО':'ЗАКРЫТО · 10 УРОВНЕЙ';status.classList.toggle('available',unlocked)}
 const achievement=$('#achievement-status');if(achievement){const best=Math.max(...['sai','lika','mor'].map(loadAIProgress));achievement.textContent=unlocked?'Достижение получено: Нэра открыта · 10/10 уровней':'Достижение «Десять уровней»: '+Math.min(10,best)+'/10 · откроется Нэра'}
}
function updateShowcases(id){updateUnlockUI();if(id=='nera'&&!isNeraUnlocked())id='sai';const def=FIGHTERS[id]||FIGHTERS.sai;for(const target of ['menu','mode']){$('#'+target+'-portrait').className='story-portrait showcase-portrait '+id;$('#'+target+'-fighter-name').textContent=def.short;$('#'+target+'-fighter-ability').textContent=def.ability}$('#mode-fighter-choice').value=id}
function show(id){document.querySelectorAll('.scr').forEach(e=>e.classList.toggle('on',e.id==id));if(id=='modes'){updateUnlockUI();updateShowcases(S.picks[0])}if(id=='stories')updateUnlockUI()}
function updatePickText(){for(let i=1;i<=2;i++){const def=FIGHTERS[$('#pick-'+i).value];$('#pick-desc-'+i).textContent=def.ability+' — '+def.description}}
function start(m){S.mode=m;const story=m=='story';$('#pick-label-1').textContent=story?'ГЕРОЙ':m=='voice'?'ГОЛОСОВОЕ УПРАВЛЕНИЕ':'ИГРОК 1';$('#pick-label-2').textContent=m=='pvp'?'ИГРОК 2':'СОПЕРНИК';
 const solo=story||m=='ai'||m=='survival';$('#fighter-picks').classList.toggle('story-mode',solo);document.querySelectorAll('#fighter-picks .pick')[1].classList.toggle('story-hidden',solo);$('#select .eyebrow').textContent=story?'ПУТЬ САЯ · СЮЖЕТНЫЙ РЕЖИМ':m=='ai'?'ВЫБЕРИ БОЙЦА ДЛЯ ПРОХОЖДЕНИЯ УРОВНЕЙ':m=='survival'?'ВЫБЕРИ БОЙЦА ДЛЯ ВЫЖИВАНИЯ':'АРЕНА ВЫБИРАЕТ СВОИХ БОЙЦОВ';$('#pick-1').disabled=story;$('#pick-1').value=story?'sai':S.picks[0];$('#pick-2').value=S.picks[1];
 $('#select h2').textContent=story?'История Сая':m=='ai'||m=='survival'?'Выбери бойца':'Выбери бойцов';$('#begin-fight').textContent=story?'Начать историю':'Войти на арену';updatePickText();show('select')}
function setupBattle(m,one,two,n){S.mode=m;S.picks=[one,two];gm.tutorialHint=0;gm.tutorialHintTime=0;$('#tutorial-hint').classList.remove('on');$('#pad [data-k="punch"]').classList.remove('tutorial-target');const endButton=$('#end .b');endButton.textContent='Снова на арену';endButton.dataset.a='restart';
 fs=[mk(0,n[0],'#e23b3b',one),mk(1,n[1],'#2f6bff',two)];fs[1].ai=m!='pvp'?1:0;gm.round=1;gm.pause=0;ECHOS.length=0;show('');
 document.querySelectorAll('#hud .hp')[0].style.setProperty('--c',FIGHTERS[one].accent);document.querySelectorAll('#hud .hp')[1].style.setProperty('--c',FIGHTERS[two].accent);
 $('#hud').classList.add('on');$('#vp').classList.toggle('on',m=='voice');$('#pad').classList.toggle('on',m=='voice'||matchMedia('(pointer:coarse)').matches);$('#pad [data-k="special"]').textContent='Способность';
 $('#n1').textContent=m=='ai'?n[0]:FIGHTERS[one].short+' · '+n[0];$('#n2').textContent=m=='ai'?n[1]:FIGHTERS[two].short+' · '+n[1];newRound()}
function finishStoryText(){gm.storyDone=1;gm.storyIndex=gm.storyChars.length;$('#story-copy').textContent=gm.storyChars.join('');$('#story-next').textContent=gm.storyButtonText}
function updateStoryText(dt){if(gm.st!='story'||gm.storyDone)return;gm.storyProgress+=dt*42;const count=Math.floor(gm.storyProgress);if(count>0){const end=Math.min(gm.storyChars.length,gm.storyIndex+count);gm.storyProgress-=end-gm.storyIndex;gm.storyIndex=end;$('#story-copy').textContent=gm.storyChars.slice(0,gm.storyIndex).join('')}if(gm.storyIndex>=gm.storyChars.length)finishStoryText()}
function showStory(title,copy,button,action='story-next',speaker='Сай',portrait='sai'){$('#story-speaker').textContent=speaker;$('#story-portrait').className='story-portrait '+portrait;$('#story-heading').textContent=title;$('#story-copy').textContent='';$('#story-next').textContent='Показать всё';$('#story-next').dataset.a=action;gm.storyChars=Array.from(copy);gm.storyIndex=0;gm.storyProgress=0;gm.storyDone=gm.storyChars.length?0:1;gm.storyButtonText=button;gm.st='story';gm.pause=1;show('story');if(gm.storyDone)finishStoryText()}
function bossFighter(level){const ids=['sai','lika','mor'];return ids[(Math.floor(level/6)-1)%ids.length]}
function loadAIProgress(hero){try{return Math.max(0,Number(localStorage.getItem('shadowArenaProgress:'+hero))||0)}catch(e){return 0}}
function saveAIProgress(hero,progress){try{localStorage.setItem('shadowArenaProgress:'+hero,String(progress))}catch(e){}}
function loadSurvivalBest(hero){try{return Math.max(0,Number(localStorage.getItem('shadowArenaSurvival:'+hero))||0)}catch(e){return 0}}
function saveSurvivalBest(hero,wave){try{localStorage.setItem('shadowArenaSurvival:'+hero,String(wave))}catch(e){}}
function isNeraUnlocked(){try{if(localStorage.getItem('shadowArenaNeraUnlocked')=='1')return true;const unlocked=['sai','lika','mor'].some(id=>loadAIProgress(id)>=10);if(unlocked)localStorage.setItem('shadowArenaNeraUnlocked','1');return unlocked}catch(e){return false}}
function tutorialDone(){try{return localStorage.getItem('shadowArenaTutorialDone')=='1'}catch(e){return false}}
function completeTutorialHint(){if(!gm.tutorialHint)return;gm.tutorialHint=0;gm.tutorialHintTime=0;$('#tutorial-hint').classList.remove('on');$('#pad [data-k="punch"]').classList.remove('tutorial-target');try{localStorage.setItem('shadowArenaTutorialDone','1')}catch(e){}}
function updateTutorialHint(dt){if(!gm.tutorialHint)return;gm.tutorialHintTime-=dt;if(gm.tutorialHintTime<=0){gm.tutorialHint=0;$('#tutorial-hint').classList.remove('on');$('#pad [data-k="punch"]').classList.remove('tutorial-target')}}
function updateLeaderboard(){const list=$('#leaderboard-list'),entries=[...AI_LEADERS,{name:'Ты · '+FIGHTERS[S.aiHero].short,level:S.aiProgress,player:1}].sort((a,b)=>b.level-a.level||(a.player?1:b.player?-1:0));list.replaceChildren();entries.forEach((entry,index)=>{const row=document.createElement('li'),rank=document.createElement('span'),name=document.createElement('span'),level=document.createElement('span');if(entry.player)row.classList.add('player');rank.className='leader-rank';rank.textContent=index==0?'★':String(index+1);name.className='leader-name';name.textContent=entry.name;level.className='leader-level';level.textContent=entry.level+' ур.';row.append(rank,name,level);list.append(row)})}
function loadHeroCosmetic(hero){try{const effect=getCosmetic(localStorage.getItem('shadowArenaCosmetic:'+hero));return effect.level<=S.aiProgress?effect:getCosmetic('shadow')}catch(e){return getCosmetic('shadow')}}
function saveHeroCosmetic(hero,id){try{localStorage.setItem('shadowArenaCosmetic:'+hero,id)}catch(e){}}
function updateCosmeticOptions(){const select=$('#cosmetic-choice'),equipped=loadHeroCosmetic(S.aiHero);select.replaceChildren();for(const effect of unlockedCosmetics(S.aiProgress)){const option=document.createElement('option');option.value=effect.id;option.textContent=effect.name;select.append(option)}select.value=equipped.id}
function startAiLevel(){const hero=S.aiHero,level=S.level,boss=level%6==0,pool=['sai','lika','mor'].filter(id=>id!=hero),foe=boss?bossFighter(level):pool[(level-1)%pool.length],foeName=(boss?'БОСС · ':'ИИ · ')+FIGHTERS[foe].short;
 S.aiBoss=boss;setupBattle('ai',hero,foe,['ИГРОК · '+FIGHTERS[hero].short,foeName]);const rival=fs[1],scale=1+Math.min(.25,(level-1)*.025)+(boss?.12:0),effect=loadHeroCosmetic(hero);fs[0].cosmetic=effect;fs[0].accentOverride=effect.accent;fs[0].trailTimer=0;
 rival.maxHp=boss?180:100+Math.min(40,(level-1)*5);rival.hp=rival.lag=rival.maxHp;rival.power=1+Math.min(.3,(level-1)*.035)+(boss?.25:0);rival.speed*=scale;rival.boss=boss;
 $('#h2').style.width='100%';$('#l2').style.width='100%';if(boss){document.querySelectorAll('#hud .hp')[1].style.setProperty('--c','#ffcf68');gm.rt=2.3;banner(BOSS_MOVES[foe].intro,2.3);SFX.sp()}if(level==1&&!tutorialDone()){gm.pause=1;show('tutorial')}}
function startSurvivalWave(wave,hero=S.aiHero){S.aiHero=hero;S.aiProgress=loadAIProgress(hero);S.survivalWave=wave;const cfg=survivalWaveConfig(wave,hero,isNeraUnlocked()),foeName=(cfg.boss?'БОСС ВОЛНЫ ':'ВОЛНА ')+wave+' · '+FIGHTERS[cfg.foe].short;S.aiBoss=cfg.boss;setupBattle('survival',hero,cfg.foe,['Игрок',foeName]);const rival=fs[1],effect=loadHeroCosmetic(hero);fs[0].cosmetic=effect;fs[0].accentOverride=effect.accent;fs[0].trailTimer=0;rival.maxHp=cfg.maxHp;rival.hp=rival.lag=cfg.maxHp;rival.power=cfg.power;rival.speed*=cfg.speedScale;rival.boss=cfg.boss;
 $('#h2').style.width='100%';$('#l2').style.width='100%';if(cfg.boss){document.querySelectorAll('#hud .hp')[1].style.setProperty('--c','#ffcf68');gm.rt=1.9;banner('БОСС · ВОЛНА '+wave,1.9);SFX.sp()}}
function beginTutorialBattle(){gm.pause=0;gm.tutorialHint=1;gm.tutorialHintTime=14;$('#tutorial-hint').classList.add('on');if($('#pad').classList.contains('on'))$('#pad [data-k="punch"]').classList.add('tutorial-target');show('')}
function launch(m,one,two){if(m=='story'){S.storyHero=one=='nera'&&isNeraUnlocked()?'nera':'sai';S.mode='story';S.picks=[S.storyHero,'lika'];S.storyStage=-1;if(S.storyHero=='nera')showStory('Последняя искра','«Я храню воспоминания тех, кто не смог покинуть арену. Если соберу их осколки, открою путь домой». Нэра выходит из тумана и замечает свет в маске Лики.','Начать историю','story-next','Нэра','nera');else showStory('Пробуждение','«Если я пройду арену, прошлое исчезнет. Я должен выбраться отсюда». Сай замечает Лику у ворот и готовится к первому бою.','Начать историю');return}
 if(m=='survival'){if(one=='nera'&&!isNeraUnlocked())one='sai';S.survivalBest=loadSurvivalBest(one);startSurvivalWave(1,one);return}
 if(m=='ai'){if(one=='nera'&&!isNeraUnlocked())one='sai';S.aiHero=one;S.picks[0]=one;S.aiProgress=loadAIProgress(one);S.level=S.aiProgress+1;S.aiPage=Math.floor(S.aiProgress/12);showLevelMap();return}
 if(one=='nera'&&!isNeraUnlocked())one='sai';if(two=='nera'&&!isNeraUnlocked())two='lika';if(one==two)two=({sai:'lika',lika:'mor',mor:'sai',nera:'sai'})[one];const n=m=='pvp'?['Игрок 1','Игрок 2']:[m=='voice'?'Голос':'Игрок','ИИ'];setupBattle(m,one,two,n)}
function startStoryFight(stage){const hero=S.storyHero||'sai',rivals=hero=='nera'?[{fighter:'lika',name:'Лика · Хранительница масок'},{fighter:'mor',name:'Мор · Страж осколка'},{fighter:'sai',name:'Сай · Проводник домой'}]:[{fighter:'lika',name:'Лика'},{fighter:'mor',name:'Мор'},{fighter:'sai',name:'Тень прошлого'}],r=rivals[stage];S.storyStage=stage;setupBattle('story',hero,r.fighter,[FIGHTERS[hero].short,r.name]);
 if(stage==2){fs[1].accentOverride='#b77bff';document.querySelectorAll('#hud .hp')[1].style.setProperty('--c','#b77bff')}}
function showLevelMap(advance=false){if(advance)while(S.aiProgress>=(S.aiPage+1)*12)S.aiPage++;
 const first=S.aiPage*12+1,coords=[[12.5,18],[37.5,18],[62.5,18],[87.5,18],[87.5,50],[62.5,50],[37.5,50],[12.5,50],[12.5,82],[37.5,82],[62.5,82],[87.5,82]],nodes=$('#level-nodes');nodes.replaceChildren();
 for(let i=0;i<12;i++){const level=first+i,b=document.createElement('button'),span=document.createElement('span'),boss=level%6==0,done=level<=S.aiProgress,open=level<=S.aiProgress+1;b.className='level-node'+(done?' completed':open?' current':' locked')+(boss?' boss':'');b.style.left=coords[i][0]+'%';b.style.top=coords[i][1]+'%';b.disabled=!open;b.title=boss?'Уровень '+level+' · БОСС':'Уровень '+level;span.textContent=level;b.append(span);b.addEventListener('click',()=>{if(!b.disabled){S.level=level;startAiLevel()}});nodes.append(b)}
 $('#route-status').textContent='Пройдено: '+S.aiProgress+' · доступен уровень '+(S.aiProgress+1)+'. Выбери открытый узел.';$('#route-page-label').textContent='Уровни '+first+'–'+(first+11);$('#route-prev').disabled=S.aiPage==0;$('#route-next').disabled=S.aiProgress<(S.aiPage+1)*12;updateUnlockUI();updateCosmeticOptions();updateLeaderboard();
 gm.st='level-map';gm.pause=1;$('#hud').classList.remove('on');$('#vp').classList.remove('on');$('#pad').classList.remove('on');show('level-map')}
function toMenu(){if(V.on)mic();gm.st='menu';gm.pause=0;gm.tutorialHint=0;arenaHazard=null;CSP.length=0;$('#tutorial-hint').classList.remove('on');$('#pad [data-k="punch"]').classList.remove('tutorial-target');fs=[];PR.length=0;ECHOS.length=0;BWAVES.length=0;$('#hud').classList.remove('on');$('#vp').classList.remove('on');$('#pad').classList.remove('on');show('menu')}
function togglePause(){if(gm.pause){gm.pause=0;show('')}else if(['ready','fight','rend'].includes(gm.st)){gm.pause=1;show('pause')}}
$('#pick-1').addEventListener('change',()=>{S.picks[0]=$('#pick-1').value;updatePickText();updateShowcases(S.picks[0])});$('#pick-2').addEventListener('change',updatePickText);
$('#mode-fighter-choice').addEventListener('change',()=>{S.picks[0]=$('#mode-fighter-choice').value;updateShowcases(S.picks[0])});updateShowcases(S.picks[0]);
$('#cosmetic-choice').addEventListener('change',()=>{const effect=getCosmetic($('#cosmetic-choice').value);if(effect.level>S.aiProgress){updateCosmeticOptions();return}saveHeroCosmetic(S.aiHero,effect.id);if(fs[0]&&fs[0].fighter==S.aiHero){fs[0].cosmetic=effect;fs[0].accentOverride=effect.accent;fs[0].trailTimer=0}});
$('#begin-fight').addEventListener('click',()=>launch(S.mode,$('#pick-1').value,$('#pick-2').value));
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const d=b.dataset;
 if(d.go){d.go=='menu'?toMenu():show(d.go)}else if(d.m)start(d.m);else if(d.story)launch('story',d.story,'lika');
 else if(d.a=='pause'||d.a=='resume')togglePause();
 else if(d.a=='restart'){if(S.mode=='story')startStoryFight(S.storyStage);else if(S.mode=='survival')startSurvivalWave(S.survivalWave,S.aiHero);else launch(S.mode,S.picks[0],S.picks[1])}
 else if(d.a=='survival-next')startSurvivalWave(S.survivalWave+1,S.aiHero);
 else if(d.a=='survival-retry')startSurvivalWave(1,S.aiHero);
 else if(d.a=='level-map')showLevelMap(true);
 else if(d.a=='tutorial-start')beginTutorialBattle();
 else if(d.a=='route-prev'&&S.aiPage>0){S.aiPage--;showLevelMap()}
 else if(d.a=='route-next'&&S.aiProgress>=(S.aiPage+1)*12){S.aiPage++;showLevelMap()}
 else if(['story-next','story-retry','story-finish'].includes(d.a)){if(!gm.storyDone){finishStoryText();return}if(d.a=='story-next')startStoryFight(S.storyStage+1);else if(d.a=='story-retry')launch('story',S.storyHero||'sai','lika');else toMenu()}
 else if(d.a=='snd'){S.snd^=1;b.textContent='Звук: '+(S.snd?'вкл':'выкл')}
 else if(d.a=='df'){S.df=(S.df+1)%3;b.textContent='Сложность ИИ: '+DF[S.df][1]}
 else if(d.a=='mic')mic()});
