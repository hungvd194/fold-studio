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

test('beginner guidance and mobile navigation are wired',()=>{
  assert(html.includes('id="easyHint"'));
  assert(js.includes('hintText'));
  assert(js.includes('matchMedia'));
  assert(js.includes("getElementById('tab-size')"));
});
test('advanced controls remain accessible after switching modes',()=>{
  assert(js.includes("setMode('advanced')"));
  assert(js.includes("setMode('easy')"));
  assert(css.includes('.mode-easy #tab-geometry'));
});

test('guided next action and context panel are wired',()=>{
  assert(html.includes('id="easyGuide"'));
  assert(html.includes('id="easyNext"'));
  assert(js.includes("const next=document.getElementById('easyNext')"));
  assert(js.includes("next.addEventListener('click'"));
});

test('Rotate remains available in Easy Mode via Arrange',()=>{
  assert(!css.includes('.mode-easy #tab-geometry,.mode-easy #tab-arrange,.mode-easy #tab-more{display:none}'));
  assert(css.includes('.mode-easy #tab-arrange{display:inline-flex}'));
  assert(js.includes("'tab-arrange'"));
});
