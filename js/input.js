/* Ввод: клавиатура и экранные кнопки */
/* ---------- input ---------- */
const KM={ArrowLeft:[1,'l'],ArrowRight:[1,'r'],ArrowUp:[1,'jump'],KeyJ:[1,'punch'],KeyI:[1,'kick'],KeyK:[1,'block'],KeyL:[1,'special'],ArrowDown:[1,'dodge'],
 KeyA:[0,'l'],KeyD:[0,'r'],KeyW:[0,'jump'],KeyF:[0,'punch'],KeyR:[0,'kick'],KeyG:[0,'block'],KeyH:[0,'special'],KeyS:[0,'dodge']},HELD={l:1,r:1,block:1};
addEventListener('keydown',e=>{if(e.code=='Space'&&['ready','fight','rend'].includes(gm.st)){e.preventDefault();if(document.activeElement?.tagName=='BUTTON')document.activeElement.blur();return}if(e.code=='Escape'||e.code=='KeyP'){togglePause();return}
 const m=KM[e.code],f=m&&fs[m[0]];if(!f||f.ai)return;e.preventDefault();if(e.repeat&&!HELD[m[1]])return;f.inp[m[1]]=1});
addEventListener('keyup',e=>{if(e.code=='Space'&&['ready','fight','rend'].includes(gm.st)){e.preventDefault();return}const m=KM[e.code],f=m&&fs[m[0]];if(f&&HELD[m[1]])f.inp[m[1]]=0});
document.querySelectorAll('#pad button').forEach(b=>{const k=b.dataset.k;
 b.onpointerdown=e=>{e.preventDefault();if(fs[0])fs[0].inp[k]=1};
 if(HELD[k])b.onpointerup=b.onpointerleave=b.onpointercancel=()=>{if(fs[0])fs[0].inp[k]=0}});
