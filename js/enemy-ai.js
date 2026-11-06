/* ИИ противника */
/* ---------- AI ---------- */
function ai(f,o,dt){
 const I=f.inp,Sk=DF[S.df][0],d=Math.abs(o.x-f.x),tw=o.x>f.x?'r':'l',aw=tw=='r'?'l':'r',oa=o.act&&(o.act.type=='punch'||o.act.type=='kick');
 I.l=I.r=I.block=0;
 if(oa&&d<100){if(!f.rc){f.rc=1;const r=Math.random();if(r<Sk*.5)f.aiB=.5;else if(r<Sk*.7&&!f.cd.dodge)I.dodge=1;else if(r<Sk*.8)I.jump=1}}else if(!oa)f.rc=0;
 for(let i=0;i<PR.length;i++)if(PR[i].o!==f&&Math.abs(PR[i].x-f.x)<170&&Sk>.6){I.block=1;return}
 if(f.aiB>0){f.aiB-=dt;I.block=1;return}
 f.aiT-=dt;
 if(f.aiT<=0){f.aiT=.2+Math.random()*.4*(1.3-Sk);const r=Math.random();
  f.plan=d>170?(r<.15&&!f.cd.special?'sp':r<.2?'jump':'go'):d>85?(r<.4?'go':r<.6?'kick':r<.7?'jump':'punch'):(r<.4?'punch':r<.6?'kick':r<.75?'back':r<.9?'blk':'punch')}
 const p=f.plan;
 if(p=='go'&&d>60)I[tw]=1;else if(p=='back')I[aw]=1;else if(p=='blk')I.block=1;
 else if(p=='sp'){I.special=1;f.plan=''}
 else if(p=='jump'){I.jump=1;f.plan='go'}
 else if(p=='punch'||p=='kick'){if(d>(p=='punch'?50:65))I[tw]=1;else{I[p]=1;f.plan=Math.random()<.3?'back':''}}}
