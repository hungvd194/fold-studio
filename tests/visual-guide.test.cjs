'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const FoldVisual=require('../dist/visual-guide.js');
const Geometry=require('../dist/geometry.js');
test('every template has a complete illustrated folding sequence',()=>{
 for(const t of Geometry.templates){
  const p=Geometry.defaults(t),steps=FoldVisual.steps(t.kind);
  assert(steps.length>=3,t.kind+' missing instructions');
  assert(steps.every(s=>s.title&&s.description));
  for(let i=0;i<steps.length;i++){
   const svg=FoldVisual.preview(t.kind,p,i);
   assert(svg.startsWith('<svg'),t.kind);
   assert(svg.includes('aria-label="Illustrative '),t.kind);
   assert(svg.endsWith('</svg>'),t.kind);
   assert(!svg.includes('NaN'),t.kind);
  }
 }
});
test('preview is illustrative and cannot change dimensions',()=>{
 const t=Geometry.templates[0],p=Geometry.defaults(t),before=JSON.stringify(p);
 FoldVisual.preview(t.kind,p,4);
 assert.equal(JSON.stringify(p),before);
});
test('app loads visual guide before handlers and includes accessible controls',()=>{
 const html=fs.readFileSync(path.join(__dirname,'../dist/index.html'),'utf8');
 const app=fs.readFileSync(path.join(__dirname,'../dist/app.js'),'utf8');
 assert(html.indexOf('visual-guide.js')<html.indexOf('src="app.js"'));
 assert(app.includes("FoldVisual.steps(kind)"));
 assert(app.includes("aria-current=\"step\""));
 assert(app.includes('foldGuideBack'));
 assert(app.includes('foldGuideNext'));
});
