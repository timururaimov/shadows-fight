/* Ввод: клавиатура и экранные кнопки */
/* ---------- input ---------- */
const KM={ArrowLeft:[0,'l'],ArrowRight:[0,'r'],ArrowUp:[0,'jump'],KeyJ:[0,'punch'],KeyI:[0,'kick'],KeyK:[0,'block'],KeyL:[0,'special'],ArrowDown:[0,'dodge'],
 KeyA:[1,'l'],KeyD:[1,'r'],KeyW:[1,'jump'],KeyF:[1,'punch'],KeyR:[1,'kick'],KeyG:[1,'block'],KeyH:[1,'special'],KeyS:[1,'dodge']},HELD={l:1,r:1,block:1};
addEventListener('keydown',e=>{if(e.code=='Escape'||e.code=='KeyP'){togglePause();return}
 const m=KM[e.code],f=m&&fs[m[0]];if(!f||f.ai)return;e.preventDefault();if(e.repeat&&!HELD[m[1]])return;f.inp[m[1]]=1});
addEventListener('keyup',e=>{const m=KM[e.code],f=m&&fs[m[0]];if(f&&HELD[m[1]])f.inp[m[1]]=0});
document.querySelectorAll('#pad button').forEach(b=>{const k=b.dataset.k;
 b.onpointerdown=e=>{e.preventDefault();if(fs[0])fs[0].inp[k]=1};
 if(HELD[k])b.onpointerup=b.onpointerleave=b.onpointercancel=()=>{if(fs[0])fs[0].inp[k]=0}});
