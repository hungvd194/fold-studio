'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const dist=path.join(__dirname,'../dist');
const html=fs.readFileSync(path.join(dist,'index.html'),'utf8');
const css=fs.readFileSync(path.join(dist,'easy-mode.css'),'utf8');
const js=fs.readFileSync(path.join(dist,'easy-mode.js'),'utf8');

test('Easy Mode assets and four steps are present',()=>{
  assert(html.includes('href="easy-mode.css"'));
  assert(html.includes('src="easy-mode.js"'));
  assert.equal((html.match(/data-easy-step="[1-4]"/g)||[]).length,4);
});
test('viewport shell reserves only one compact navigation row',()=>{
  assert(css.includes('grid-template-rows:60px 38px minmax(0,1fr)'));
  assert(css.includes('height:38px'));
  assert(css.includes('.workspace{') || css.includes('.workspace{\n'));
});
test('step navigation stays inside the inspector',()=>{
  assert(!js.includes('scrollIntoView'));
  assert(js.includes('scrollParent.scrollTop'));
  assert(js.includes("getElementById('tab-background')"));
  assert(js.includes("getElementById('tab-sheet')"));
});
test('mode switch does not mutate design geometry',()=>{
  assert(!js.includes('FoldGeometry'));
  assert(!js.includes('G.fitDesign'));
  assert(js.includes('aria-pressed'));
});
