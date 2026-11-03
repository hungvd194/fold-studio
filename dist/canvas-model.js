(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./geometry.js'):root.FoldGeometry);if(typeof module==='object'&&module.exports)module.exports=api;else root.FoldCanvasModel=api})(globalThis,function(G){
  function point(a,g,p,fit){return fit.rotate?[p.margin+g.bh-a[1],p.margin+a[0]]:[p.margin+a[0],p.margin+a[1]]}
  function localDelta(dx,dy,rotated){return rotated?[dy,-dx]:[dx,dy]}
  function bounds(g,p,fit){const dw=fit.rotate?g.bh:g.bw,dh=fit.rotate?g.bw:g.bh;return{x:0,y:0,w:Math.max(fit.sheetW,p.margin+dw),h:Math.max(fit.sheetH,p.margin+dh)}}
  function handles(t,p,g){const f=g.face,items=[{key:'w',label:'Width',x:f.x+f.w,y:f.y+f.h*.45,axis:'x',sign:1},{key:'h',label:'Height',x:f.x+f.w*.45,y:f.y+f.h,axis:'y',sign:1}];
    const add=(key,label,x,y,axis,sign=1)=>items.push({key,label,x,y,axis,sign});
    if(t.kind==='envelope'){add('top','Top flap',f.x+f.w*.5,f.y,'y');add('bottom','Bottom flap',f.x+f.w*.5,g.bh,'y');add('left','Left flap',f.x,f.y+f.h*.68,'x');add('right','Right flap',g.bw,f.y+f.h*.68,'x')}
    if(['box','bag'].includes(t.kind)){add('top','Top flap',f.x+f.w*.5,f.y,'y');add('bottom','Bottom flap',f.x+f.w*.5,g.bh,'y');add('glue','Glue tab',f.x,f.y+f.h*.7,'x');add('d','Depth',f.x+f.w+g.body.d,f.y+f.h*.45,'x')}
    if(t.kind==='tray')add('d','Wall height',f.x,f.y+f.h*.6,'x');
    if(t.kind==='pillow'){add('curve','Curve rise',f.x+f.w*.5,f.y,'y');add('glue','Glue tab',f.x,f.y+f.h*.7,'x')}
    if(t.kind==='tag'&&p.hole>0)add('holeOffset','Hole offset',g.bw/2,p.holeOffset,'y');
    return items;
  }
  const scalableKeys=['w','h','d','top','bottom','left','right','glue','corner','curve','hole','holeOffset','clearance'];
  function scaleAll(t,start,factor){
    const f=Math.max(.001,Number(factor)||.001),limits=[...G.fields(t.kind).main,...G.fields(t.kind).extra];
    const next={...start};
    for(const key of scalableKeys){
      const field=limits.find(item=>item[0]===key);
      if(!field||typeof start[key]!=='number')continue;
      if(key==='hole'&&start.hole===0)continue;
      next[key]=G.round(start[key]*f);
    }
    return next;
  }
  function scaleDrag(t,start,factor,snap=1){
    let f=Math.max(.001,factor);
    if(snap)f=Math.max(.001,Math.round(start.w*f/snap)*snap/start.w);
    const candidate=scaleAll(t,start,f);
    if(!G.validate(t,candidate).length)return candidate;
    let lo=f<1?f:1,hi=f<1?1:f,best=start;
    for(let i=0;i<30;i++){
      const mid=(lo+hi)/2,c=scaleAll(t,start,mid);
      if(!G.validate(t,c).length){best=c;if(f<1)hi=mid;else lo=mid}
      else if(f<1)lo=mid;else hi=mid;
    }
    return best;
  }
  function change(t,start,key,value){const field=[...G.fields(t.kind).main,...G.fields(t.kind).extra].find(f=>f[0]===key);if(!field)return start;const next={...start,[key]:Math.max(field[2],Math.min(field[3],value))};if(start.lock&&['w','h'].includes(key)){const other=key==='w'?'h':'w';next[other]=G.round(start[other]*next[key]/start[key])}return next}
  function drag(t,start,key,delta,snap=1){let target=start[key]+delta;if(snap)target=Math.round(target/snap)*snap;let next=change(t,start,key,target);if(!G.validate(t,next).length)return next;
    // Stop at the valid boundary rather than allowing an invalid cut outline during a drag.
    let low=0,high=1,best=start;for(let i=0;i<28;i++){const mid=(low+high)/2,candidate=change(t,start,key,start[key]+(target-start[key])*mid);if(!G.validate(t,candidate).length){best=candidate;low=mid}else high=mid}const safeValue=(target<start[key]?Math.ceil(best[key]*1e6):Math.floor(best[key]*1e6))/1e6,safe=change(t,start,key,safeValue);return G.validate(t,safe).length?best:safe;
  }
  return{point,localDelta,bounds,handles,change,drag,scaleAll,scaleDrag};
});
