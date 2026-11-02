const fs=require('node:fs'),assert=require('node:assert/strict'),G=require('../dist/geometry.js'),L=require('../dist/layout-model.js');
const [svgPath,dxfPath,jsonPath]=process.argv.slice(2);
if(!jsonPath)throw new Error('Usage: node tests/verify-export.cjs design.svg design.dxf settings.json');
const json=JSON.parse(fs.readFileSync(jsonPath,'utf8')),p=json.state,t=G.templates.find(t=>t.id===p.template),g=G.generate(t,p),fit=p.layout?.enabled?{sheetW:p.paperW,sheetH:p.paperH,rotate:false}:G.sheetFit(g,p),svg=fs.readFileSync(svgPath,'utf8'),dxf=fs.readFileSync(dxfPath,'utf8');
const copies=p.layout?.enabled?L.normalize(p.layout).items:[{id:'single',x:p.margin,y:p.margin,rotation:fit.rotate?90:0}];
if(p.layout?.enabled){assert(L.check(p.layout,g,p).fits);assert.equal((svg.match(/data-sheet-copy=/g)||[]).length,copies.length);for(const item of copies)assert(svg.includes(L.transform(item,g)))}
assert.equal(json.format,'fold-design');assert.equal(json.version,1);
assert(svg.includes(`width="${fit.sheetW}mm" height="${fit.sheetH}mm"`));assert(svg.includes(`viewBox="0 0 ${fit.sheetW} ${fit.sheetH}"`));assert(!/NaN|Infinity/.test(svg));
const decode=s=>s.replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
assert.deepEqual(JSON.parse(decode(svg.match(/<metadata>(.*?)<\/metadata>/s)[1])).state,p);
if(p.artwork){
  const A=require('../dist/artwork.js');for(const asset of A.validateAssets(json.assets||[]))A.cache.set(asset.id,asset);
  const art=A.normalize(p.artwork),used=art.mode==='global'?[art.global]:A.regions(t,p,g).map(r=>art.parts[r.id]),active=used.filter(v=>v?.type==='image'&&v.asset),fills=used.filter(v=>v?.type==='color');
  assert.equal((svg.match(/<image /g)||[]).length,new Set(active.map(v=>v.asset)).size);
  assert.equal((svg.match(/data-art-image=/g)||[]).length,active.length);
  for(const layer of active){assert(svg.includes(A.cache.get(layer.asset).src));assert(svg.includes(`opacity="${layer.opacity/100}"`))}
  assert.equal((svg.match(/data-art-color=/g)||[]).length,fills.length);for(const fill of fills){assert(svg.includes(`fill="${fill.color}"`));assert(svg.includes(`opacity="${fill.opacity/100}"`))}
  assert(!dxf.includes('data:image/'),'DXF keeps vector geometry only');
}
const lines=dxf.trim().split(/\r?\n/);assert(lines.includes('$INSUNITS'));assert.equal(lines[lines.indexOf('$INSUNITS')+2],'4');
const points=[],circles=[];for(let i=0;i<lines.length-1;i+=2)if(lines[i]==='0'&&['LINE','CIRCLE'].includes(lines[i+1])){
  const entity=lines[i+1];
  const attrs={};i+=2;while(i<lines.length&&lines[i]!=='0'){attrs[lines[i]]=Number.isNaN(Number(lines[i+1]))?lines[i+1]:Number(lines[i+1]);i+=2}i-=2;
  if(attrs[8]==='CUT'&&entity==='LINE')points.push([attrs[10],attrs[20]],[attrs[11],attrs[21]]);
  if(entity==='CIRCLE')circles.push([attrs[10],attrs[20],attrs[40]]);
}
assert(points.length>4);for(const point of points)for(const n of point)assert(Number.isFinite(n));
const expected=[],expectedCircles=[];
for(const item of copies){const pt=a=>{const b=L.point(item,g,a);return[b[0],G.round(fit.sheetH-b[1])]};g.cut.forEach((a,i)=>{const b=g.cut[(i+1)%g.cut.length];if(a[0]!==b[0]||a[1]!==b[1])expected.push(pt(a),pt(b))});for(const c of g.circles)expectedCircles.push([...pt([c.x,c.y]),c.r])}
assert.equal(points.length,expected.length,'Every copy must have all cut segments');assert.equal(circles.length,expectedCircles.length,'Every copy must preserve holes');
for(let i=0;i<points.length;i++)for(let j=0;j<2;j++)assert(Math.abs(points[i][j]-expected[i][j])<1e-5,`Cut coordinate mismatch at ${i}/${j}`);
for(let i=0;i<circles.length;i++)for(let j=0;j<3;j++)assert(Math.abs(circles[i][j]-expectedCircles[i][j])<1e-5);
console.log(`Verified matching SVG / DXF / JSON: ${copies.length} copies; body ${g.body.w} × ${g.body.h} mm; dieline ${g.bw} × ${g.bh} mm; sheet ${fit.sheetW} × ${fit.sheetH} mm.`);
