const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const G=require('../dist/geometry.js'),M=require('../dist/canvas-model.js');

function canvasHarness(arranging=false){
  const nodes=new Map(),listeners=new Map();
  function element(id){if(!nodes.has(id))nodes.set(id,{style:{},checked:false,value:'',textContent:'',classList:{toggle(){},add(){},remove(){}},insertAdjacentHTML(){},addEventListener(type,listener){if(id==='drawing')listeners.set(type,listener)},setAttribute(key,value){this[key]=value}});return nodes.get(id)}
  const svg=element('drawing');svg.clientWidth=600;svg.clientHeight=400;
  svg.getScreenCTM=()=>({inverse(){const [x,y,w,h]=svg.viewBox.split(' ').map(Number),scale=Math.min(svg.clientWidth/w,svg.clientHeight/h);return{a:1/scale,d:1/scale,e:x-(svg.clientWidth-w*scale)/2/scale,f:y-(svg.clientHeight-h*scale)/2/scale}}});
  class Point{constructor(x,y){this.x=x;this.y=y}matrixTransform(m){return{x:this.x*m.a+m.e,y:this.y*m.d+m.f}}}
  const document={querySelector:selector=>element(selector==='[data-param]'?'params':selector.replace(/^[#.]/,'')),querySelectorAll:()=>[],getElementById:element,addEventListener(){}};
  const context=vm.createContext({document,DOMPoint:Point,FoldGeometry:G,FoldCanvasModel:M});
  vm.runInContext(fs.readFileSync(require.resolve('../dist/canvas-ui.js'),'utf8')+'\nthis.canvas=CanvasStudio;',context);
  const api={layout:{active:()=>arranging,bounds:()=>null,markup:()=>''},artwork:{editing:()=>false,overlay:()=>''},paths:()=>'',dimensions:()=>'',display:n=>n,unit:()=>'mm',onZoom(){}};
  // Deliberately omit mode(): the editor no longer has a 3D/flat mode API.
  context.canvas.init(api);
  const t=G.templates[0],p=G.fitDesign(t,G.defaults(t)),g=G.generate(t,p);context.canvas.render(g,p,G.sheetFit(g,p),t);
  const position=(x,y)=>new Point(x,y).matrixTransform(svg.getScreenCTM().inverse());
  function wheel(deltaY,x=410,y=240){let prevented=false;listeners.get('wheel')({clientX:x,clientY:y,deltaY,ctrlKey:false,target:{closest:()=>null},preventDefault(){prevented=true}});return prevented}
  return{canvas:context.canvas,svg,position,wheel};
}

test('wheel zoom works without the removed 3D mode and preserves the pointer anchor',()=>{
  for(const arranging of [false,true]){
    const h=canvasHarness(arranging),anchor=h.position(410,240),before=h.svg.viewBox;
    assert(h.wheel(-120));assert(h.canvas.getZoom()>1);assert.notEqual(h.svg.viewBox,before);
    const after=h.position(410,240);assert(Math.abs(after.x-anchor.x)<1e-8);assert(Math.abs(after.y-anchor.y)<1e-8);
    h.wheel(120);assert(Math.abs(h.canvas.getZoom()-1)<1e-10);
    h.wheel(100000);assert.equal(h.canvas.getZoom(),.25);
    h.wheel(-100000);assert.equal(h.canvas.getZoom(),6);
  }
});

test('resize handles expose a large pointer target and selected dimension',()=>{
 const canvas=fs.readFileSync(require('node:path').join(__dirname,'../dist/canvas-ui.js'),'utf8');
 const css=fs.readFileSync(require('node:path').join(__dirname,'../dist/canvas.css'),'utf8');
 assert(canvas.includes('class="handle-hit"'));
 assert(canvas.includes('class="handle-value"'));
 assert(css.includes('.resize-handle{cursor:grab;touch-action:none}'));
});

test('whole-design drag scales body and flaps proportionally without scaling paper',()=>{
 const t=G.templates.find(t=>t.kind==='envelope'),p=G.defaults(t);
 const next=M.scaleDrag(t,p,1.2,0);
 for(const key of ['w','h','top','bottom','left','right','corner'])assert(Math.abs(next[key]-p[key]*1.2)<.0001,key);
 assert.equal(next.paperW,p.paperW);
 assert.equal(next.paperH,p.paperH);
 assert.equal(next.thickness,p.thickness);
 assert.deepEqual(G.validate(t,next),[]);
});
test('Easy Mode uses paper-frame inverse scale handle, not flap-only handles',()=>{
 const source=fs.readFileSync(require('node:path').join(__dirname,'../dist/canvas-ui.js'),'utf8');
 assert(source.includes('const handles=[overall]'));
 assert(source.includes("M.scaleDrag(scene.t,d.start,1/ratio,snap)"));
});
