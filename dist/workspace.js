'use strict';
(() => {
  const $ = s => document.querySelector(s);
  const scroll = $('.settings-scroll');
  const tabs = document.createElement('div');
  tabs.className = 'inspector-tabs'; tabs.setAttribute('role','tablist'); tabs.setAttribute('aria-label','Design settings');
  const groups = [['size','Body'],['geometry','Flaps'],['background','Artwork'],['sheet','Paper'],['arrange','Arrange'],['more','More']];
  const panels = Object.fromEntries(groups.map(([id,label]) => {
    const panel = document.createElement('section'); panel.id = `panel-${id}`; panel.className = 'inspector-panel'; panel.setAttribute('role','tabpanel'); panel.setAttribute('aria-labelledby',`tab-${id}`);
    const button = document.createElement('button'); button.id=`tab-${id}`; button.textContent=label; button.setAttribute('role','tab'); button.setAttribute('aria-controls',panel.id); button.onclick=()=>show(id); tabs.append(button);
    return [id,panel];
  }));
  [...scroll.children].forEach(node => {
    const group = node.id==='foldGeometry'?'geometry':node.id==='artworkPanel'?'background':node.id==='sheetLayoutPanel'?'arrange':node.id==='pageSetup'?'sheet':node.tagName==='DETAILS'?'more':'size';
    panels[group].append(node);
  });
  scroll.append(...Object.values(panels)); scroll.before(tabs);
  function show(id) {
    groups.forEach(([key])=>{ const selected=key===id; panels[key].hidden=!selected; const button=$(`#tab-${key}`);button.setAttribute('aria-selected',String(selected));button.tabIndex=selected?0:-1; });
    scroll.scrollTop=0;
    document.querySelectorAll('.view-menu').forEach(menu=>menu.open=false);
    if(id==='arrange')LayoutUI.setActive(true);
    else if(['size','geometry','background'].includes(id))LayoutUI.setActive(false);
    if(id==='background'&&!LayoutUI.active())ArtworkUI.setEditing(true);
    else if(ArtworkUI.editing())ArtworkUI.setEditing(false);
  }
  tabs.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const index=groups.findIndex(([id])=>`tab-${id}`===document.activeElement.id);const next=event.key==='Home'?0:event.key==='End'?groups.length-1:(index+(event.key==='ArrowRight'?1:groups.length-1))%groups.length;show(groups[next][0]);$(`#tab-${groups[next][0]}`).focus();});
  $('#artTool').addEventListener('click',()=>show('background'));
  $('#layoutTool').addEventListener('click',()=>show(LayoutUI.active()?'arrange':'size'));
  Object.values(panels).forEach(panel=>panel.querySelectorAll('details').forEach(detail=>{detail.open=true;}));
  panels.more.querySelectorAll('details').forEach(detail=>{const heading=document.createElement('h3');heading.textContent=detail.querySelector('summary').textContent.trim();detail.querySelector('summary').after(heading);});
  const mobile=document.createElement('div');mobile.className='workspace-switch';mobile.innerHTML='<button data-view="library">Templates</button><button data-view="canvas" class="selected">Canvas</button><button data-view="settings">Settings</button>';
  function setView(view){document.body.dataset.view=view;mobile.querySelectorAll('button').forEach(b=>b.classList.toggle('selected',b.dataset.view===view));updatePreview();}
  $('header').after(mobile);mobile.onclick=event=>{const view=event.target.dataset.view;if(view)setView(view);};document.body.dataset.view='canvas';
  $('#browse').addEventListener('click',()=>setView('library'));
  $('#templates').addEventListener('click',event=>{if(event.target.closest('.template')){document.body.dataset.view='canvas';mobile.querySelectorAll('button').forEach(b=>b.classList.toggle('selected',b.dataset.view==='canvas'));}});
  function subpages(host,entries,initial=0){
    const nav=document.createElement('div');nav.className='inspector-subtabs';nav.setAttribute('role','group');nav.setAttribute('aria-label','Setting sections');
    const pages=entries.map(([label,nodes])=>{const page=document.createElement('div');page.className='inspector-subpage';nodes.forEach(node=>{if(node)page.append(node);});const button=document.createElement('button');button.type='button';button.textContent=label;button.onclick=()=>select(pages.indexOf(page));nav.append(button);host.append(page);return page;});
    host.prepend(nav);
    function select(index){pages.forEach((page,i)=>{page.hidden=i!==index;nav.children[i].setAttribute('aria-pressed',String(i===index));});scroll.scrollTop=0;requestAnimationFrame(()=>checkOverflow());}
    select(initial);return select;
  }
  const sizeNodes=[...panels.size.children];
  subpages(panels.size,[['Body size',sizeNodes.filter(node=>node.id!=='presetEnvelope'&&!node.classList.contains('custom-preset-row'))],['Saved sizes',sizeNodes.filter(node=>node.id==='presetEnvelope'||node.classList.contains('custom-preset-row'))]]);
  const geometry=$('#foldGeometry');
  const selectGeometry=subpages(geometry,[['Outline',[$('#flapShapes')]],['Flap sizes',[$('#advancedFields'),geometry.querySelector(':scope > .field-hint')]]]);
  const shapeAvailability=()=>{const unavailable=$('#flapShapes').hidden;geometry.querySelector('.inspector-subtabs button').disabled=unavailable;if(unavailable)selectGeometry(1);};new MutationObserver(shapeAvailability).observe($('#flapShapes'),{attributes:true,attributeFilter:['hidden']});shapeAvailability();
  panels.arrange.append($('#layoutOne'));
  const updateReset=()=>{const hidden=$('#sheetLayoutPanel').hidden;$('#layoutOne').hidden=hidden;if(hidden&&$('#tab-arrange').getAttribute('aria-selected')==='true')show('size');else if(!hidden&&['size','geometry','background'].some(id=>$('#tab-'+id).getAttribute('aria-selected')==='true'))show('arrange');};new MutationObserver(updateReset).observe($('#sheetLayoutPanel'),{attributes:true,attributeFilter:['hidden']});updateReset();
  const art=$('#artworkPanel'),controls=$('#artControls'),artNodes=[...art.children].filter(node=>node.tagName!=='SUMMARY'&&node!==controls);
  const emptyTransform=document.createElement('p');emptyTransform.className='field-hint';emptyTransform.textContent='Choose an image or solid color in Fill to adjust its appearance.';
  subpages(art,[['Fill',artNodes],['Transform',[emptyTransform,controls]]]);
  const updateTransform=()=>{emptyTransform.hidden=!controls.hidden;};new MutationObserver(updateTransform).observe(controls,{attributes:true,attributeFilter:['hidden']});updateTransform();
  const overflowNote=document.createElement('span');overflowNote.className='settings-overflow-note';overflowNote.textContent='More settings below ↓';overflowNote.hidden=true;$('.settings').append(overflowNote);
  function checkOverflow(){const more=scroll.scrollHeight-scroll.clientHeight>scroll.scrollTop+5;overflowNote.hidden=!more;scroll.classList.toggle('can-scroll',more);}
  scroll.addEventListener('scroll',checkOverflow,{passive:true});new ResizeObserver(checkOverflow).observe(scroll);new MutationObserver(()=>requestAnimationFrame(checkOverflow)).observe(scroll,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden','open']});

  // Shared export controls remain reachable from every pane and screen size.
  const exportMenu=document.createElement('details');exportMenu.className='export-menu';
  exportMenu.innerHTML=`<summary>${FoldIcons.svg('download')} Export</summary><div class="export-popover"><h3>Export at actual size</h3><p id="exportSummary"></p></div>`;
  exportMenu.querySelector('.export-popover').append($('.export'));$('header').append(exportMenu);
  exportMenu.addEventListener('toggle',()=>{if(exportMenu.open)document.querySelectorAll('.view-menu').forEach(menu=>menu.open=false);});
  $('#download').addEventListener('click',()=>{if(!errors.length&&fit?.fits)exportMenu.open=false;});
  document.addEventListener('pointerdown',event=>{if(!exportMenu.contains(event.target))exportMenu.open=false;});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'){if(exportMenu.open){exportMenu.open=false;exportMenu.querySelector('summary').focus();}document.querySelectorAll('.view-menu').forEach(menu=>{if(menu.open){menu.open=false;menu.querySelector('summary').focus();}});}});

  // Keep the paper toolbar short; display options are a single labeled menu.
  const options=$('.canvas-options'),status=$('#canvasFitStatus'),tools=$('.canvas-tools');
  const fitLine=document.createElement('div');fitLine.className='canvas-fit-line';fitLine.append(status);
  const feedback=document.createElement('span');feedback.id='autoFitNotice';feedback.className='auto-fit-result';feedback.setAttribute('role','status');feedback.hidden=true;fitLine.append(feedback);
  const viewMenu=document.createElement('details');viewMenu.className='view-menu';viewMenu.innerHTML=`<summary>${FoldIcons.svg('view')} View</summary>`;viewMenu.append(options);
  const dimensionControl=$('#showDimensions').closest('label');options.append(dimensionControl);
  $('.paper-tools').append(viewMenu);tools.append(fitLine);
  const arrangeHelp=document.createElement('p');arrangeHelp.id='arrangeHelp';arrangeHelp.className='field-hint';arrangeHelp.textContent='Duplicate, rotate and position copies.';
  panels.arrange.prepend(arrangeHelp,$('#layoutActions'));panels.arrange.append($('#layoutTool'));
  $('#layoutTool').hidden=true;$('#layoutTool').classList.add('arrange-button');$('#tab-arrange').title='Duplicate, rotate, position copies and fill the sheet';$('#tab-arrange').setAttribute('aria-describedby','arrangeHelp');
  $('.sheet-layout-tools').remove();
  $('.title-row').insertBefore($('.canvas-actions'),$('#save'));$('.canvas-bar').remove();
  $('#fitA4').tabIndex=-1;
  viewMenu.addEventListener('toggle',()=>{if(viewMenu.open)exportMenu.open=false;});
  document.addEventListener('pointerdown',event=>{if(!viewMenu.contains(event.target))viewMenu.open=false;});

  // Mobile editing keeps a second, read-only view of the real generated SVG.
  const preview=document.createElement('div');preview.className='mini-preview';preview.innerHTML='<div class="mini-paper"></div><div class="mini-meta"><strong id="miniTitle"></strong><span id="miniSize"></span><br><span id="miniFit"></span><button type="button">Open full canvas</button></div>';
  $('.settings').append(preview);preview.querySelector('button').onclick=()=>setView('canvas');
  let previewFrame;
  function updatePreview(){
    cancelAnimationFrame(previewFrame);previewFrame=requestAnimationFrame(()=>{
      $('#exportSummary').textContent=`${$('#sheetTotal').textContent} sheet · body ${$('#bodySize').textContent}. Print at 100% / actual size.`;
      if(!matchMedia('(max-width:700px)').matches||document.body.dataset.view!=='settings')return;
      const source=$('#drawing'),paper=source.querySelector('.paper-sheet');if(!paper)return;
      const copy=source.cloneNode(true),w=Number(paper.getAttribute('width')),h=Number(paper.getAttribute('height')),pad=Math.max(w,h)*.08;
      copy.removeAttribute('id');copy.removeAttribute('style');copy.setAttribute('viewBox',`${-pad} ${-pad} ${w+2*pad} ${h+2*pad}`);copy.setAttribute('aria-label','Current design preview');
      copy.querySelectorAll('#resizeHandles,.layout-copy,[data-layout-id],#artSelection,#directEditor,[data-dimensions]').forEach(node=>node.remove());
      copy.querySelectorAll('[tabindex]').forEach(node=>node.removeAttribute('tabindex'));
      const ids=new Map([...copy.querySelectorAll('[id]')].map(node=>[node.id,'mini-'+node.id]));
      copy.querySelectorAll('*').forEach(node=>{for(const attr of [...node.attributes]){let value=attr.value;if(attr.name==='id')value=ids.get(value)||value;else if(value.startsWith('#')||value.includes('url(#')){for(const [id,replacement]of ids){if(value==='#'+id)value='#'+replacement;value=value.split('url(#'+id+')').join('url(#'+replacement+')');}}if(value!==attr.value)node.setAttribute(attr.name,value);}});
      preview.querySelector('.mini-paper').replaceChildren(copy);$('#miniTitle').textContent=$('#title').textContent;$('#miniSize').textContent=$('#bodySize').textContent;
      $('#miniFit').textContent=feedback.hidden?'':feedback.textContent.split(' · ')[0];
    });
  }
  new MutationObserver(updatePreview).observe($('#drawing'),{subtree:true,childList:true});
  new MutationObserver(updatePreview).observe($('#bodySize'),{childList:true});updatePreview();
  matchMedia('(max-width:700px)').addEventListener('change',updatePreview);

  const icons={save:'save',undo:'undo',redo:'redo',fit:'fit',fitPaper:'fit',closeDirect:'close',download:'download',print:'print'};
  for(const [id,name]of Object.entries(icons)){const button=$('#'+id);if(!button)continue;const label={fit:'Fit view',download:'Download dieline',print:'Print / Save PDF'}[id];button.innerHTML=FoldIcons.svg(name)+(label?`<span>${label}</span>`:'');if(label)button.setAttribute('aria-label',label);}
  $('#directEditor button[type=submit]').innerHTML=FoldIcons.svg('check');
  updateFitFeedback();
  show('size');
})();
