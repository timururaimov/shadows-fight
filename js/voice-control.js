/* Голосовое управление: Web Speech API, ru-RU */
/* ---------- voice ---------- */
const V={on:0,rec:null,k:'',t:0,err:0},CN={special:'Суперудар',kick:'Удар ногой',punch:'Удар',block:'Защита',jump:'Прыжок',fwd:'Вперёд',back:'Назад',dodge:'Уклонение'};
const vs=(m,er)=>{$('#vs').textContent=m;$('#vs').style.color=er?'#c00':''},lc=(m,er)=>{$('#lc').textContent=m;$('#lc').style.color=er?'#c00':''};
function voiceCmd(txt){const t=txt.toLowerCase().replace(/ё/g,'е'),f=fs[0];
 const k=/супер/.test(t)?'special':/ногой|пинок|ногу/.test(t)?'kick':/удар|бей/.test(t)?'punch':/защит|блок/.test(t)?'block':/прыж/.test(t)?'jump':/вперед/.test(t)?'fwd':/назад/.test(t)?'back':/уклон/.test(t)?'dodge':0;
 if(!k)return 0;const n=performance.now();if(k==V.k&&n-V.t<400)return 1;V.k=k;V.t=n;
 if(!f)return 1;const s=Math.sign(fs[1].x-f.x)||1;
 if(k=='fwd'){f.vm=.6;f.vd=s}else if(k=='back'){f.vm=.6;f.vd=-s}else if(k=='block')f.vb=.9;else f.inp[k]=1;
 lc('Команда: '+CN[k]);return 1}
function mic(){const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(V.on){V.on=0;V.rec&&V.rec.stop();$('#mc').textContent='Микрофон: выкл';vs('Микрофон выключен');return}
 if(!SR){vs('Распознавание речи не поддерживается — используйте кнопки',1);return}
 const r=V.rec=new SR();V.err=0;r.lang='ru-RU';r.continuous=true;r.interimResults=false;r.maxAlternatives=3;
 r.onresult=e=>{for(let i=e.resultIndex;i<e.results.length;i++){if(!e.results[i].isFinal)continue;let ok=0;for(let j=0;j<e.results[i].length&&!ok;j++)ok=voiceCmd(e.results[i][j].transcript);if(!ok)lc('Не распознано: «'+e.results[i][0].transcript.trim()+'»',1)}};
 r.onerror=e=>{if(e.error=='not-allowed'||e.error=='service-not-allowed'){V.on=0;V.err=1;$('#mc').textContent='Микрофон: выкл';vs('Нет доступа к микрофону. Разрешите его в браузере или играйте кнопками',1)}else if(e.error!='no-speech'&&e.error!='aborted'){V.err=1;vs('Ошибка микрофона: '+e.error,1)}};
 r.onend=()=>{if(V.on){try{r.start()}catch(x){}}else if(!V.err)vs('Микрофон выключен')};
 try{r.start();V.on=1;$('#mc').textContent='Микрофон: вкл';vs('🎤 Слушаю команды…');lc('')}catch(x){vs('Не удалось запустить микрофон',1)}}
