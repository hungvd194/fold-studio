(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.FoldVisual=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const sequences={
 envelope:[['Cut','Cut along the solid outer outline.'],['Score','Lightly score all dashed fold lines without cutting through.'],['Sides','Fold the left and right flaps inward.'],['Pocket','Apply glue only to the overlapping side edges of the bottom flap, then fold it upward. Keep the pocket opening clear.'],['Close','Fold the top flap down after inserting the contents.']],
 tray:[['Cut','Cut around the outer outline.'],['Score','Score the four lines surrounding the base.'],['Walls','Fold all four walls upward at right angles.'],['Corners','Secure the corners with tape or suitable adhesive; this dieline does not include glue tabs.']],
 box:[['Cut','Cut around the complete outline, including the glue tab.'],['Score','Score every dashed fold and the closure flaps.'],['Body','Fold the four body panels to form the box sleeve.'],['Seam','Glue the narrow side tab behind the opposite edge.'],['Close','Fold the end flaps inward and tuck the closure panels. Test fit before gluing.']],
 bag:[['Cut','Cut along the outer contour.'],['Score','Score the side, base and top-hem folds.'],['Sleeve','Fold the side panels and glue the narrow seam tab.'],['Base','Fold the bottom panels inward and secure the base.'],['Finish','Fold the top hem inward; add handles only after checking the paper strength.']],
 pillow:[['Cut','Cut the curved outline carefully.'],['Score','Score the two main panel folds and curved closure lines.'],['Seam','Roll the panels into a sleeve and glue the narrow side tab.'],['Close','Gently push the curved end flaps inward, one at a time.']],
 tag:[['Cut','Cut along the tag outline.'],['Hole','Punch the marked hole, if enabled.'],['Finish','Thread a ribbon or cord through the hole.']]
};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function steps(kind){return (sequences[kind]||sequences.envelope).map(([title,description])=>({title,description}));}
function preview(kind,p,step=0){
 const n=steps(kind).length,stage=Math.max(0,Math.min(n-1,Math.floor(Number(step)||0)));
 const w=Math.max(1,Number(p.w)||100),h=Math.max(1,Number(p.h)||150),d=Math.max(1,Number(p.d)||40);
 const accent='#a8bb99',paper='#f2e8d3',stroke='#53674c';
 const base='stroke="'+stroke+'" stroke-width="2.2" stroke-linejoin="round"';
 let shape='';
 if(kind==='envelope'){
  const x=100,y=42,W=140,H=Math.min(184,Math.max(100,140*h/w));
  const sides=stage>=2;
  shape='<rect x="'+x+'" y="'+y+'" width="'+W+'" height="'+H+'" fill="'+paper+'" '+base+'/>';
  shape+=sides?'<path d="M'+x+' '+(y+20)+' L'+(x+W/2)+' '+(y+H*.55)+' L'+x+' '+(y+H-20)+'Z M'+(x+W)+' '+(y+20)+' L'+(x+W/2)+' '+(y+H*.55)+' L'+(x+W)+' '+(y+H-20)+'Z" fill="'+accent+'" '+base+'/>':'<path d="M'+x+' '+(y+20)+' L'+(x-40)+' '+(y+H*.5)+' L'+x+' '+(y+H-20)+' M'+(x+W)+' '+(y+20)+' L'+(x+W+40)+' '+(y+H*.5)+' L'+(x+W)+' '+(y+H-20)+'" fill="none" '+base+'/>';
  shape+=stage>=3?'<path d="M'+x+' '+(y+H*.56)+' L'+(x+W/2)+' '+(y+H*.24)+' L'+(x+W)+' '+(y+H*.56)+' V'+(y+H)+' H'+x+'Z" fill="#e0d2b6" '+base+'/>':'<path d="M'+x+' '+(y+H)+' L'+(x+W/2)+' '+(y+H+44)+' L'+(x+W)+' '+(y+H)+'" fill="none" '+base+'/>';
  shape+=stage>=4?'<path d="M'+x+' '+y+' L'+(x+W/2)+' '+(y+H*.46)+' L'+(x+W)+' '+y+'Z" fill="'+paper+'" '+base+'/>':'<path d="M'+x+' '+y+' L'+(x+W/2)+' '+(y-38)+' L'+(x+W)+' '+y+'" fill="none" '+base+'/>';
 }else if(kind==='tray'){
  const x=100,y=65,W=140,H=125,D=stage>=2?22:Math.min(45,Math.max(20,d*.7));
  shape='<rect x="'+x+'" y="'+y+'" width="'+W+'" height="'+H+'" fill="'+paper+'" '+base+'/>';
  shape+='<path d="M'+x+' '+y+' L'+(x+D)+' '+(y-D)+' H'+(x+W-D)+' L'+(x+W)+' '+y+' M'+x+' '+(y+H)+' L'+(x+D)+' '+(y+H+D)+' H'+(x+W-D)+' L'+(x+W)+' '+(y+H)+'" fill="none" '+base+'/>';
  shape+='<path d="M'+x+' '+y+' L'+(x-D)+' '+(y-D)+' V'+(y+H+D)+' L'+x+' '+(y+H)+' M'+(x+W)+' '+y+' L'+(x+W+D)+' '+(y-D)+' V'+(y+H+D)+' L'+(x+W)+' '+(y+H)+'" fill="none" '+base+'/>';
  if(stage>=2)shape='<path d="M80 86 L218 86 L251 56 L113 56Z M80 86 V199 L218 199 V86 M218 199 L251 169 V56" fill="'+paper+'" '+base+'/>';
 }else if(kind==='tag'){
  shape='<path d="M120 48 H220 L239 79 V238 H101 V79Z" fill="'+paper+'" '+base+'/>';
  if(Number(p.hole)!==0)shape+='<circle cx="170" cy="73" r="8" fill="white" '+base+'/>';
 }else{
  const closing=stage>=steps(kind).length-1;
  shape='<path d="M88 88 L202 88 L252 56 L138 56Z M88 88 V210 L202 210 V88 M202 210 L252 178 V56" fill="'+paper+'" '+base+'/>';
  shape+='<path d="M88 88 L202 88 L252 56 L138 56Z" fill="'+(closing?accent:'#f9f4e9')+'" '+base+'/>';
  if(kind==='pillow')shape='<rect x="96" y="73" width="148" height="142" rx="56" fill="'+paper+'" '+base+'/><path d="M96 101 Q170 141 244 101 M96 187 Q170 147 244 187" fill="none" stroke="'+stroke+'" stroke-dasharray="5 5" stroke-width="2"/>';
  if(kind==='bag')shape+='<path d="M117 75 Q117 30 153 30 Q190 30 190 75" fill="none" '+base+'/>';
 }
 return '<svg viewBox="0 0 340 300" role="img" aria-label="Illustrative '+esc(kind)+' assembly stage '+(stage+1)+'" xmlns="http://www.w3.org/2000/svg"><rect width="340" height="300" rx="18" fill="#f7f8f4"/>'+shape+'</svg>';
}
return {steps,preview};
});
