const test=require('node:test');
const assert=require('node:assert/strict');
const G=require('../dist/geometry.js');
const template=kind=>G.templates.find(t=>t.kind===kind);
function verifyBounds(g){
  const points=[...g.cut,...g.fold.flat()];
  for(const [x,y]of points){assert(Number.isFinite(x)&&Number.isFinite(y));assert(x>=-1e-6&&x<=g.bw+1e-6,`x ${x} / ${g.bw}`);assert(y>=-1e-6&&y<=g.bh+1e-6,`y ${y} / ${g.bh}`)}
  assert.equal(Math.min(...g.cut.map(a=>a[0])),0);assert.equal(Math.min(...g.cut.map(a=>a[1])),0);
  assert(Math.abs(Math.max(...g.cut.map(a=>a[0]))-g.bw)<1e-6);assert(Math.abs(Math.max(...g.cut.map(a=>a[1]))-g.bh)<1e-6);
  const area=Math.abs(g.cut.reduce((sum,a,i)=>{const b=g.cut[(i+1)%g.cut.length];return sum+a[0]*b[1]-b[0]*a[1]},0)/2);assert(area>0);
  // Proper crossings reveal an invalid blank even when all points fit the bounding box.
  const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
  for(let i=0;i<g.cut.length;i++)for(let j=i+2;j<g.cut.length;j++){
    if(i===0&&j===g.cut.length-1)continue;
    const a=g.cut[i],b=g.cut[(i+1)%g.cut.length],c=g.cut[j],d=g.cut[(j+1)%g.cut.length];
    assert(!(cross(a,b,c)*cross(a,b,d)<-1e-8&&cross(c,d,a)*cross(c,d,b)<-1e-8),`Self crossing at edges ${i}, ${j}`);
  }
}
test('every starter blank is finite, fits exact bounds, and has no crossing cut edges',()=>{
  for(const t of G.templates)verifyBounds(G.generate(t,G.defaults(t)));
});
test('asymmetric envelope flaps affect their own edges and exact flat bounds',()=>{
  const t=template('envelope'),p={...G.defaults(t),w:215.125,h:310.875,top:60,bottom:150,left:22,right:47,clearance:1.25};
  const g=G.generate(t,p);assert.equal(g.face.x,22);assert.equal(g.face.y,60);assert.equal(g.face.w,217.625);assert.equal(g.bw,286.625);assert.equal(g.bh,523.375);verifyBounds(g);
  const other=G.generate(t,{...p,right:77});assert.equal(other.face.x,g.face.x);assert.equal(other.bw,g.bw+30);assert.equal(other.bh,g.bh);
});
test('large decimal dimensions above the old 600 mm cap remain true size',()=>{
  const t=template('envelope'),p={...G.defaults(t),w:1250.125,h:2300.75};const g=G.generate(t,p);assert.equal(g.face.w,p.w);assert.equal(g.face.h,p.h);verifyBounds(g);
});
test('closure tabs and glue change box bounds independently of body panels',()=>{
  const t=template('box'),p={...G.defaults(t),top:55,bottom:35,glue:18,clearance:2};const g=G.generate(t,p);
  assert.equal(g.bw,18+2*84+2*44);assert.equal(g.bh,55+124+35);verifyBounds(g);
  assert.equal(G.generate(t,{...p,glue:25}).bw,g.bw+7);
});
test('invalid, zero, excessive, or non-finite dimensions never generate exports',()=>{
  const t=template('envelope');for(const value of [0,-1,5001,NaN,Infinity,null,'110']){const p={...G.defaults(t),w:value};assert(G.validate(t,p).some(e=>e.key==='w'));assert.throws(()=>G.generate(t,p))}
  assert(G.validate(t,{...G.defaults(t),left:3}).some(e=>e.key==='corner'));
});
test('tag hole stays inside chamfers and body; zero disables the hole',()=>{
  const t=template('tag'),p=G.defaults(t);assert.equal(G.generate(t,{...p,hole:0}).circles.length,0);
  assert(G.validate(t,{...p,hole:20,holeOffset:3}).length);
  assert(G.validate(t,{...p,corner:27,hole:10,holeOffset:2}).length);
  assert.equal(G.generate(t,p).circles[0].r,2.5);
});
test('pillow closures use sampled curves in both outline and creases',()=>{
  const t=template('pillow'),p={...G.defaults(t),curve:20,glue:17};const g=G.generate(t,p);assert.equal(g.bw,277);assert.equal(g.bh,125);assert.equal(g.fold.filter(points=>points.length>2).length,4);verifyBounds(g);assert(G.validate(t,{...p,curve:43}).length);
});
test('page fit considers margins, rotation, auto sizing, and insufficient paper',()=>{
  const t=template('tag'),p={...G.defaults(t),paper:'custom',paperW:100,paperH:65,margin:5};const g=G.generate(t,p);
  assert.deepEqual(G.sheetFit(g,p),{sheetW:100,sheetH:65,fits:true,rotate:true});assert.equal(G.sheetFit(g,{...p,margin:6}).fits,false);
  assert.deepEqual(G.sheetFit(g,{...p,paper:'auto'}),{sheetW:65,sheetH:100,fits:true,rotate:false});assert(G.validate(t,{...p,margin:40}).some(e=>e.key==='margin'));
  assert.equal(G.validate(t,{...p,paper:'auto',paperW:NaN,paperH:NaN}).length,0,'Auto paper recovers from invalid inactive custom sizes');
});
test('valid varied sizes keep all cut and crease coordinates inside bounds',()=>{
  for(const t of G.templates)for(const factor of [.1,.5,1.3,4,10]){
    const p=G.defaults(t);for(const [key]of [...G.fields(t.kind).main,...G.fields(t.kind).extra])p[key]*=factor;
    if(!G.validate(t,p).length)verifyBounds(G.generate(t,p));
  }
});

