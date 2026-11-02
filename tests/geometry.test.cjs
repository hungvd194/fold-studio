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
