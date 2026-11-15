const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const source=fs.readFileSync(path.join(__dirname,'../js/voice-control.js'),'utf8');

function harness(){
 const elements={};
 const actor={inp:{},vm:0,vd:0,vb:0,x:100};
 const opponent={x:300};
 class FakeRecognition{
  static instances=[];
  constructor(){FakeRecognition.instances.push(this)}
  start(){this.started=true}
  stop(){this.stopped=true}
 }
 const context={window:{SpeechRecognition:FakeRecognition},performance:{now:()=>1000},fs:[actor,opponent],
  $:id=>elements[id]||(elements[id]={textContent:'',style:{}}),setTimeout,clearTimeout};
 context.globalThis=context;
 vm.runInNewContext(source+'\nglobalThis.voiceTestApi={mic,voiceCmd,handleVoiceResult,V};',context);
 return {actor,FakeRecognition,api:context.voiceTestApi};
}

function result(transcript,isFinal){return Object.assign([{transcript,confidence:.9}],{isFinal})}

test('interim speech is enabled and executes a command before final recognition',()=>{
 const {actor,FakeRecognition,api}=harness();
 api.mic();
 const rec=FakeRecognition.instances[0];
 assert.equal(rec.interimResults,true);
 rec.onresult({resultIndex:0,results:[result('прыжок',false)]});
 assert.equal(actor.inp.jump,1);
});

test('final result does not execute the same interim command twice',()=>{
 const {actor,FakeRecognition,api}=harness();
 api.mic();
 const rec=FakeRecognition.instances[0];
 rec.onresult({resultIndex:0,results:[result('прыжок',false)]});
 actor.inp.jump=0; // игровая петля уже обработала импульс
 rec.onresult({resultIndex:0,results:[result('прыжок',true)]});
 assert.equal(actor.inp.jump,0);
});

test('kick phrase is not misread as a punch while the interim transcript grows',()=>{
 const {actor,FakeRecognition,api}=harness();
 api.mic();
 const rec=FakeRecognition.instances[0];
 rec.onresult({resultIndex:0,results:[result('удар',false)]});
 assert.equal(actor.inp.punch,undefined);
 rec.onresult({resultIndex:0,results:[result('удар ногой',true)]});
 assert.equal(actor.inp.kick,1);
 assert.equal(actor.inp.punch,undefined);
});

test('forward command moves toward the opponent',()=>{
 const {actor,api}=harness();
 assert.equal(api.voiceCmd('вперёд',4,true),1);
 assert.equal(actor.vm,.6);
 assert.equal(actor.vd,1);
});