test('each flap shape combination keeps a valid outline, bounds and fold edges',()=>{
  for(const kind of ['envelope','tray','box','bag']){
    const t=template(kind),base=G.defaults(t),original=G.generate(t,base),keys=G.shapeFields(kind).map(([key])=>key);
    for(let mask=0;mask<2**keys.length;mask++){
      const p={...base};keys.forEach((key,i)=>p[key]=mask&(1<<i)?'rectangle':'trapezoid');
      const g=G.generate(t,p);verifyBounds(g);assert.deepEqual(g.fold,original.fold);assert.equal(g.bw,original.bw);assert.equal(g.bh,original.bh);
    }
  }
});
test('rectangle bottom flap reaches both body corners while other envelope flaps remain unchanged',()=>{
  const t=template('envelope'),p=G.defaults(t),before=G.generate(t,p),after=G.generate(t,{...p,bottomShape:'rectangle'});
  assert.deepEqual(after.cut[7],[p.left+p.w,after.bh]);assert.deepEqual(after.cut[8],[p.left,after.bh]);
  after.cut.forEach((point,i)=>{if(![7,8].includes(i))assert.deepEqual(point,before.cut[i]);});
});
test('legacy shape settings retain trapezoids and unknown shapes cannot generate exports',()=>{
  const t=template('envelope'),p=G.defaults(t),legacy={...p};for(const [key]of G.shapeFields(t.kind))delete legacy[key];
  assert.deepEqual(G.generate(t,legacy),G.generate(t,p));assert.throws(()=>G.generate(t,{...p,bottomShape:'arbitrary'}),/choose Trapezoid or Rectangle/);
  const rectangles={...p,topShape:'rectangle',bottomShape:'rectangle',leftShape:'rectangle',rightShape:'rectangle',corner:999};assert.equal(G.validate(t,rectangles).length,0);
});

test('automatic paper fitting scales all starter dielines into A4 without changing paper, artwork or shapes',()=>{
  for(const t of G.templates){const p={...G.defaults(t),bottomShape:'rectangle'},next=G.fitDesign(t,p),g=G.generate(t,next);assert(G.sheetFit(g,next).fits,t.name);assert.equal(next.paperW,p.paperW);assert.equal(next.paperH,p.paperH);assert.equal(next.margin,p.margin);assert.equal(next.thickness,p.thickness);assert.equal(next.bottomShape,p.bottomShape);assert.deepEqual(next.artwork,p.artwork);}
});
test('automatic paper fitting responds to smaller paper and margins and never enlarges a fitting design',()=>{
  const t=template('envelope'),p={...G.defaults(t),w:300,h:420,paperW:148,paperH:210,margin:10},next=G.fitDesign(t,p);assert(G.sheetFit(G.generate(t,next),next).fits);assert(next.w<p.w);assert(Math.abs(next.w/p.w-next.h/p.h)<1e-6);assert.strictEqual(G.fitDesign(t,next),next);
  const auto={...p,paper:'auto'};assert.strictEqual(G.fitDesign(t,auto),auto);const invalid={...p,w:NaN};assert.strictEqual(G.fitDesign(t,invalid),invalid);
});
test('automatic fitting can constrain a rotated sheet copy while retaining its geometry proportions',()=>{
  const t=template('tag'),p=G.defaults(t),next=G.fitDesign(t,p,.5);assert.equal(next.w,27.5);assert.equal(next.h,45);assert.equal(next.hole,2.5);
});
