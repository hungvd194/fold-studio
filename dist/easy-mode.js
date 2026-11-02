'use strict';
// Easy Mode changes presentation only; both modes edit the same live design state.
(()=>{
  const root=document.body;
  const steps=[...document.querySelectorAll('[data-easy-step]')];
  const easy=document.getElementById('easyMode'),advanced=document.getElementById('advancedMode');
  const key='fold-editor-mode-v1';
  let mode='easy',step=1;
  try{mode=localStorage.getItem(key)==='advanced'?'advanced':'easy'}catch{}
  const targets={1:'.library',2:'.settings',3:'.canvas',4:'.export'};
  function render(){
    root.classList.toggle('mode-easy',mode==='easy');
    root.classList.toggle('mode-advanced',mode==='advanced');
    easy.setAttribute('aria-pressed',String(mode==='easy'));
    advanced.setAttribute('aria-pressed',String(mode==='advanced'));
    document.getElementById('easySteps').hidden=mode!=='easy';
    steps.forEach(button=>{const active=Number(button.dataset.easyStep)===step;button.classList.toggle('active',active);button.setAttribute('aria-current',active?'step':'false')});
  }
  function setMode(next){mode=next;try{localStorage.setItem(key,mode)}catch{}render()}
  easy.addEventListener('click',()=>setMode('easy'));
  advanced.addEventListener('click',()=>setMode('advanced'));
  steps.forEach(button=>button.addEventListener('click',()=>{
    step=Number(button.dataset.easyStep);render();
    const target=document.querySelector(targets[step]);
    if(target)target.scrollIntoView({behavior:'smooth',block:'nearest'});
    if(step===3){const details=document.querySelector('details#artworkPanel');if(details)details.open=true;}
    if(step===4){const page=document.getElementById('pageSetup');if(page)page.open=true;}
  }));
  render();
})();
