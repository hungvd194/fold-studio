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
test('viewport shell accounts for added navigation rows',()=>{
  assert.match(css,/grid-template-rows:60px auto auto minmax\(0,1fr\)/);
  assert.match(css,/body\.mode-advanced\{grid-template-rows:60px auto minmax\(0,1fr\)/);
  assert.match(css,/\.workspace\{min-height:0!important/);
});
test('mode switch does not mutate design state',()=>{
  assert.doesNotMatch(js,/FoldGeometry|G\.fitDesign|p\s*=/);
  assert.match(js,/aria-pressed/);
});
