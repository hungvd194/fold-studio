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
  assert.match(html,/href="easy-mode.css"/);
  assert.match(html,/src="easy-mode.js"/);
  assert.equal((html.match(/data-easy-step="[1-4]"/g)||[]).length,4);
});
test('viewport shell reserves only one compact navigation row',()=>{
  assert.match(css,/grid-template-rows:60px 38px minmax\\(0,1fr\\)/);
  assert.match(css,/height:38px/);
  assert.match(css,/\\.workspace\\{min-height:0!important/);
});
test('step navigation does not scroll the full workspace',()=>{
  assert.doesNotMatch(js,/scrollIntoView/);
  assert.match(js,/scrollParent\\.scrollTop/);
  assert.match(js,/getElementById\\('artTool'\\)/);
});
test('mode switch does not mutate design state',()=>{
  assert.doesNotMatch(js,/FoldGeometry|G\.fitDesign|p\s*=/);
  assert.match(js,/aria-pressed/);
});
