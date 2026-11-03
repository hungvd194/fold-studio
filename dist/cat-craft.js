'use strict';
// Cat Craft is presentation only: it reuses the same geometry, canvas and export state.
(()=>{
 const root=document.body,byId=id=>document.getElementById(id);
 const title=byId('catCoachTitle'),text=byId('catCoachText'),details=byId('catDetails');
 const hints={
  1:['Choose your craft 🐾','Pick a template on the left. Your paper updates instantly.'],
  2:['Shape it with your paws!','Drag orange dots for flaps, or the paper corner to resize everything.'],
  3:['Make it yours ✨','Add artwork if you like. Your design stays editable.'],
  4:['Ready to print!','Check the fit, then print at actual 100% size.']
 };
 function sync(){
  const active=document.querySelector('[data-easy-step].active');
  const step=Number(active?.dataset.easyStep)||1;
  title.textContent=hints[step][0];text.textContent=hints[step][1];
  details.setAttribute('aria-expanded',String(root.classList.contains('cat-details-open')));
  details.textContent=root.classList.contains('cat-details-open')?'Close details ×':'Details ⚙';
  const checkbox=byId('editHandles');
  byId('catShowHandles').setAttribute('aria-pressed',String(!!checkbox?.checked));
 }
 byId('catShowHandles').addEventListener('click',()=>{
  const checkbox=byId('editHandles');if(!checkbox)return;
  if(!checkbox.checked){checkbox.click()}else{byId('canvas')?.focus?.();}
  byId('catShowHandles').textContent='✥ Drag orange dots';sync();
 });
 byId('catPrint').addEventListener('click',()=>byId('print')?.click());
 details.addEventListener('click',()=>{root.classList.toggle('cat-details-open');sync()});
 byId('advancedMode').addEventListener('click',()=>{root.classList.remove('cat-details-open');sync()});
 byId('easyMode').addEventListener('click',sync);
 document.querySelectorAll('[data-easy-step]').forEach(button=>button.addEventListener('click',sync));
 byId('editHandles')?.addEventListener('change',sync);
 sync();
})();
