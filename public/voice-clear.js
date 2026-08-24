// Clearer, smoother browser TTS for Mr. Feast Assistant.
(function(){
  if(!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance==='undefined') return;

  let selectedVoice=null;
  let speechQueue=[];
  let speaking=false;

  function scoreVoice(v){
    const name=(v.name||'').toLowerCase();
    const lang=(v.lang||'').toLowerCase();
    let s=0;
    if(/^en-us/.test(lang)) s+=40;
    else if(/^en-gb/.test(lang)) s+=35;
    else if(/^en/.test(lang)) s+=25;
    if(/aria|jenny|zira|samantha|ava|serena|google us english|google uk english female|natural|online/.test(name)) s+=80;
    if(/female/.test(name)) s+=20;
    if(/david|mark|male/.test(name)) s-=5;
    if(/desktop/.test(name)) s+=5;
    if(/pakistan|en-pk/.test(name+lang)) s-=15;
    return s;
  }

  function chooseVoice(){
    const voices=window.speechSynthesis.getVoices().filter(v=>/^en/i.test(v.lang||''));
    selectedVoice=voices.sort((a,b)=>scoreVoice(b)-scoreVoice(a))[0]||null;
  }
  chooseVoice();
  window.speechSynthesis.addEventListener?.('voiceschanged',chooseVoice);
  window.speechSynthesis.onvoiceschanged=chooseVoice;

  function cleanForSpeech(text){
    return String(text||'')
      .replace(/\bRs\.?\s*([\d,]+)/gi,'$1 rupees')
      .replace(/\bBBQ\b/g,'barbecue')
      .replace(/Mr\.\s*Feast/gi,'Mister Feast')
      .replace(/[•·]/g,', ')
      .replace(/\s+/g,' ')
      .trim();
  }

  function splitSpeech(text){
    const cleaned=cleanForSpeech(text);
    const parts=cleaned.match(/[^.!?]+[.!?]?/g)||[cleaned];
    const out=[];
    for(const part of parts){
      const p=part.trim();
      if(!p) continue;
      if(p.length<=150){ out.push(p); continue; }
      const chunks=p.match(/.{1,140}(?:\s|$)/g)||[p];
      chunks.forEach(c=>{if(c.trim()) out.push(c.trim())});
    }
    return out;
  }

  function next(){
    if(!speechQueue.length){ speaking=false; return; }
    speaking=true;
    const u=new SpeechSynthesisUtterance(speechQueue.shift());
    chooseVoice();
    if(selectedVoice){ u.voice=selectedVoice; u.lang=selectedVoice.lang; }
    else u.lang='en-US';
    u.rate=0.9;
    u.pitch=1.03;
    u.volume=1;
    u.onend=()=>setTimeout(next,55);
    u.onerror=()=>setTimeout(next,55);
    window.speechSynthesis.speak(u);
  }

  // Override the original page function so long responses do not freeze/hang.
  window.speak=function(text){
    window.speechSynthesis.cancel();
    speechQueue=splitSpeech(text);
    speaking=false;
    setTimeout(next,80);
  };
})();
