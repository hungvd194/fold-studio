'use strict';
// Beginner navigation is an overlay on the existing editor, never a second design state.
(()=>{
  const root=document.body;
  const steps=[...document.querySelectorAll('[data-easy-step]')];
  const easy=document.getElementById('easyMode');
  const advanced=document.getElementById('advancedMode');
  const key='fold-editor-mode-v1';
  const targets={1:'.library',2:'#panel-size',3:'#panel-background',4:'.export'};
  const hint=document.getElementById('easyHint');
  const hintText={1:'Choose a template on the left. The preview updates automatically.',2:'Enter the finished body size in millimeters. Fold flaps are calculated separately.',3:'Add an image or color if you like. Decoration is optional.',4:'Check the paper size, then print at 100% or download an SVG.'};
  let mode='easy',step=1;
  try{mode=localStorage.getItem(key)==='advanced'?'advanced':'easy'}catch{}
  function render(){
    root.classList.toggle('mode-easy',mode==='easy');
    root.classList.toggle('mode-advanced',mode==='advanced');
    easy.setAttribute('aria-pressed',String(mode==='easy'));
    advanced.setAttribute('aria-pressed',String(mode==='advanced'));
    document.getElementById('easySteps').hidden=mode!=='easy';
    if(hint){hint.hidden=mode!=='easy';hint.textContent=hintText[step];}
    steps.forEach(button=>{
      const active=Number(button.dataset.easyStep)===step;
      button.classList.toggle('active',active);
      if(active)button.setAttribute('aria-current','step');
      else button.removeAttribute('aria-current');
    });
  }
  function setMode(next){mode=next;try{localStorage.setItem(key,mode)}catch{}render()}
  easy.addEventListener('click',()=>setMode('easy'));
  advanced.addEventListener('click',()=>setMode('advanced'));
  steps.forEach(button=>button.addEventListener('click',()=>{
    step=Number(button.dataset.easyStep);
    render();
    if(window.matchMedia('(max-width: 800px)').matches){
      const view=step===1?'library':step===4?'settings':step===2?'settings':'canvas';
      const mobile=document.querySelector('.workspace-switch [data-view="'+view+'"]');
      if(mobile)mobile.click();
    }
    if(step===3){
      const artwork=document.getElementById('tab-background');
      if(artwork)artwork.click();
    }
    if(step===4){
      const paper=document.getElementById('tab-sheet');
      if(paper)paper.click();
    }
    const target=document.querySelector(targets[step]);
    if(!target)return;
    const scrollParent=target.closest('.settings-scroll,.library');
    if(scrollParent && scrollParent!==target)scrollParent.scrollTop=Math.max(0,target.offsetTop-scrollParent.offsetTop-16);
    else if(step===1)target.scrollTop=0;
    if(step===2){
      const sizeTab=document.getElementById('tab-size');
      if(sizeTab)sizeTab.click();
      const field=target.querySelector('input');
      if(field)field.focus({preventScroll:true});
    }
    if(step===4){
      const exportButton=document.getElementById('download');
      if(exportButton)exportButton.focus({preventScroll:true});
    }
  }));
  render();
})();
