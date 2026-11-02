(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.FoldGeometry = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const templates = [
    {id:'ENV–001',name:'Portrait envelope',category:'Envelopes',kind:'envelope',w:110,h:160,tag:'Classic · Portrait'},
    {id:'ENV–002',name:'Landscape envelope',category:'Envelopes',kind:'envelope',w:180,h:120,tag:'Classic · Landscape'},
    {id:'BOX–001',name:'Tuck end box',category:'Boxes',kind:'box',w:80,h:120,d:40,tag:'Packaging · Tuck closure'},
    {id:'BOX–002',name:'Pillow box',category:'Boxes',kind:'pillow',w:130,h:85,tag:'Gifting · Curved folds'},
    {id:'BOX–003',name:'Open tray',category:'Boxes',kind:'tray',w:140,h:100,d:35,tag:'Packaging · Open top'},
    {id:'BAG–001',name:'Gift bag',category:'Bags',kind:'bag',w:100,h:160,d:45,tag:'Gifting · Folded base'},
    {id:'ENV–003',name:'Square envelope',category:'Envelopes',kind:'envelope',w:140,h:140,tag:'Stationery · Square'},
    {id:'TAG–001',name:'Gift tag',category:'More',kind:'tag',w:55,h:90,tag:'Finishing · Hang tag'}
  ];
  const round = n => Math.round(n * 1e6) / 1e6;
  function defaults(t) {
    return {template:t.id,w:t.w,h:t.h,d:t.d||40,top:40,bottom:round(t.h*.64),left:Math.min(25,t.w*.18),right:Math.min(25,t.w*.18),glue:12,corner:Math.min(10,t.w/5,t.h/5),curve:15,hole:5,holeOffset:12,clearance:0,thickness:.3,stock:'ivory',paper:'a4',paperW:210,paperH:297,margin:5,lock:false,artwork:{mode:'global',global:null,parts:{}},layout:{enabled:false,gap:3,autoRotate:true,items:[]}};
  }
  function fields(kind) {
    const main=[['w','Width',1,5000],['h','Height',1,5000]];
    if (['box','bag','tray'].includes(kind)) main.push(['d',kind==='tray'?'Wall height':'Depth',1,2000]);
    const common=[['clearance','Content clearance / side',0,100]];
    const extra={
      envelope:[['top','Top flap',1,2000],['bottom','Bottom flap',1,4000],['left','Left side flap',1,2000],['right','Right side flap',1,2000],['corner','Corner chamfer',0,1000]],
      box:[['top','Top closure flap',1,2000],['bottom','Bottom closure flap',1,2000],['glue','Glue tab',1,500],['corner','Tab chamfer',0,1000]],
      bag:[['top','Top hem',1,2000],['bottom','Base flap',1,2000],['glue','Glue tab',1,500],['corner','Tab chamfer',0,1000]],
      tray:[['corner','Wall chamfer',0,1000]],
      pillow:[['curve','Closure curve rise',1,1000],['glue','Glue tab',1,500]],
      tag:[['corner','Shoulder chamfer',0,1000],['hole','Hole diameter (0 = none)',0,1000],['holeOffset','Hole center from top',0,5000]]
    };
    return {main,extra:[...common,...extra[kind]]};
  }
  function validate(t,p) {
    const errors=[];
    const pageFields=p.paper==='auto'?[]:[['paperW','Paper width',1,20000],['paperH','Paper height',1,20000]];
    for (const [key,label,min,max] of [...fields(t.kind).main,...fields(t.kind).extra,['thickness','Stock thickness',.01,10],...pageFields,['margin','Sheet margin',0,1000]]) {
      if (typeof p[key]!=='number'||!Number.isFinite(p[key])||p[key]<min||p[key]>max) errors.push({key,message:`${label}: ${min}–${max} mm.`});
    }
    const W=p.w+2*p.clearance,H=p.h+2*p.clearance;
    if (t.kind==='envelope') {
      if(p.corner>Math.min(W/2,H/2,p.top,p.bottom,p.left,p.right)) errors.push({key:'corner',message:'Chamfer must fit inside every flap and half the body width/height.'});
    } else if(['box','bag'].includes(t.kind)) {
      if(p.corner>Math.min(W/2,H/2,p.top/2,p.bottom/2,p.glue)) errors.push({key:'corner',message:'Tab chamfer must fit half a closure flap, half the body, and the glue tab.'});
    } else if(t.kind==='tray') {
      if(p.corner>Math.min(W/2,H/2,p.d)) errors.push({key:'corner',message:'Wall chamfer must fit the wall height and half the base dimensions.'});
    } else if(t.kind==='pillow' && p.curve*2>=H) errors.push({key:'curve',message:'Curve rise must be less than half the body height.'});
    else if(t.kind==='tag') {
      if(p.corner>Math.min(W/2,H/2)) errors.push({key:'corner',message:'Shoulder chamfer cannot exceed half the tag width or height.'});
      if(p.hole>0) {
        const r=p.hole/2;
        if(r>=W/2||p.holeOffset-r<=0||p.holeOffset+r>=H) errors.push({key:'holeOffset',message:'Keep the entire hole inside the tag with space to each edge.'});
        else if(p.holeOffset<p.corner && W/2+p.holeOffset-p.corner<=r*Math.SQRT2) errors.push({key:'hole',message:'Hole overlaps the chamfered shoulder. Reduce it or move it down.'});
      }
    }
    if(p.paper!=='auto' && p.margin*2>=Math.min(p.paperW,p.paperH)) errors.push({key:'margin',message:'Sheet margin leaves no printable area.'});
    return errors;
  }
  function generate(t,p) {
    const errors=validate(t,p);
    if(errors.length) throw new Error(errors.map(e=>e.message).join(' '));
    const W=p.w+2*p.clearance,H=p.h+2*p.clearance,D=p.d+2*p.clearance;
    let cut=[],fold=[],circles=[],bw,bh,face;
    const line=(x,y,a,b)=>fold.push([[x,y],[a,b]]),c=p.corner;
    if(t.kind==='envelope') {
      const x=p.left,y=p.top,b=p.bottom,R=p.right;
      bw=x+W+R;bh=y+H+b;
      cut=[[x,y],[x+c,0],[x+W-c,0],[x+W,y],[bw,y+c],[bw,y+H-c],[x+W,y+H],[x+W-c,bh],[x+c,bh],[x,y+H],[0,y+H-c],[0,y+c]];
      line(x,y,x+W,y);line(x,y+H,x+W,y+H);line(x,y,x,y+H);line(x+W,y,x+W,y+H);
      face={x,y,w:W,h:H};
    } else if(t.kind==='tray') {
      bw=W+2*D;bh=H+2*D;
      cut=[[D,D],[D+c,0],[D+W-c,0],[D+W,D],[bw,D+c],[bw,D+H-c],[D+W,D+H],[D+W-c,bh],[D+c,bh],[D,D+H],[0,D+H-c],[0,D+c]];
      line(D,D,D+W,D);line(D,D+H,D+W,D+H);line(D,D,D,D+H);line(D+W,D,D+W,D+H);face={x:D,y:D,w:W,h:H};
    } else if(t.kind==='pillow') {
      const G=p.glue,C=p.curve,y=C;bw=G+W*2;bh=H+C*2;
      cut=[[0,y+Math.min(G/2,H/4)],[G,y]];
      for(let panel=0;panel<2;panel++)for(let i=1;i<=40;i++){const u=i/40;cut.push([G+panel*W+W*u,C-C*Math.sin(Math.PI*u)])}
      cut.push([bw,y+H]);
      for(let panel=1;panel>=0;panel--)for(let i=39;i>=0;i--){const u=i/40;cut.push([G+panel*W+W*u,C+H+C*Math.sin(Math.PI*u)])}
      cut.push([0,y+H-Math.min(G/2,H/4)]);
      line(G,y,G,y+H);line(G+W,y,G+W,y+H);
      for(let panel=0;panel<2;panel++)for(const bottom of [false,true]) {
        const curve=[];for(let i=0;i<=40;i++){const u=i/40;curve.push([G+panel*W+u*W,bottom?C+H-C*Math.sin(Math.PI*u):C+C*Math.sin(Math.PI*u)])}fold.push(curve);
      }
      face={x:G,y:C,w:W,h:H};
    } else if(t.kind==='tag') {
      bw=W;bh=H;cut=[[0,c],[c,0],[W-c,0],[W,c],[W,H],[0,H]];
      if(p.hole>0)circles=[{x:W/2,y:p.holeOffset,r:p.hole/2}];face={x:0,y:0,w:W,h:H};
    } else {
      const G=p.glue,T=p.top,B=p.bottom,y=T;bw=G+2*W+2*D;bh=T+H+B;
      const dustT=Math.min(T,D*.7),dustB=Math.min(B,D*.7),x1=G,x2=G+W,x3=x2+D,x4=x3+W;
      cut=[[0,y+c],[G,y],[G+c,0],[x2-c,0],[x2,y],[x2+D*.2,y-dustT],[x3-D*.2,y-dustT],[x3,y],[x3+c,0],[x4-c,0],[x4,y],[x4+D*.2,y-dustT],[bw-D*.2,y-dustT],[bw,y],[bw,y+H],[bw-D*.2,y+H+dustB],[x4+D*.2,y+H+dustB],[x4,y+H],[x4-c,bh],[x3+c,bh],[x3,y+H],[x3-D*.2,y+H+dustB],[x2+D*.2,y+H+dustB],[x2,y+H],[x2-c,bh],[G+c,bh],[G,y+H],[0,y+H-c]];
      line(G,y,bw,y);line(G,y+H,bw,y+H);for(const x of [G,x2,x3,x4])line(x,y,x,y+H);
      if(t.kind==='bag'){line(x2+D/2,y,x2+D/2,y+H);line(x4+D/2,y,x4+D/2,y+H)}
      face={x:G,y,w:W,h:H};
    }
    return {cut:cut.map(a=>a.map(round)),fold:fold.map(a=>a.map(b=>b.map(round))),circles,bw:round(bw),bh:round(bh),face,body:{w:W,h:H,d:D}};
  }
  function sheetFit(g,p) {
    const sheetW=p.paper==='auto'?g.bw+2*p.margin:p.paperW,sheetH=p.paper==='auto'?g.bh+2*p.margin:p.paperH;
    const availableW=sheetW-2*p.margin,availableH=sheetH-2*p.margin;
    const normal=g.bw<=availableW+1e-6&&g.bh<=availableH+1e-6,rotated=g.bh<=availableW+1e-6&&g.bw<=availableH+1e-6;
    return {sheetW:round(sheetW),sheetH:round(sheetH),fits:normal||rotated,rotate:!normal&&rotated};
  }
  return {templates,defaults,fields,validate,generate,sheetFit,round};
});
