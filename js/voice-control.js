/* Голосовое управление: команды выполняются по промежуточному распознаванию. */
const V={on:0,rec:null,err:0,seen:Object.create(null),pending:Object.create(null)},CN={special:'Суперудар',kick:'Удар ногой',punch:'Удар',block:'Защита',jump:'Прыжок',fwd:'Вперёд',back:'Назад',dodge:'Уклонение'};
const vs=(m,er)=>{$('#vs').textContent=m;$('#vs').style.color=er?'#c00':''},lc=(m,er)=>{$('#lc').textContent=m;$('#lc').style.color=er?'#c00':''};
function clearVoicePending(){for(const timer of Object.values(V.pending))clearTimeout(timer);V.pending=Object.create(null)}
function fireVoiceCommand(k){
 const f=fs[0];if(!f)return;
 const s=Math.sign(fs[1].x-f.x)||1;
 if(k=='fwd'){f.vm=.6;f.vd=s}else if(k=='back'){f.vm=.6;f.vd=-s}else if(k=='block')f.vb=.9;else f.inp[k]=1;
 lc('Команда: '+CN[k])
}
function voiceCmd(txt,resultId,isFinal=false){
 const t=txt.toLowerCase().replace(/ё/g,'е').replace(/[.,!?;:]/g,' ').trim();
 const k=/супер|спец(?:атака|удар)/.test(t)?'special':/ног(?:ой|у)(?:\s|$)|пинок|пни/.test(t)?'kick':/удар|бей/.test(t)?'punch':/защит|блок/.test(t)?'block':/прыж/.test(t)?'jump':/вперед|в перед/.test(t)?'fwd':/назад/.test(t)?'back':/уклон/.test(t)?'dodge':0;
 if(!k)return 0;
 // Промежуточная и финальная версии одной фразы имеют одинаковый resultId.
 if(resultId!==undefined&&V.seen[resultId]===k)return 1;
 const pending=V.pending[resultId];
 if(pending){
  if(k=='punch'&&t=='удар'&&!isFinal)return 1;
  clearTimeout(pending);delete V.pending[resultId]
 }
 // «Удар» может оказаться началом команды «удар ногой». Дадим распознаванию
 // короткое окно для уточнения, но не будем ждать окончания всей фразы.
 if(resultId!==undefined&&k=='punch'&&t=='удар'&&!isFinal){
  V.pending[resultId]=setTimeout(()=>{delete V.pending[resultId];if(V.seen[resultId]===undefined){V.seen[resultId]='punch';fireVoiceCommand('punch')}},220);return 1
 }
 if(resultId!==undefined)V.seen[resultId]=k;
 fireVoiceCommand(k);return 1
}
function handleVoiceResult(e){
 for(let i=e.resultIndex;i<e.results.length;i++){
  const result=e.results[i];let ok=0;
  for(let j=0;j<result.length&&!ok;j++)ok=voiceCmd(result[j].transcript,i,result.isFinal);
  if(result.isFinal&&!ok)lc('Не распознано: «'+result[0].transcript.trim()+'»',1)
 }
}
function mic(){const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(V.on){const old=V.rec;V.on=0;V.rec=null;clearVoicePending();old&&old.stop();$('#mc').textContent='Микрофон: выкл';vs('Микрофон выключен');return}
 if(!SR){vs('Распознавание речи не поддерживается — используйте кнопки',1);return}
 const r=new SR();V.rec=r;V.err=0;V.seen=Object.create(null);clearVoicePending();r.lang='ru-RU';r.continuous=true;r.interimResults=true;r.maxAlternatives=1;
 r.onresult=handleVoiceResult;
 r.onerror=e=>{if(V.rec!==r)return;if(e.error=='not-allowed'||e.error=='service-not-allowed'){V.on=0;V.err=1;V.rec=null;clearVoicePending();$('#mc').textContent='Микрофон: выкл';vs('Нет доступа к микрофону. Разрешите его в браузере или играйте кнопками',1)}else if(e.error!='no-speech'&&e.error!='aborted'){V.err=1;vs('Ошибка микрофона: '+e.error,1)}};
 r.onend=()=>{if(V.rec!==r)return;if(V.on){clearVoicePending();V.seen=Object.create(null);setTimeout(()=>{if(V.on&&V.rec===r)try{r.start()}catch(x){}},120)}else if(!V.err)vs('Микрофон выключен')};
 try{r.start();V.on=1;$('#mc').textContent='Микрофон: вкл';vs('🎤 Слушаю команды…');lc('')}catch(x){V.on=0;V.rec=null;vs('Не удалось запустить микрофон',1)}
}
